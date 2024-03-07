const { Participant, Chat, Conversation, User } = require("../models");
const { Op, Sequelize } = require("sequelize")
class SocketServer {
  constructor() {
    this.constants = require("../helpers/constants");
    this.messages = require("../messages/chat.messages");
  }

  // handle conversation messages
  async handleMessageEvent(io, socket, messageObj, users) {
    try {
      // get active user from users array
      const user = users.find((user) => user.id === socket.id);

      const receiverParticipantUID = await Participant.findOne({
        where: {
          user_id: { [Op.ne]: user.user_id },
          conversation_id: messageObj.conversationId
        }
      })

      // get receiver from users array
      const receiver = users.find((user) => user.user_id === receiverParticipantUID.user_id);

      // chat object
      const chatObj = { conversation_id: messageObj.conversationId, sender_id: user.user_id, content: messageObj.message }

      // create chat
      await Chat.create(chatObj);

      const chatList = await Chat.findAll({
        where: {
          conversation_id: messageObj.conversationId
        },
        include: {
          model: User,
          as: this.constants.DATABASE.CONNECTION_REF.SENDER,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
        },
      });

      // emit to user if receiver is online
      if (receiver) {
        io.to(receiver.id).emit(this.constants.SOCKET.EVENTS.CHAT_LIST, { chat: chatList });
      }

      // emit to logged-in user
      io.to(user.id).emit(this.constants.SOCKET.EVENTS.CHAT_LIST, { chat: chatList });
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.SEND_MESSAGE_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.SEND_MESSAGE_ERROR
      })
    }
  }

  async handleDisconnectEvent(io, socket, users) {
    try {
      // get active user from users array
      const currentUserIndex = users.findIndex((user) => user.id === socket.id);

      // remove user from users array
      if (currentUserIndex !== -1) {
        users.splice(currentUserIndex, 1);
        console.log("User disconnected. Remaining users:", users);
      }
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.DISCONNECTION_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.DISCONNECTION_ERROR
      })
    }
  }

  // handle get conversation list
  async handleGetConversationList(io, socket, users) {
    try {
      const user = users.find((user) => user.id === socket.id);
      let conversationsData = [];
      const userParticipatedChats = await Participant.findAll({
        where: {
          user_id: user.user_id,
        }
      });

      const conversationIds = userParticipatedChats.map((participant) => {
        return participant.conversation_id
      })

      if (!conversationIds.length) {
        io.to(socket.id).emit(this.constants.SOCKET.EVENTS.CONVERSATION_LIST, { conversationList: [] });
        return
      }
      const conversationList = await conversationIds.map(async (conversationId) => {
        // get last chat
        const chats = await Chat.findAll({
          where: {
            conversation_id: conversationId
          },
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.CHAT.SENDER_ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.CHAT.CONTENT,
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT
          ],
          order: [
            [
              this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT, this.constants.DATABASE.COMMON_QUERY.ORDER.DESC
            ]
          ],
          limit: 1,
        });

        // if not any chat found then don't send conversation
        if (!chats.length) return

        // get user details
        const userDetails = await Participant.findOne({
          where: {
            conversation_id: conversationId
          },
          include: [
            {
              model: User,
              attributes: [
                this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
                this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
                this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
              ],
              as: this.constants.DATABASE.CONNECTION_REF.USER,
              where: {
                id: {
                  [Sequelize.Op.ne]: user.user_id
                }
              },
            },
          ],
          attributes: [],
        });

        // push conversation details
        conversationsData.push({
          conversationDetails: {
            id: conversationId
          },
          user: userDetails.user,
          chats: chats[0]
        })
      })

      await Promise.all(conversationList);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.CONVERSATION_LIST, { conversationList: conversationsData });
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.CONVERSATION_LIST_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.CONVERSATION_LIST_ERROR
      });
    }
  }

  async handleStartConversation(io, socket, users, conversationObj) {
    try {
      const user = users.find((user) => user.id === socket.id);
      const isGroupChat = conversationObj.isGroupChat
      if (!isGroupChat) {
        // create conversation if does not exist for single user
        await this.createTwoUserConversation(conversationObj, user);
        return;
      } else {
        // create conversation if does not exist for group
        await this.createGroupConversation(conversationObj, user);
        return;
      }
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.CONVERSATION_LIST_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.CONVERSATION_LIST_ERROR
      });
    }
  }

  // handle get single conversation chat list
  async handleGetChatList(io, socket, conversation) {
    try {
      // const user = users.find((user) => user.socket_id === socket.id);
      const chatList = await Chat.findAll({
        where: {
          conversation_id: conversation.conversationId
        },
        attributes: [this.constants.DATABASE.TABLE_ATTRIBUTES.CHAT.CONTENT, this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT],
        include: {
          model: User,
          as: this.constants.DATABASE.CONNECTION_REF.SENDER,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
        },
        order: [[this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT, this.constants.DATABASE.COMMON_QUERY.ORDER.DESC]],
      })
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.GET_SINGLE_CONVERSATION_CHAT, { chats: chatList });
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.CONVERSATION_LIST_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.CONVERSATION_LIST_ERROR
      });
    }
  }

  async createTwoUserConversation(conversationObj, user) {
    // find user participant 
    const existingUserParticipant = await User.findOne({
      where: {
        id: conversationObj.conversationParticipantId,
      },
    })

    // if user participant does not exist
    if (!existingUserParticipant) {
      return
    }

    // conversation username
    const conversationName = user.user_name + "-" + conversationObj.conversationParticipantName;
    const reversedConversationName = conversationObj.conversationParticipantName + "-" + user.user_name;

    const existingConversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { conversation_name: conversationName },
          { conversation_name: reversedConversationName },
        ],
      },
    });

    // if conversation already exist
    if (existingConversation) {
      return
    }

    // new conversation object
    const conversationRecordObj = {
      conversation_name: conversationName,
      description: "",
      conversation_creator_id: user.user_id
    }

    // create conversation
    const conversation = await Conversation.create(conversationRecordObj);

    // create participants
    const participantRecordsArray =
      [
        {
          conversation_id: conversation.id,
          user_id: user.user_id
        },
        {
          conversation_id: conversation.id,
          user_id: conversationObj.conversationParticipantId
        }
      ]
    await Participant.bulkCreate(participantRecordsArray);
  }

  async createGroupConversation(conversationObj, user) {
    // new conversation object
    const conversationRecordObj = {
      conversation_name: conversationObj.conversationName,
      description: conversationObj.conversationDescription,
      conversation_creator_id: user.user_id
    }
    await Conversation.create(conversationRecordObj);
  }

}

module.exports = new SocketServer();