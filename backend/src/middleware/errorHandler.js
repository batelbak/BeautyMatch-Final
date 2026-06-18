const { fail } = require('../utils/response');
const notFound = (req, res) =>
  fail(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err);
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 400, 'VALIDATION_ERROR', err.message, {
      fields: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err.status && err.code) {
    return fail(res, err.status, err.code, err.message, err.details || {});
  }
  return fail(res, 500, 'INTERNAL_ERROR', err.message || 'Unexpected server error');
};
module.exports = { notFound, errorHandler };
