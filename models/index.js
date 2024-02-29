'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { Client } = require("pg")
const process = require('process');
const basename = path.basename(__filename);
const env = 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
// sequelize = new Sequelize(config.database, config.username, config.password, config);

// Use the built-in Sequelize.postgres dialect
sequelize = new Sequelize({
  dialect: 'postgres',
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  port: config.port,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
