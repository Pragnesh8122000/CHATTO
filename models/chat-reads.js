'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatRead extends Model {
    static associate(models) {

      // ChatRead belongs to Conversation
      this.belongsTo(models.Conversation, {
        foreignKey: 'conversation_id',
        as: 'cnv'
      });

      // ChatRead belongs to User
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'read_by_user'
      });

      // ChatRead belongs to Participant
      this.belongsTo(models.Participant, {
        foreignKey: 'participant_id',
        as: 'read_by_participant'
      });

      // ChatRead belongs to Chat
      this.belongsTo(models.Chat, {
        foreignKey: 'chat_id',
        as: 'chat_read'
      });
      
    }
  }
  ChatRead.init({
    conversation_id: DataTypes.INTEGER,
    chat_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    participant_id: DataTypes.INTEGER,
    read_timestamp: DataTypes.DATE
  }, {
    sequelize,
    timestamps: false,
    modelName: 'ChatRead',
  });
  return ChatRead;
};
