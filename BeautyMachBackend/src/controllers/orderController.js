const { sequelize, Order, OrderItem, Product, User } = require('../models');

// Parse the comma-joined shippingAddress string back into the object shape
// the warehouse dashboard expects: { fullName, address, city, phone, notes }
function parseShippingAddress(raw) {
  if (!raw) return { fullName: '', address: '', city: '', phone: '', notes: '' };
  if (typeof raw === 'object') return raw;
  const parts = String(raw).split(',').map((s) => s.trim());
  const [fullName = '', address = '', city = '', phone = '', ...rest] = parts;
  return { fullName, address, city, phone, notes: rest.join(', ') };
}

// Convert a Sequelize order into the shape the frontend (WarehouseDashboard) uses.
function shapeOrder(order) {
  const o = order.toJSON ? order.toJSON() : order;
  const shipping = parseShippingAddress(o.shippingAddress);
  return {
    orderId: o.id,
    id: o.id,
    status: o.status,
    total: o.total,
    createDate: o.createdAt,
    createdAt: o.createdAt,
    customerName: o.user?.name || shipping.fullName || 'Guest',
    customerEmail: o.user?.email || '',
    shippingAddress: shipping,
    items: (o.items || []).map((it) => ({
      id: it.id,
      productId: it.productId,
      name: it.product?.name || `Product #${it.productId}`,
      quantity: it.quantity,
      price: it.priceAtPurchase,
    })),
  };
}

exports.getAll = async (req, res) => {
  // Logistics dashboard should only see orders that still need to be shipped.
  // Allow ?status=all to fetch everything (e.g. admin views).
  const where = {};
  if (req.query.status && req.query.status !== 'all') {
    where.status = req.query.status;
  } else if (!req.query.status) {
    where.status = ['pending', 'processing', 'shipped'];
  }

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders.map(shapeOrder));
};

exports.getById = async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
  });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(shapeOrder(order));
};

// Creates order + items in a single transaction. Broadcasts order:new via Socket.IO.
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

    const shaped = shapeOrder(full);

    // 🔌 Real-time broadcast to admins/logistics
    const io = req.app.get('io');
    if (io) io.to('staff').emit('order:new', shaped);

    res.status(201).json(shaped);
  } catch (e) {
    await t.rollback();
    res.status(400).json({ message: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  await order.update({ status: req.body.status });

  const io = req.app.get('io');
  if (io) io.to(`user:${order.userId}`).emit('order:statusUpdate', { orderId: order.id, status: order.status });

  res.json(order);
};

// Mark an order as delivered (used by the warehouse "Mark as delivered" button).
exports.markDelivered = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  await order.update({ status: 'delivered' });

  const io = req.app.get('io');
  if (io) io.to(`user:${order.userId}`).emit('order:statusUpdate', { orderId: order.id, status: 'delivered' });

  res.json({ success: true, orderId: order.id, status: 'delivered' });
};

exports.remove = async (req, res) => {
  const n = await Order.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
};
