let io;
const jwt = require("jsonwebtoken");
const services = require("./services/socket-services")
const validation = require("./validations/socket.validation")
const messages = require("./messages/socket.messages")
const constants = require("./helpers/constants")
const users = [];

class SocketService {

    constructor() {
    }
    static Initialize(server) {

        io = require('socket.io')(server);

        io.on('connection', async (socket) => {

            // constants.SOCKET.EVENTS.CONNECTION, async (socket) => {
            const { token } = socket.handshake.query;
            if (!token) {
                io.to(socket.id).emit(constants.SOCKET.EVENTS.ERROR, { message: messages.allMessages.TOKEN_NOT_FOUND, type: constants.SOCKET.ERROR_TYPE.TOKEN_NOT_FOUND })
                return
            }
            const tokenDecoded = jwt.decode(token);
            const { user_name, user_id } = tokenDecoded;
            // validate handshake query
            let hand_shake_validation = validation.HandShakeValidation.validate({ user_name, user_id });

            if (hand_shake_validation.error) {
                console.log(hand_shake_validation.error.details[0].message);
            } else {
                try {
                    // push the user details into users array
                    users.push({ id: socket.id, user_name, user_id: Number(user_id) });
                    await services.handleGetConversationList(io, socket, users);
                    console.log("USER JOINED ::: ", users);

                    // listen to message event
                    socket.on(constants.SOCKET.EVENTS.MESSAGE, (messageObj) => services.handleMessageEvent(io, socket, messageObj, users));

                    // listen to get conversation list event
                    socket.on(constants.SOCKET.EVENTS.CONVERSATION_LIST, () => services.handleGetConversationList(io, socket, users));

                    // listen to get chat list
                    socket.on(constants.SOCKET.EVENTS.GET_SINGLE_CONVERSATION_CHAT, (conversationObj) => services.handleGetChatList(io, socket, users, conversationObj));

                    // listen to disconnection event
                    socket.on(constants.SOCKET.EVENTS.DISCONNECT, () => services.handleDisconnectEvent(io, socket, users));
                } catch (error) {
                    console.log(error);
                }
            }
        });

        return io;
    }

}

module.exports = { SocketService, io, users };