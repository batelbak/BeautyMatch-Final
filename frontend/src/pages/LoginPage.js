// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/**
 * LoginPage component.
 * Handles user authentication, saves session data to localStorage,
 * and triggers global state synchronization.
 */
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Authenticates the user and sets local storage session.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/users/login', { email, password });
            
            // Standardize user object parsing from various response structures
            const source = res.data?.user || res.data?.data?.user || res.data?.data || res.data || {};

            // Handle name splitting if provided as a single string
            const fullName = source.fullName || source.name || source.displayName || '';
            const [firstFromFull = '', ...restName] = String(fullName).trim().split(/\s+/);

            const userToSave = {
                firstName: source.firstName || source.first_name || firstFromFull,
                lastName: source.lastName || source.last_name || restName.join(' '),
                userRole: source.userRole || source.role || source.user_role || 'user',
                email: source.email || email,
                userId: source.userId || source._id || source.id,
                _id: source._id || source.userId || source.id,
                id: source.id || source.userId || source._id,
            };

            // Persist session
            localStorage.setItem('user', JSON.stringify(userToSave));
            
            const token = res.data?.token || res.data?.data?.token || source.token;
            if (token) {
                localStorage.setItem('token', token);
            }

            // Sync app state and navigate to dashboard
            window.dispatchEvent(new Event('user-changed'));
            navigate('/dashboard');
            window.location.reload();

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <h1 className="auth-brand">AI BEAUTY</h1>
                <p className="auth-tag">by batel &amp; sapir</p>

                <form onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    {error && <p className="auth-error">{error}</p>}
                    
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'signing in…' : 'sign in'}
                    </button>
                </form>

                <p style={footerStyle}>
                    don't have an account?{' '}
                    <Link to="/request-access" style={linkStyle}>
                        request access
                    </Link>
                </p>
            </div>
        </div>
    );
};

// --- Styles ---

const footerStyle = {
    textAlign: 'center', 
    marginTop: 24, 
    fontSize: 11, 
    letterSpacing: '0.15em', 
    textTransform: 'uppercase', 
    color: 'var(--muted)' 
};

const linkStyle = {
    color: 'var(--ink)', 
    borderBottom: '1px solid var(--ink)', 
    paddingBottom: 2 
};

export default LoginPage;