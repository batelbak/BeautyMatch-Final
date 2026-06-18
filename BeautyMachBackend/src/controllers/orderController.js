const { sequelize, Order, OrderItem, Product, User } = require('../../models');
const { ok, fail } = require('../utils/response');
exports.getAll = async (_req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, orders);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.getById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
    });
    if (!order) return fail(res, 404, 'NOT_FOUND', 'Order not found');
    return ok(res, order);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
// יוצר הזמנה + פריטים בעסקה אחת. משדר order:new דרך Socket.IO.
exports.create = async (req, res) => {
  const { userId, items, shippingAddress } = req.body;
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
    return ok(res, full, 201);
  } catch (e) {
    await t.rollback();
    return fail(res, 400, 'ORDER_FAILED', e.message);
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return fail(res, 404, 'NOT_FOUND', 'Order not found');
    await order.update({ status: req.body.status });
    const io = req.app.get('io');
    if (io) io.to(`user:${order.userId}`).emit('order:statusUpdate', { orderId: order.id, status: order.status });
    return ok(res, order);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.remove = async (req, res) => {
  try {
    const n = await Order.destroy({ where: { id: req.params.id } });
    return ok(res, { deleted: n });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};