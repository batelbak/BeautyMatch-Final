// src/services/api.js
import axios from 'axios';

/**
 * Axios instance configured for API requests.
 * Includes interceptors for injecting authentication tokens and user context headers.
 */
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor to inject auth and user data into every request
api.interceptors.request.use(
    (config) => {
        // Attach Authorization token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Attach User context
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user?.userRole) config.headers['x-user-role'] = user.userRole;
                if (user?.email)    config.headers['x-user-email'] = user.email;
            } catch (err) {
                console.error('Failed to parse user data from localStorage:', err);
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;