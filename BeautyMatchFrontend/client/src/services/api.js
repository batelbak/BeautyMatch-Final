import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;

        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const raw = JSON.parse(userStr);
                const user = raw?.user || raw;
                if (user?.role)  config.headers['x-user-role']  = user.role;
                if (user?.id)    config.headers['x-user-id']    = user.id;
                if (user?.email) config.headers['x-user-email'] = user.email;
            } catch (err) {
                console.error('Failed to parse user data:', err);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
