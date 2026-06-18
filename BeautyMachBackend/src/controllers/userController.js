const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Admin, Order, OrderItem, Product } = require('../models');
exports.register = async (req, res) => {
  try {
    const { name, email, password, skinType, concern } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, skinType, concern });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const okA = await bcrypt.compare(password, admin.password);
    if (!okA) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: admin.id, role: 'admin', permissions: admin.permissions },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', permissions: admin.permissions },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
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
};
exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  const j = user.toJSON();
  const parts = String(j.name || '').trim().split(/\s+/);
  j.firstName = parts[0] || '';
  j.lastName  = parts.slice(1).join(' ') || '';
  res.json(j);
};
exports.getUserOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.params.id },
    include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
};
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
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
      }
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password; // don't overwrite with empty
    }
    await user.update(body);
    const safe = user.toJSON();
    delete safe.password;
    const parts = String(safe.name || '').trim().split(/\s+/);
    safe.firstName = parts[0] || '';
    safe.lastName  = parts.slice(1).join(' ') || '';
    res.json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
exports.remove = async (req, res) => {
  const n = await User.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
};
