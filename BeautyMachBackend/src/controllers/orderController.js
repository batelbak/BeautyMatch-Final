//const fs = require('fs');
//const path = require('path');
//
//// Define the path to the orders data file
//const ordersFilePath = path.join(__dirname, '../data/orders.json');
//
///**
// * Helper functions for reading and writing to the JSON data file
// */
//const getOrdersFromFile = () => JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
//const saveOrdersToFile = (orders) => fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
//
///**
// * Retrieves all orders with a 'pending' status
// */
//const getAllOrders = (req, res) => {
//    const orders = getOrdersFromFile();
//    const list = orders.filter(o => o.status === 'pending');
//    res.json({ success: true, data: list });
//};
//
///**
// * Creates a new order and saves it to the data file
// */
//const createOrder = (req, res) => {
//    const orders = getOrdersFromFile();
//
//    // Standardize the order structure to match warehouse requirements
//    const newOrder = {
//        orderId: Date.now(),
//        customerName: req.body.customerDetails?.fullName || "Guest",
//        customerEmail: "",
//        shippingAddress: {
//            fullName: req.body.customerDetails?.fullName || "",
//            address: req.body.customerDetails?.address || "",
//            city: req.body.customerDetails?.city || "",
//            phone: req.body.customerDetails?.phone || ""
//        },
//        items: req.body.items,
//        total: req.body.total,
//        status: 'pending',
//        createDate: new Date()
//    };
//
//    orders.push(newOrder);
//    saveOrdersToFile(orders);
//
//    res.status(201).json({ success: true, data: newOrder });
//};
//
///**
// * Removes an order by its ID once it has been delivered
// */
//const markDelivered = (req, res) => {
//    let orders = getOrdersFromFile();
//    const id = parseInt(req.params.id);
//
//    // Remove the order from the list
//    orders = orders.filter(o => o.orderId !== id);
//    saveOrdersToFile(orders);
//
//    res.json({ success: true, message: 'Order removed' });
//};
//
///**
// * Retrieves a specific order by its ID
// */
//const getOrderById = (req, res) => {
//    const orders = getOrdersFromFile();
//    const id = parseInt(req.params.id);
//    const order = orders.find(o => o.orderId === id);
//
//    if (!order) {
//        return res.status(404).json({ success: false, message: "Order not found" });
//    }
//
//    res.json({ success: true, data: order });
//};
//
//// Export controller methods
//module.exports = {
//    createOrder,
//    getAllOrders,
//    markDelivered,
//    getOrderById
//};

const { sequelize, Order, OrderItem, Product, User } = require('../models');

exports.getAll = async (_req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
};

exports.getById = async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
  });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
};

// יוצר הזמנה + פריטים בעסקה אחת. משדר order:new דרך Socket.IO.
exports.create = async (req, res) => {
  const { userId, items, shippingAddress } = req.body; // items: [{ productId, quantity }]
  const t = await sequelize.transaction();
  try {
    let total = 0;
    const enriched = [];
    for (const it of items) {
      const product = await Product.findByPk(it.productId, { transaction: t });
      if (!product) throw new Error(`Product ${it.productId} not found`);
      if (product.stock < it.quantity) throw new Error(`Not enough stock for ${product.name}`);
      total += Number(product.price) * it.quantity;
      enriched.push({ productId: product.id, quantity: it.quantity, priceAtPurchase: product.price });
      await product.update({ stock: product.stock - it.quantity }, { transaction: t });
    }

    const order = await Order.create({ userId, total, shippingAddress }, { transaction: t });
    for (const e of enriched) {
      await OrderItem.create({ ...e, orderId: order.id }, { transaction: t });
    }
    await t.commit();

    const full = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
    });

    // 🔌 שידור בזמן אמת לאדמינים/לוגיסטיקה
    const io = req.app.get('io');
    if (io) io.to('staff').emit('order:new', full);

    res.status(201).json(full);
  } catch (e) {
    await t.rollback();
    res.status(400).json({ message: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  await order.update({ status: req.body.status });

  // שידור ללקוח הספציפי
  const io = req.app.get('io');
  if (io) io.to(`user:${order.userId}`).emit('order:statusUpdate', { orderId: order.id, status: order.status });

  res.json(order);
};

exports.remove = async (req, res) => {
  const n = await Order.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
};
