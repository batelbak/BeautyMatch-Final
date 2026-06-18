// src/middleware/logger.js

/**
 * Global Logger Middleware
 * Records basic information about every incoming request to the server console.
 */
const logger = (req, res, next) => {
    // 1. Record the date and time of the request
    const timestamp = new Date().toISOString();

    // 2. Extract HTTP method and requested URL/path
    const { method, url } = req;

    // We listen for the 'finish' event to capture the final response status code[cite: 1]
    res.on('finish', () => {
        const statusCode = res.statusCode; // Response status code (e.g., 200, 404, 403)[cite: 1]

        // Print request details to the server console as required[cite: 1]
        console.log(`[${timestamp}] ${method} ${url} - Status: ${statusCode}`);
    });

    // Move to the next middleware or route handler[cite: 1]
    next();
};

module.exports = logger;