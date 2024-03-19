const chatRepo = require("./chats-repo")
const conversationRepo = require("./conversation-repo")
const friendsRepo = require("./friends-repo")
const participantRepo = require("./participants-repo")
const userRepo = require("./users-repo")

class BaseRepo {
    constructor() {
        this.chatRepo = new chatRepo()
        this.conversationRepo = new conversationRepo()
        this.friendsRepo = new friendsRepo()
        this.participantRepo = new participantRepo()
        this.userRepo = new userRepo()
    }
}

module.exports = new BaseRepo();