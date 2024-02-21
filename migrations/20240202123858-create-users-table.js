// in migrations/XXXXXXXXXXXXXX-create-users-table.js 

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING 
      },
      email : {
        type: Sequelize.STRING 
      },
      password: {
        type: Sequelize.STRING
      },
      department_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Departments',
          key: 'id'
        }
      },
      user_code : {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};