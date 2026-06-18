const ok = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({
    success: false,
    data: null,
    error: { code, message, details },
  });

module.exports = { ok, fail };
