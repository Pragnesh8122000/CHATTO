const { Conversation, Participant, Chat, User } = require("../models");
const { Op } = require("sequelize");
class ChatController {
  constructor() {
    this.messages = require("../messages/chat.messages");
    this.constants = require("../helpers/constants");
  }
  getChatRequest = async (req, res) => {
    try {
      const { chatName } = req.query;
      // get the conversation by conversation name
      let conversation = await Conversation.findOne({
        where: {
          conversation_name: chatName,
        },
      });
      // If conversation is not found
      if (!conversation) {
        // new conversation object
        const conversationObj = {
          conversation_name: chatName,
          description: "",
          conversation_creator_id: req.currentUser.user_id,
        };
        // create new conversation
        const newConversation = await Conversation.create(conversationObj);
        conversation = newConversation;
      }
      // participant object
      const participantObj = {
        user_id: req.currentUser.user_id,
        conversation_id: conversation.id,
      };
      // create new participant
      await Participant.create(participantObj);
      res.send({
        status: true,
        message: this.messages.allMessages.CHAT_CREATED_SUCCESSFULLY,
        conversation,
      });
    } catch (error) {
      console.log(error);
    }
  };

  getSingleConversationChats = async (req, res) => {
    try {
      const { conversationId } = req.query;
      // const user = users.find((user) => user.socket_id === socket.id);
      const chatList = await Chat.findAll({
        where: {
          conversation_id: conversationId
        },
        attributes: [this.constants.DATABASE.TABLE_ATTRIBUTES.CHAT.CONTENT, this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT],
        include: [{
          model: User,
          as: this.constants.DATABASE.CONNECTION_REF.SENDER,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
        },
        ],
        order: [[this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT, this.constants.DATABASE.COMMON_QUERY.ORDER.ASC]],
      });

      // get message receiver
      const messageReceiver = await Participant.findAll({
        where: {
          conversation_id: conversationId,
        },
        attributes: [],
        include: [{
          model: User,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
          where: {
            id: { [Op.ne]: req.currentUser.user_id }
          },
          as: this.constants.DATABASE.CONNECTION_REF.USER
        },
        ],
      })

      res.status(200).send({
        status: true,
        message: this.messages.allMessages.CHAT_LIST_SUCCESSFULLY,
        chatList,
        conversationId: conversationId,
        messageReceiver: messageReceiver[0].user ?? {},
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: this.messages.allMessages.CONVERSATION_LIST_ERROR,
      });
    }
  }
}

module.exports = new ChatController();
