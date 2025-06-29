// models/Form.js
const { DataTypes } = require('sequelize');
const sequelize      = require('../config/database');
const User           = require('./User');
const Bundle         = require('./Bundle');

// 1) Define the Form model first
const Form = sequelize.define('Form', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  guardianCertificateUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bundleId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// 2) Now set up associations *after* Form exists
Form.belongsTo(Bundle, { foreignKey: 'bundleId' });
Bundle.hasMany(Form,   { foreignKey: 'bundleId' });

// And your existing user associations
Form.belongsTo(User, { as: 'submittedBy', foreignKey: 'submittedById' });
Form.belongsTo(User, { as: 'moderator',   foreignKey: 'moderatorId' });

module.exports = Form;
