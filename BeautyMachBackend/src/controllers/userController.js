const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Admin, Order, OrderItem, Product } = require('../models');
const { User, Admin, Order, OrderItem, Product } = require('../../models');
const { ok, fail } = require('../utils/response');
exports.register = async (req, res) => {
  try {
    const { name, email, password, skinType, concern } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    if (exists) return fail(res, 400, 'EMAIL_TAKEN', 'Email already registered');
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, skinType, concern });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
    return ok(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 201);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
// בודק קודם בטבלת users, ואם לא נמצא - בטבלת admins
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const okPass = await bcrypt.compare(password, user.password);
      if (!okPass) return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      return ok(res, {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    if (!admin) return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    const okA = await bcrypt.compare(password, admin.password);
    if (!okA) return res.status(401).json({ message: 'Invalid credentials' });
    if (!okA) return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    const token = jwt.sign(
      { id: admin.id, role: 'admin', permissions: admin.permissions },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    return res.json({
    return ok(res, {
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', permissions: admin.permissions },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
const shapeUser = (u) => {
  const j = u.toJSON();
  const parts = String(j.name || '').trim().split(/\s+/);
  j.firstName = parts[0] || '';
  j.lastName = parts.slice(1).join(' ') || '';
  return j;
};
exports.getAll = async (_req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  // Add split firstName/lastName for the frontend.
  const shaped = users.map((u) => {
    const j = u.toJSON();
    const parts = String(j.name || '').trim().split(/\s+/);
    j.firstName = parts[0] || '';
    j.lastName  = parts.slice(1).join(' ') || '';
    return j;
  });
  res.json(shaped);
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    return ok(res, users.map(shapeUser));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  const j = user.toJSON();
  const parts = String(j.name || '').trim().split(/\s+/);
  j.firstName = parts[0] || '';
  j.lastName  = parts.slice(1).join(' ') || '';
  res.json(j);
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found');
    return ok(res, shapeUser(user));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.getUserOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.params.id },
    include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, orders);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found');
    const body = { ...req.body };
    // Derive `name` from firstName/lastName if provided (frontend Settings).
    if ((body.firstName || body.lastName) && !body.name) {
      body.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }
    // The DB column is `name` only — strip the split fields.
    delete body.firstName;
    delete body.lastName;
    // Hash password if it's being changed. Never store plaintext.
    if (body.password) {
      if (String(body.password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
        return fail(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters');
      }
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password; // don't overwrite with empty
      delete body.password;
    }
    await user.update(body);
    const safe = user.toJSON();
    delete safe.password;
    const parts = String(safe.name || '').trim().split(/\s+/);
    safe.firstName = parts[0] || '';
    safe.lastName  = parts.slice(1).join(' ') || '';
    res.json(safe);
    return ok(res, shapeUser(user));
  } catch (e) {
    res.status(500).json({ message: e.message });
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.remove = async (req, res) => {
  const n = await User.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
  try {
    const n = await User.destroy({ where: { id: req.params.id } });
    return ok(res, { deleted: n });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};