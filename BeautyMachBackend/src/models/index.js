const sequelize = require('../config/database');
const User = require('./User');
const Admin = require('./Admin');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// 1-to-Many: User → Orders
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order → OrderItems
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product → OrderItems
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Many-to-Many: User ↔ Product through OrderItems (via Orders)
User.belongsToMany(Product, {
  through: { model: OrderItem, unique: false },
  foreignKey: 'userId',
  otherKey: 'productId',
  as: 'purchasedProducts',
});
Product.belongsToMany(User, {
  through: { model: OrderItem, unique: false },
  foreignKey: 'productId',
  otherKey: 'userId',
  as: 'buyers',
});

module.exports = { sequelize, User, Admin, Product, Order, OrderItem };
