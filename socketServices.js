let io;
const jwt = require("jsonwebtoken");
const services = require("./services/socket-services")
const validation = require("./validations/socket.validation")
const messages = require("./messages/socket.messages")
const constants = require("./helpers/constants")
const users = [];

class SocketService {

    constructor() {
        // this.jwt = require("jsonwebtoken");
        // this.services = require("./services/socket-services")
        // this.validation = require("./validations/socket.validation")
        // this.messages = require("./messages/socket.messages")
        // this.constants = require("./helpers/constants")
        // this.users = [];
        // this.server = require('socket.io')(server);
        // this.io = this.server.on(this.constants.SOCKET.EVENTS.CONNECTION, async (socket) => {
        //     const { token } = socket.handshake.query;
        //     if (!token) {
        //         this.io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, { message: this.messages.allMessages.TOKEN_NOT_FOUND, type: this.constants.SOCKET.ERROR_TYPE.TOKEN_NOT_FOUND })
        //         return
        //     }
        //     const tokenDecoded = this.jwt.decode(token);
        //     const { user_name, user_id } = tokenDecoded;
        //     // validate handshake query
        //     let hand_shake_validation = this.validation.HandShakeValidation.validate({ user_name, user_id });

        //     if (hand_shake_validation.error) {
        //         console.log(hand_shake_validation.error.details[0].message);
        //     } else {
        //         try {
        //             // push the user details into users array
        //             this.users.push({ id: socket.id, user_name, user_id: Number(user_id) });
        //             await this.services.handleGetConversationList(this.io, socket, this.users);
        //             console.log("USER JOINED ::: ", this.users);

        //             // listen to message event
        //             socket.on(this.constants.SOCKET.EVENTS.MESSAGE, (messageObj) => this.services.handleMessageEvent(this.io, socket, messageObj, this.users));

        //             // listen to get conversation list event
        //             socket.on(this.constants.SOCKET.EVENTS.CONVERSATION_LIST, () => this.services.handleGetConversationList(this.io, socket, this.users));

        //             // listen to start conversation 
        //             // socket.on(this.constants.SOCKET.EVENTS.START_CONVERSATION, (conversationObj) => this.services.handleStartConversation(this.io, socket, conversationObj));

        //             // listen to get chat list
        //             socket.on(this.constants.SOCKET.EVENTS.GET_SINGLE_CONVERSATION_CHAT, (conversationObj) => this.services.handleGetChatList(this.io, socket, this.users, conversationObj));

        //             // listen to disconnection event
        //             socket.on(this.constants.SOCKET.EVENTS.DISCONNECT, () => this.services.handleDisconnectEvent(this.io, socket, this.users));
        //         } catch (error) {
        //             console.log(error);
        //         }
        //     }
        // });

        // this.http.listen(process.env.SOCKET_SERVER_PORT, function () {
        //     console.log(`socket server is listening on port :${process.env.SOCKET_SERVER_PORT}`);
        // });
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
            // }
            // console.log('A user connected');
        });

        return io;
    }

}

module.exports = SocketService;