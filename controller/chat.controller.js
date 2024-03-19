const { Conversation, Participant, Chat, User, Friend } = require("../models");
const { Op } = require("sequelize");
class ChatController {
  constructor() {
    this.messages = require("../messages/chat.messages");
    this.constants = require("../helpers/constants");
    this.validation = require("../validations/chat.validation");
    this.chatServices = require("../services/chat-services")
    this.repo = require("../repo/repo");
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
          user_id: { [Op.ne]: req.currentUser.user_id }
        },
        // attributes: [],
        include: [{
          model: User,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
          as: this.constants.DATABASE.CONNECTION_REF.USER
        },
        ],
      })

      res.status(200).send({
        status: true,
        message: this.messages.allMessages.CHAT_LIST_SUCCESSFULLY,
        chatList,
        conversationId: conversationId,
        messageReceiver: messageReceiver[0].user ?? null,
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: this.messages.allMessages.CONVERSATION_LIST_ERROR,
      });
    }
  }

  createGroup = async (req, res) => {
    // Validate payload
    let create_group_validation = this.validation.createGroupValidation.validate(req.body);
    if (create_group_validation.error) {
      return res.status(403).send({
        status: false,
        message: create_group_validation.error.details[0].message,
      });
    } else {
      const { groupName, description, participants } = req.body;

      const currentUserId = req.currentUser.user_id

      // create group
      const group = await this.chatServices.createGroup(groupName, description, currentUserId, participants);

      // send response
      res.status(group.statusCode).send(group.resObj);
    }
  }

  addGroupParticipants = async (req, res) => {
    try {
      const { conversationId, participants } = req.body;

      const currentUserId = req.currentUser.user_id

      const participantsLength = participants.length

      // verify if all participants exist in user table and all are friends of group creator
      const verifyAllParticipants = await this.chatServices.verifyAllParticipants(participants, participantsLength, currentUserId);

      if (!verifyAllParticipants.status) {
        return res.status(422).send({
          message: verifyAllParticipants.message,
          status: false
        })
      }

      await this.chatServices.addParticipantsRecords(participants, participantsLength, conversationId)
      // let participantsArray = [];

      // // check if users exist in user model
      // const participantExist = await User.count({
      //   where: {
      //     id: { [Op.in]: participants },
      //   },
      // })

      // // If any participant is not found
      // if (participantExist !== participants.length) {
      //   return res.status(500).send({
      //     message: this.messages.allMessages.GROUP_USER_NOT_EXIST
      //   })
      // }

      // // create participant object and add it in participants array
      // for (let participant = 0; participant < participants.length; participant++) {
      //   // new participant object
      //   const participantObj = {
      //     user_id: participants[participant],
      //     conversation_id: conversationId,
      //   };

      //   // add new participant in participants array
      //   participantsArray.push(participantObj);
      // }

      // // create new participants
      // await Participant.bulkCreate(participantsArray);

      res.send({
        status: true,
        message: this.messages.allMessages.PARTICIPANT_ADDED_SUCCESSFULLY,
      });
    }
    catch (error) {
      console.log(error);
      res.status(500).send({
        message: this.messages.allMessages.ADD_PARTICIPANT_FAILED,
      });
    }
  }

  renameGroup = async (req, res) => {
    // Validate payload
    let rename_group_validation = this.validation.renameGroupValidation.validate(req.body);
    if (rename_group_validation.error) {
      return res.status(403).send({
        status: false,
        message: rename_group_validation.error.details[0].message,
      });
    } else {
      const { conversationId, newGroupName } = req.body;

      const renameGroup = await this.chatServices.renameGroup(conversationId, newGroupName)
      return res.status(renameGroup.statusCode).send(renameGroup.resObj);
    }
  }

  removeParticipants = async (req, res) => {
    // Validate payload
    let remove_participants_validation = this.validation.removeParticipantsValidation.validate(req.body);
    if (remove_participants_validation.error) {
      return res.status(403).send({
        status: false,
        message: remove_participants_validation.error.details[0].message,
      });
    } else {
      const { conversationId, participants } = req.body;

      const currentUserId = req.currentUser.user_id

      const removeParticipants = await this.chatServices.removeParticipants(conversationId, participants, currentUserId)
    }
  }
}

module.exports = new ChatController();