'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Participants extends Model {
    static associate(models) {
      // Participant belongs to Conversation
      this.belongsTo(models.Conversation, { 
        foreignKey: 'conversation_id',
        as: 'conversations'
      });

      // Participant belongs to Chat
      this.belongsTo(models.Chat, { 
        foreignKey: 'conversation_id',
        as: 'participant_chat'
      });

      // Participant belongs to User
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
    }
  }
  Participants.init({
    conversation_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Participant',
  });
  return Participants;
};
