const { DataTypes } = require('sequelize');
const sequelize = require('../src/config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  priceAtPurchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'price_at_purchase' },
}, { tableName: 'order_items' });

module.exports = OrderItem;
