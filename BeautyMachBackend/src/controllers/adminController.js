const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: admin.id, role: 'admin', permissions: admin.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', permissions: admin.permissions },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    const exists = await Admin.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed, permissions });
    res.status(201).json({ id: admin.id, name: admin.name, email: admin.email, permissions: admin.permissions });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAll = async (_req, res) => {
  const admins = await Admin.findAll({ attributes: { exclude: ['password'] } });
  res.json(admins);
};

exports.remove = async (req, res) => {
  const n = await Admin.destroy({ where: { id: req.params.id } });
  res.json({ deleted: n });
};
