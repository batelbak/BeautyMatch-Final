const fs = require('fs');
const path = require('path');
const { ok, fail } = require('../utils/response');
const DATA_FILE = path.join(__dirname, '..', 'data', 'settings.json');
const defaultSettings = {
  username: 'Guest',
  email: 'user@example.com',
  theme: 'light',
  notifications: true,
  language: 'en',
};
function loadAll() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '{}');
  } catch (err) {
    console.error('Failed to read settings file:', err);
    return {};
  }
}
function saveAll(all) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
}
function resolveEmail(req) {
  return (
    req.headers['x-user-email'] ||
    req.query.email ||
    (req.body && req.body.email) ||
    'default@example.com'
  );
}
exports.getSettings = (req, res) => {
  try {
    const email = resolveEmail(req);
    const all = loadAll();
    const settings = all[email] || { ...defaultSettings, email };
    return ok(res, settings);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
exports.updateSettings = (req, res) => {
  try {
    const email = resolveEmail(req);
    const { username, theme, notifications, language } = req.body;
    const all = loadAll();
    const current = all[email] || { ...defaultSettings, email };
    const updated = {
      ...current,
      email,
      ...(username !== undefined && { username }),
      ...(theme !== undefined && { theme }),
      ...(notifications !== undefined && { notifications: !!notifications }),
      ...(language !== undefined && { language }),
    };
    all[email] = updated;
    saveAll(all);
    return ok(res, updated);
  } catch (e) {
    return fail(res, 500, 'INTERNAL_ERROR', e.message);
  }
};
