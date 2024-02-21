'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      this.hasMany(models.User, {
        foreignKey: 'department_id',
        as: 'users'
      })
    }
  }
  Department.init({
    department_name: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Department',
  });
  return Department;
};
