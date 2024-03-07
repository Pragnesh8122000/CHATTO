const crypto = require('crypto');
const util = require('util');
const randomBytesAsync = util.promisify(crypto.randomBytes);
const { Participant, Conversation, User } = require("../models");
const { Op } = require("sequelize");


exports.generateUserCode = async () => {
  const length = 6;
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  let userCode = "";

  const buffer = await randomBytesAsync(length);

  for (let i = 0; i < length; i++) {
    userCode += charset[buffer[i] % charset.length];
  }
  return userCode;
};

exports.createTwoUserConversation = async (conversationObj, user) => {
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

  const reqSender = existingUserParticipant.first_name + existingUserParticipant.last_name;
  const reqReceiver = user.user_name;

  // conversation username
  const conversationName = reqSender + "-" + reqReceiver;
  const reversedConversationName = reqReceiver + "-" + reqSender;

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

  return conversation;
}

exports.createGroupConversation = async (conversationObj, user) => {
  // new conversation object
  const conversationRecordObj = {
    conversation_name: conversationObj.conversationName,
    description: conversationObj.conversationDescription,
    conversation_creator_id: user.user_id
  }
  await Conversation.create(conversationRecordObj);
}