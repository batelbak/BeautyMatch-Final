const { DataTypes } = require('sequelize');
const sequelize = require('../src/config/database');

const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  permissions: {
    // הרשאות בתוך פאנל הניהול (לדוגמה: ניהול מוצרים / ניהול הזמנות)
    type: DataTypes.ENUM('super', 'products', 'orders'),
    defaultValue: 'super',
  },
}, { tableName: 'admins' });

module.exports = Admin;
