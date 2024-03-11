module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('Friends', 'conversation_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Conversations',
        key: 'id'
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Friends', 'conversation_id');
  }
};