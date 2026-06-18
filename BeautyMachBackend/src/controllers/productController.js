const { Product } = require('../../models');
const { ok, fail } = require('../utils/response');
exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.skinType) where.skinType = req.query.skinType;
    if (req.query.concern) where.concern = req.query.concern;
    const products = await Product.findAll({ where });
    return ok(res, products);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.getById = async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return fail(res, 404, 'NOT_FOUND', 'Product not found');
    return ok(res, p);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.create = async (req, res) => {
  try {
    const p = await Product.create(req.body);
    return ok(res, p, 201);
  } catch (e) {
    return fail(res, 400, 'VALIDATION_ERROR', e.message);
  }
};
exports.update = async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return fail(res, 404, 'NOT_FOUND', 'Product not found');
    await p.update(req.body);
    return ok(res, p);
  } catch (e) {
    return fail(res, 400, 'VALIDATION_ERROR', e.message);
  }
};
exports.remove = async (req, res) => {
  try {
    const n = await Product.destroy({ where: { id: req.params.id } });
    return ok(res, { deleted: n });
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};