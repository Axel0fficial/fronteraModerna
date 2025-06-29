const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const SupportTicket = sequelize.define('SupportTicket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' }
});

SupportTicket.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = SupportTicket;