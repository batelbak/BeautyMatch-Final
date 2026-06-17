const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  brand: { type: DataTypes.STRING(100) },
  category: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING(500) },
  skinType: { type: DataTypes.STRING(50) },
  concern: { type: DataTypes.STRING(100) },
}, { tableName: 'products' });

module.exports = Product;
