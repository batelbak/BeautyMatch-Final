const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'admin', 'logistics'), defaultValue: 'customer' },
  skinType: { type: DataTypes.STRING(50), allowNull: true },
  concern: { type: DataTypes.STRING(100), allowNull: true },
}, { tableName: 'users' });

module.exports = User;
