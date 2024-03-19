class UserRouter {
  constructor() {
    this.router = require("express").Router();
    this.chatController = require("../controller/chat.controller");
    this.setRoutes();
  }

  setRoutes() {
    this.router.get("/chat", this.chatController.getChatRequest);
    this.router.get("/chat/list", this.chatController.getSingleConversationChats);
    this.router.post("/chat/group/create", this.chatController.createGroup);
    this.router.post("/chat/group/participant/add", this.chatController.addGroupParticipants);
    this.router.post("/chat/group/rename", this.chatController.renameGroup);
  }
}

const router = new UserRouter();
module.exports = router.router;