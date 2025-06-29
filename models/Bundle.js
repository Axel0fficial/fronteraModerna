// models/Bundle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Bundle = sequelize.define('Bundle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('pending','approved','rejected'),
    defaultValue: 'pending'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Who submitted this bundle
Bundle.belongsTo(User, { as: 'submittedBy', foreignKey: 'submittedById' });
// Which moderator reviewed it
Bundle.belongsTo(User, { as: 'moderator',   foreignKey: 'moderatorId' });

module.exports = Bundle;
