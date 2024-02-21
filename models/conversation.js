'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {

      // conversation belongs to creator
      this.belongsTo(models.User, {
        foreignKey: 'conversation_creator_id',
        as: 'creator'
      })
      this.hasMany(models.Chat, {
        foreignKey: 'conversation_id',
        as: 'chats'
      })
      this.hasMany(models.Participant, {
        foreignKey: 'conversation_id',
        as: 'conversations'
      })
    }
  }
  Conversation.init({
    conversation_name: DataTypes.STRING,
    description: DataTypes.STRING,
    conversation_creator_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Conversation',
  });
  return Conversation;
};
