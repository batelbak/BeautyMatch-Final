import React, { useEffect, useState } from 'react';
import api from '../services/api';

const getStoredUser = () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    try {
        const parsed = JSON.parse(userString);
        return parsed?.user || parsed;
    } catch (err) {
        console.error('Failed to parse user data from localStorage:', err);
        return null;
    }
};

const getUserId = (user) => user?.userId || user?._id || user?.id || null;

const saveUserLocally = (updatedUser) => {
    const currentUser = getStoredUser() || {};
    const updatedId = getUserId(updatedUser) || getUserId(currentUser);

    const nextUser = {
        ...currentUser,
        ...updatedUser,
        userId: updatedId,
        _id: updatedId,
        id: updatedId,
    };

    localStorage.setItem('user', JSON.stringify(nextUser));
    window.dispatchEvent(new Event('user-changed'));
};

const pageStyles = {
    page: {
        minHeight: 'calc(100vh - 180px)',
        padding: '48px 20px 72px',
        background: '#f7f2ee',
        color: '#1f1a17',
    },
    shell: {
        width: 'min(760px, 100%)',
        margin: '0 auto',
    },
    title: {
        margin: '0 0 10px',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '42px',
        fontWeight: 400,
        letterSpacing: '0.02em',
    },
    subtitle: {
        margin: '0 0 30px',
        maxWidth: 520,
        color: '#756b64',
        fontSize: '15px',
        lineHeight: 1.7,
    },
    form: {
        display: 'grid',
        gap: '22px',
        padding: '34px',
        border: '1px solid #ded4cc',
        background: '#fffaf7',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
    },
    field: {
        display: 'grid',
        gap: '8px',
    },
    label: {
        fontSize: '12px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#5f554f',
    },
    input: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '13px 14px',
        border: '1px solid #c9bdb4',
        borderRadius: 0,
        background: '#fff',
        color: '#1f1a17',
        fontSize: '16px',
        outline: 'none',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        paddingTop: '8px',
    },
    message: {
        margin: 0,
        fontSize: '14px',
    },
    button: {
        minWidth: 170,
        padding: '14px 24px',
        border: '1px solid #1f1a17',
        background: '#1f1a17',
        color: '#fff',
        fontSize: '12px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        cursor: 'pointer',
    },
    buttonDisabled: {
        opacity: 0.55,
        cursor: 'not-allowed',
    },
};

const SettingsPage = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const load = async () => {
            const storedUser = getStoredUser();
            const userId = getUserId(storedUser);

            try {
                if (!userId) {
                    setError('You must be logged in');
                    return;
                }

                const res = await api.get('/users');
                const users = res.data.data || res.data || [];
                const currentUser = users.find((u) => String(getUserId(u)) === String(userId));
                const data = currentUser || storedUser || {};

                setForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                });

                if (currentUser) saveUserLocally(currentUser);
            } catch (err) {
                setForm({
                    firstName: storedUser?.firstName || '',
                    lastName: storedUser?.lastName || '',
                    email: storedUser?.email || '',
                });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setSuccess('');
        setError('');
    };

    const validate = () => {
        if (!form.firstName || form.firstName.trim().length < 2) return 'First name must be at least 2 characters';
        if (!form.lastName || form.lastName.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Invalid email format';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const currentUser = getStoredUser();
        const userId = getUserId(currentUser);

        if (!userId) {
            setError('You must be logged in');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
            };

            // Same logic as AdminDashboard: update the real user record by ID.
            const currentUser = getStoredUser();
                const res = await api.put(`/users/${userId}`, payload, {
                    headers: {
                        'x-user-role': currentUser?.userRole || 'customer',
                        'x-user-id': userId
                    }
                });
            const updatedUser = res.data.data || res.data || { ...currentUser, ...payload };
            setForm({
                firstName: updatedUser.firstName || payload.firstName,
                lastName: updatedUser.lastName || payload.lastName,
                email: updatedUser.email || payload.email,
            });

            saveUserLocally({ ...updatedUser, ...payload });
            setSuccess('Settings saved successfully!');
        } catch (err) {
            console.error('Save error:', err.response?.data || err);
            setError(err.response?.data?.error?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main style={pageStyles.page}>
                <section style={pageStyles.shell}>
                    <h1 style={pageStyles.title}>Settings</h1>
                    <p style={pageStyles.subtitle}>Loading your account details...</p>
                </section>
            </main>
        );
    }

    return (
        <main style={pageStyles.page}>
            <section style={pageStyles.shell}>
                <h1 style={pageStyles.title}>Settings</h1>
                <p style={pageStyles.subtitle}>Update your account details. Changes are saved to your user profile and reflected across the site.</p>

                <form onSubmit={handleSubmit} style={pageStyles.form}>
                    <div style={pageStyles.grid}>
                        <label style={pageStyles.field}>
                            <span style={pageStyles.label}>First Name</span>
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                style={pageStyles.input}
                                autoComplete="given-name"
                            />
                        </label>

                        <label style={pageStyles.field}>
                            <span style={pageStyles.label}>Last Name</span>
                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                style={pageStyles.input}
                                autoComplete="family-name"
                            />
                        </label>
                    </div>

                    <label style={pageStyles.field}>
                        <span style={pageStyles.label}>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={pageStyles.input}
                            autoComplete="email"
                        />
                    </label>

                    <div style={pageStyles.actions}>
                        <div>
                            {error && <p style={{ ...pageStyles.message, color: '#b42318' }}>{error}</p>}
                            {success && <p style={{ ...pageStyles.message, color: '#16703c' }}>{success}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{ ...pageStyles.button, ...(saving ? pageStyles.buttonDisabled : {}) }}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default SettingsPage;
