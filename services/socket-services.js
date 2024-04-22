const { Participant, Chat, Conversation, User, ChatRead } = require("../models");
let CryptoJS = require("crypto-js");
const { Op, Sequelize } = require("sequelize")

class SocketServer {
  constructor() {
    this.constants = require("../helpers/constants");
    this.messages = require("../messages/chat.messages");
    this.userServices = require("./user.services")
    this.repo = require("../repo/repo");
  }

  // handle conversation messages
  async handleMessageEvent(io, socket, messageObj, users) {
    try {
      // get active user from users array
      const user = users.find((user) => user.id === socket.id);

      // const userParticipant = await Participant.findOne({
      //   where: {
      //     user_id: user.user_id,
      //     conversation_id: messageObj.conversationId
      //   }
      // })

      const receiverParticipantUID = await Participant.findOne({
        where: {
          user_id: { [Op.ne]: user.user_id },
          conversation_id: messageObj.conversationId
        }
      })
      // Encrypt message
      let cipheredMessage = CryptoJS.AES.encrypt(messageObj.message, `${messageObj.conversationId}`).toString();

      // get receiver from users array
      const receiver = users.find((user) => user.user_id === receiverParticipantUID.user_id);

      // chat object
      const chatObj = { conversation_id: messageObj.conversationId, sender_id: user.user_id, content: cipheredMessage }

      // create chat
      let chat = await Chat.create(chatObj);

      // let newChatRead = await ChatRead.create(chatReadObj);

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
        order: [[this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID, this.constants.DATABASE.COMMON_QUERY.ORDER.DESC]],
        limit: 1
      });

      const OwnUnreadMessages = await this.getUnreadMessages(messageObj.conversationId, user.user_id);

      // emit to user if receiver is online
      if (receiver) {

        const receiversUnreadMessages = await this.getUnreadMessages(messageObj.conversationId, receiver.user_id);
        const newMessageObj = {
          conversationId: messageObj.conversationId,
          senderId: user.user_id,
          username: user.user_name,
          content: cipheredMessage,
          unread_messages_count: receiversUnreadMessages.length,
          createdAt: new Date()
        }
        // io.to(receiver.id).emit(`${this.constants.SOCKET.EVENTS.CHAT_LIST}-${messageObj.conversationId}`, { chat: chatList });
        io.to(receiver.id).emit(`${this.constants.SOCKET.EVENTS.LAST_CHAT}-${messageObj.conversationId}`, { last_chat: chatList[0], unread_messages_count: receiversUnreadMessages.length });
        io.to(receiver.id).emit(this.constants.SOCKET.EVENTS.MESSAGE_NOTIFICATION, { message: newMessageObj });
      }

      // emit to logged-in user
      io.to(user.id).emit(`${this.constants.SOCKET.EVENTS.LAST_CHAT}-${messageObj.conversationId}`, { last_chat: chatList[0], unread_messages_count: OwnUnreadMessages.length });
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
      const user = users[currentUserIndex]
      const userId = user.user_id;
      const currentUserStatus = await this.userServices.getUserById(userId);

      // send active notification to all friends
      if (currentUserStatus.resObj.data.user.status !== "away") {
        // make user status inactive
        await this.userServices.updateUserStatus(userId, this.constants.DATABASE.ENUMS.USER_STATUS.INACTIVE);
        await this.SendActivityNotification(io, socket, users, userId, this.constants.DATABASE.ENUMS.USER_STATUS.INACTIVE);
      }

      // remove user from users array
      if (currentUserIndex !== -1) {
        users.splice(currentUserIndex, 1);
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
                this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME,
                this.constants.DATABASE.TABLE_ATTRIBUTES.USER.STATUS
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

        // get unread messages
        const unreadMessages = await this.getUnreadMessages(conversationId, user.user_id);

        // push conversation details
        conversationsData.push({
          conversationDetails: {
            id: conversationId
          },
          user: userDetails?.user,
          chats: chats[0],
          unreadMessages: unreadMessages.length
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

  async handleReadConversation(io, socket, users, conversationObj) {
    try {
      const user = users.find((user) => user.id === socket.id);
      const conversationId = conversationObj.conversationId;

      // get unread messages
      const UnreadChatList = await this.getUnreadMessages(conversationObj.conversationId, user.user_id);

      // get message receiver
      const userParticipant = await Participant.findOne({
        where: {
          user_id: user.user_id,
          conversation_id: conversationId
        }
      })
      const chatReadArray = [];

      for (let i = 0; i < UnreadChatList.length; i++) {
        const chat = UnreadChatList[i];
        const existingReadChatRecord = await ChatRead.findOne({
          where: {
            chat_id: chat.id,
            participant_id: userParticipant.id
          }
        });

        if (existingReadChatRecord) continue; // Skip to next iteration

        chatReadArray.push({
          conversation_id: Number(conversationObj.conversationId),
          chat_id: chat.id,
          user_id: user.user_id,
          participant_id: userParticipant.id,
          read_timestamp: new Date()
        });
      }
      if (chatReadArray.length) {
        await ChatRead.bulkCreate(chatReadArray);
      }
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.READ_MESSAGE,
        type: this.constants.SOCKET.ERROR_TYPE.READ_MESSAGE_ERROR
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

  async SendActivityNotification(io, socket, users, user_id, status) {
    try {
      const user = users.find((user) => user.id === socket.id);
      const userFriends = await this.repo.friendsRepo.getUserFriends(user_id);

      // get online friends from users friends array
      const filteredFriends = await this.userServices.getFilteredUsersByReqToAndFrom(user, userFriends);
      // get online friends from users array
      const onlineFriends = users.filter(user => filteredFriends.some(friendId => user.user_id === friendId));

      // send notification to online friends
      if (onlineFriends.length > 0) {
        await this.sendActivityNotificationToOnlineFriends(io, onlineFriends,user, status)
      }

    } catch (error) {
      console.log(error);
      return false;
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

  async getUnreadMessages(conversationId, userId) {

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
        as: 'chat_read'
      }]
    });

    return unreadChats || [];
  }

  

  // // get filtered friends in user object in friends array
  // async getFilteredUsersByReqToAndFrom(user, userFriends) {
  //   let receiverUser;
  //   return userFriends.map(friend => {

  //     // get friend plain object
  //     friend = friend.get({ plain: true });
  //     receiverUser = user && friend.req_from.id === user.user_id ? friend.req_to : friend.req_from;
  //     delete friend.req_to;
  //     delete friend.req_from;
  //     return receiverUser.id;
  //   })
  // }

  async sendActivityNotificationToOnlineFriends(io, onlineFriends,user, status ){
    for (let i = 0; i < onlineFriends.length; i++) {
      const onlineFriend = onlineFriends[i];
      io.to(onlineFriend.id).emit(this.constants.SOCKET.EVENTS.ACTIVITY_CHANGE, {
        online: status,
        user_id: user.user_id
      });
    }
  }

}

module.exports = new SocketServer();