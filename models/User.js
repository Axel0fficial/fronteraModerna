const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('visitorUser', 'moderator', 'supportUser', 'admin'), allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false }
});

module.exports = User;
