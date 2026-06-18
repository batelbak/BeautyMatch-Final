const { Op } = require('sequelize');
const { sequelize, Order, OrderItem, Product, User } = require('../../models');
const { ok, fail } = require('../utils/response');

// Helpers ---------------------------------------------------------------
function parseAddress(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return { address: String(raw) }; }
}

function shapeOrder(order) {
  const o = order.toJSON ? order.toJSON() : order;
  const addr = parseAddress(o.shippingAddress);
  return {
    orderId: o.id,
    id: o.id,
    status: o.status,
    total: o.total,
    createDate: o.createdAt,
    createdAt: o.createdAt,
    customerName: o.user ? o.user.name : (addr.fullName || ''),
    customerEmail: o.user ? o.user.email : '',
    shippingAddress: addr,
    items: (o.items || []).map((it) => ({
      id: it.id,
      productId: it.productId,
      name: it.product ? it.product.name : `Product #${it.productId}`,
      quantity: it.quantity,
      price: it.priceAtPurchase,
    })),
  };
}

const FULL_INCLUDE = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
  { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
];

// Controllers -----------------------------------------------------------
// GET /orders  -> warehouse view: only pending / processing (NOT shipped/delivered/cancelled)
exports.getAll = async (req, res) => {
  try {
    // Allow ?all=1 for admin views; default = warehouse pending list
    const showAll = req.query.all === '1' || req.query.all === 'true';
    const where = showAll
      ? {}
      : { status: { [Op.in]: ['pending', 'processing'] } };

    const orders = await Order.findAll({
      where,
      include: FULL_INCLUDE,
      order: [['createdAt', 'DESC']],
    });
    return ok(res, orders.map(shapeOrder));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: FULL_INCLUDE });
    if (!order) return fail(res, 404, 'NOT_FOUND', 'Order not found');
    return ok(res, shapeOrder(order));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

// POST /orders
exports.create = async (req, res) => {
  const { userId, items, shippingAddress } = req.body || {};
  if (!userId || !Array.isArray(items) || items.length === 0) {
    return fail(res, 400, 'BAD_REQUEST', 'userId and items are required');
  }

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

    // Persist shippingAddress as JSON string so the object survives round-trips
    const addrToStore = typeof shippingAddress === 'string'
      ? shippingAddress
      : JSON.stringify(shippingAddress || {});

    const order = await Order.create(
      { userId, total, shippingAddress: addrToStore, status: 'pending' },
      { transaction: t }
    );
    for (const e of enriched) {
      await OrderItem.create({ ...e, orderId: order.id }, { transaction: t });
    }
    await t.commit();

    const full = await Order.findByPk(order.id, { include: FULL_INCLUDE });
    const shaped = shapeOrder(full);

    // 🔌 Real-time push to warehouse / admins
    const io = req.app.get('io');
    if (io) io.to('staff').emit('order:new', shaped);

    return ok(res, shaped, 201);
  } catch (e) {
    await t.rollback();
    return fail(res, 400, 'ORDER_FAILED', e.message);
  }
};

// PATCH /orders/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return fail(res, 404, 'NOT_FOUND', 'Order not found');
    await order.update({ status: req.body.status });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.userId}`).emit('order:statusUpdate', {
        orderId: order.id,
        status: order.status,
      });
      io.to('staff').emit('order:statusUpdate', {
        orderId: order.id,
        status: order.status,
      });
    }
    return ok(res, { orderId: order.id, status: order.status });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

// PATCH /orders/:id/deliver  (warehouse "Mark as delivered")
exports.markDelivered = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return fail(res, 404, 'NOT_FOUND', 'Order not found');

    await order.update({ status: 'delivered' });

    const io = req.app.get('io');
    if (io) {
      io.to('staff').emit('order:delivered', { orderId: order.id });
      io.to(`user:${order.userId}`).emit('order:statusUpdate', {
        orderId: order.id,
        status: 'delivered',
      });
    }
    return ok(res, { orderId: order.id, status: 'delivered' });
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
