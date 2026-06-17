// src/pages/RequestAccessPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/**
 * RequestAccessPage component.
 * Manages user registration/signup, validates form input,
 * and persists session data upon successful account creation.
 */
const RequestAccessPage = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    /**
     * Client-side form validation.
     */
    const validate = () => {
        if (!form.firstName.trim() || !form.lastName.trim()) return 'Please enter your full name.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return 'Please enter a valid email address.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        return '';
    };

    /**
     * Handles account creation request.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/users/signup', {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            const source = res.data?.data || res.data?.user || res.data || {};
            const userToSave = {
                firstName: source.firstName || form.firstName,
                lastName: source.lastName || form.lastName,
                userRole: source.userRole || 'customer',
                email: source.email || form.email,
                _id: source.userId || source._id || source.id,
            };
            
            localStorage.setItem('user', JSON.stringify(userToSave));
            
            const token = source.token || res.data?.token;
            if (token) localStorage.setItem('token', token);

            // Trigger state change and redirect
            window.dispatchEvent(new Event('user-changed'));
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error?.message || err.response?.data?.message || 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <h1 className="auth-brand">AI BEAUTY</h1>
                <p className="auth-tag">by batel &amp; sapir</p>

                <form onSubmit={handleSubmit} autoComplete="off">
                    {/* Security: Dummy fields to prevent browser autofill */}
                    <input type="text" name="fake-username" autoComplete="username" style={{ display: 'none' }} />
                    <input type="password" name="fake-password" autoComplete="current-password" style={{ display: 'none' }} />

                    <input
                        className="auth-input"
                        name="firstName"
                        placeholder="first name"
                        value={form.firstName}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />
                    <input
                        className="auth-input"
                        name="lastName"
                        placeholder="last name"
                        value={form.lastName}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />
                    <input
                        className="auth-input"
                        type="email"
                        name="email"
                        placeholder="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        name="password"
                        placeholder="password (min 6 characters)"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={6}
                        required
                    />
                    
                    {error && <p className="auth-error">{error}</p>}
                    
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'creating account…' : 'sign up'}
                    </button>
                </form>

                <p style={footerStyle}>
                    already have an account?{' '}
                    <Link to="/login" style={linkStyle}>
                        sign in
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

export default RequestAccessPage;