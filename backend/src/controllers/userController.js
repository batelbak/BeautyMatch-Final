const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Admin, Order, OrderItem, Product } = require('../../models');
const { ok, fail } = require('../utils/response');

const shapeUser = (user) => {
  const data = user.toJSON ? user.toJSON() : { ...user };

  delete data.password;

  const parts = String(data.name || '').trim().split(/\s+/);
  data.firstName = parts[0] || '';
  data.lastName = parts.slice(1).join(' ') || '';

  return data;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, skinType, concern } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return fail(res, 400, 'EMAIL_TAKEN', 'Email already registered');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      skinType,
      concern,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return ok(
      res,
      {
        token,
        user: shapeUser(user),
      },
      201
    );
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) {
      const okPass = await bcrypt.compare(password, user.password);

      if (!okPass) {
        return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return ok(res, {
        token,
        user: shapeUser(user),
      });
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const okAdminPass = await bcrypt.compare(password, admin.password);

    if (!okAdminPass) {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: 'admin',
        permissions: admin.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return ok(res, {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        permissions: admin.permissions,
      },
    });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.getAll = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    return ok(res, users.map(shapeUser));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return fail(res, 404, 'NOT_FOUND', 'User not found');
    }

    return ok(res, shapeUser(user));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
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

    if (!user) {
      return fail(res, 404, 'NOT_FOUND', 'User not found');
    }

    const body = { ...req.body };

    if ((body.firstName || body.lastName) && !body.name) {
      body.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }

    delete body.firstName;
    delete body.lastName;

    if (body.password) {
      if (String(body.password).length < 6) {
        return fail(
          res,
          400,
          'VALIDATION_ERROR',
          'Password must be at least 6 characters'
        );
      }

      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password;
    }

    await user.update(body);

    return ok(res, shapeUser(user));
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id },
    });

    return ok(res, { deleted });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
