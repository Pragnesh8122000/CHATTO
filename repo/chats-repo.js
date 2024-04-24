// const BaseRepo = require("./repo");
const { User, Chat, ChatRead } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class ChatRepo {
    // class ChatRepo {
    constructor() {
        // super();
    }

    getExistingUsersCount = async (users) => {
        return await User.count({
            where: {
                id: { [Op.in]: users },
            },
        })
    }

    getChatAndUserByChatId = async (chatId) => {
        return await Chat.findOne({
            where: {
                id: chatId
            },
            include: {
                model: User,
                as: constants.DATABASE.CONNECTION_REF.SENDER,
                attributes: [
                    constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
                    constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
                    constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
                ],
            },
        });

    }

    getUnreadMessages = async (conversationId, userId) => {

        const unreadChats = await Chat.findAll({
            where: {
                conversation_id: conversationId,
                '$chat_read.id$': null
            },
            include: [{
                model: ChatRead,
                attributes: [],
                where: {
                    user_id: userId
                },
                required: false,
                as: constants.DATABASE.CONNECTION_REF.CHAT_READ
            }]
        });

        return unreadChats || [];
    }

    getUnreadMessagesCount = async (conversationId, userId) => {
        return await Chat.count({
            where: {
                conversation_id: conversationId,
                '$chat_read.id$': null
            },
            include: [{
                model: ChatRead,
                attributes: [],
                where: {
                    user_id: userId
                },
                required: false,
                as: constants.DATABASE.CONNECTION_REF.CHAT_READ
            }]
        })
    }

    createChat = async (chatObj) => {
        return await Chat.create(chatObj);
    }

    createReadChat = async (chatReadObj) => {
        return await ChatRead.create(chatReadObj);
    }
}


// const chatRepo = 
module.exports = ChatRepo;