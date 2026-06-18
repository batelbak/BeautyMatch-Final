const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../../models');
const { ok, fail } = require('../utils/response');
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    const okPass = await bcrypt.compare(password, admin.password);
    if (!okPass) return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    const token = jwt.sign(
      { id: admin.id, role: 'admin', permissions: admin.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return ok(res, {
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', permissions: admin.permissions },
    });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.create = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    const exists = await Admin.findOne({ where: { email } });
    if (exists) return fail(res, 400, 'EMAIL_TAKEN', 'Admin already exists');
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed, permissions });
    return ok(res, {
      id: admin.id, name: admin.name, email: admin.email, permissions: admin.permissions,
    }, 201);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.getAll = async (_req, res) => {
  try {
    const admins = await Admin.findAll({ attributes: { exclude: ['password'] } });
    return ok(res, admins);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.remove = async (req, res) => {
  try {
    const n = await Admin.destroy({ where: { id: req.params.id } });
    return ok(res, { deleted: n });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
