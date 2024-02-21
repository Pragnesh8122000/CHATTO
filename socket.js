class Socket {
  constructor() {
    this.app = require("express")();
    this.http = require("http").Server(this.app);
    this.jwt = require("jsonwebtoken");
    this.services = require("./services/socket-services")
    this.validation = require("./validations/socket.validation")
    this.messages = require("./messages/socket.messages")
    this.server = require("socket.io")(this.http, {
      cors: {
        origin: "*",
      },
    });
    //   this.messages = require("./helpers/messages")
    this.constants = require("./helpers/constants")
    this.users = [];
    this.io = this.server.on(this.constants.SOCKET.EVENTS.CONNECTION, async (socket) => {
      const { token } = socket.handshake.query;
      if (!token) {
        io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, { message: this.messages.allMessages.TOKEN_NOT_FOUND, type: this.constants.SOCKET.ERROR_TYPE.TOKEN_NOT_FOUND })
        return
      }
      const tokenDecoded = this.jwt.decode(token);
      const { user_name, user_id } = tokenDecoded;
      // validate handshake query
      let hand_shake_validation = this.validation.HandShakeValidation.validate({ user_name, user_id });

      if (hand_shake_validation.error) {
        console.log(hand_shake_validation.error.details[0].message);
      } else {
        try {
          // push the user details into users array
          this.users.push({ id: socket.id, user_name, user_id: Number(user_id) });
          await this.services.handleGetConversationList(this.io, socket, this.users);
          console.log("USER JOINED ::: ", this.users);

          // listen to message event
          socket.on(this.constants.SOCKET.EVENTS.MESSAGE, (messageObj) => this.services.handleMessageEvent(this.io, socket, messageObj, this.users));

          // listen to get conversation list event
          socket.on(this.constants.SOCKET.EVENTS.CONVERSATION_LIST, () => this.services.handleGetConversationList(this.io, socket));

          // listen to start conversation 
          socket.on(this.constants.SOCKET.EVENTS.START_CONVERSATION, (conversationObj) => this.services.handleStartConversation(this.io, socket, conversationObj));

          // listen to get chat list
          socket.on(this.constants.SOCKET.EVENTS.GET_SINGLE_CONVERSATION_CHAT, (conversationObj) => this.services.handleGetChatList(this.io, socket, this.users, conversationObj));

          // listen to disconnection event
          socket.on(this.constants.SOCKET.EVENTS.DISCONNECT, () => this.services.handleDisconnectEvent(this.io, socket, this.users));
        } catch (error) {
          console.log(error);
        }
      }
    });

    this.http.listen(process.env.SOCKET_SERVER_PORT, function () {
      console.log(`socket server is listening on port :${process.env.SOCKET_SERVER_PORT}`);
    });
  }
}
module.exports = new Socket();