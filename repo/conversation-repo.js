const { User, Chat, Conversation } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class ConversationRepo {
    constructor() {

    }

    createConversation = async (conversationObj) => {
        return await Conversation.create(conversationObj);
    }

    renameConversation = async (conversationId, conversationName) => {
        return await Conversation.update({
            conversation_name: conversationName
        }, {
            where: {
                id: conversationId
            }
        })
    }
}

module.exports = ConversationRepo