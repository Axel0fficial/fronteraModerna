const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('visitorUser', 'moderator', 'supportUser', 'admin'), allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  age: { type: DataTypes.INTEGER },
  birthday: { type: DataTypes.DATEONLY },
  nationalId: { type: DataTypes.STRING, unique: true },
  passportNumber: { type: DataTypes.STRING, unique: true },
  passportExpiry: { type: DataTypes.DATEONLY },
  nationalIdNumber: { type: DataTypes.STRING, unique: true },
  drivingLicenseNumber: { type: DataTypes.STRING, unique: true },
  drivingLicenseExpiry: { type: DataTypes.DATEONLY },
  parentFirstName:  { type: DataTypes.STRING, allowNull: true },
  parentLastName:   { type: DataTypes.STRING, allowNull: true },
  parentNationalId: { type: DataTypes.STRING, allowNull: true },
});

module.exports = User;
