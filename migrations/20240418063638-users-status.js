'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // add new column of status
    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'inactive',
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // remove new column of status
    await queryInterface.removeColumn('Users', 'status');
  }
};
