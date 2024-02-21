const { Sequelize, DataTypes, Model } = require('sequelize');

let dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123',
    database: 'test-mig'
};

const sequelizeTZ = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
})

const connection = {};

connection.Sequelize = Sequelize;
connection.sequelizeTZ = sequelizeTZ;
connection.Model = Model;
connection.DataTypes = DataTypes;

module.exports = connection