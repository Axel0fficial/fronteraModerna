const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Form = sequelize.define('Form', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pdfUrl: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' }
});

Form.belongsTo(User, { as: 'submittedBy', foreignKey: 'submittedById' });
Form.belongsTo(User, { as: 'moderator', foreignKey: 'moderatorId' });

module.exports = Form;