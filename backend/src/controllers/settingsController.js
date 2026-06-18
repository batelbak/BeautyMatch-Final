// src/controllers/settingsController.js
const fs = require('fs');
const path = require('path');


const DATA_FILE = path.join(__dirname, '..', 'data', 'settings.json');

const defaultSettings = {
    username: 'Guest',
    email: 'user@example.com',
    theme: 'light',
    notifications: true,
    language: 'en'
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
    try {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
    } catch (err) {
        console.error('Failed to write settings file:', err);
    }
}


function resolveEmail(req) {
    return (
        req.headers['x-user-email'] ||
        req.query.email ||
        (req.body && req.body.email) ||
        'default@example.com'
    );
}

/**
 * GET /api/settings
 */
exports.getSettings = (req, res) => {
    const email = resolveEmail(req);
    const all = loadAll();
    const settings = all[email] || { ...defaultSettings, email };

    res.status(200).json({
        success: true,
        data: settings,
        error: null
    });
};

/**
 * PUT /api/settings
 */
exports.updateSettings = (req, res) => {
    const email = resolveEmail(req); // אותו זיהוי כמו ב-GET
    const { username, theme, notifications, language } = req.body;

    const all = loadAll();
    const current = all[email] || { ...defaultSettings, email };

    const updated = {
        ...current,
        email,
        ...(username !== undefined && { username }),
        ...(theme !== undefined && { theme }),
        ...(notifications !== undefined && { notifications: !!notifications }),
        ...(language !== undefined && { language })
    };

    all[email] = updated;
    saveAll(all);

    res.status(200).json({
        success: true,
        data: updated,
        error: null
    });
};
