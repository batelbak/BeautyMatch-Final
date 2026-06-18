// src/pages/AdminRequestsPanel.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Admin panel component for managing user registration requests.
 * Allows administrators to review, approve, or reject incoming requests.
 */
const AdminRequestsPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    // Fetch registration requests from the API
    const loadRequests = async () => {
        try {
            const res = await api.get('/registration-requests');
            setRequests(res.data.data || res.data || []);
        } catch (error) {
            console.error('Failed to load registration requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    /**
     * Handles approval or rejection actions for a specific request.
     * @param {string|number} id - The request ID.
     * @param {string} status - 'approved' or 'rejected'.
     */
    const handleAction = async (id, status) => {
        let password;
        
        // Prompt for a temporary password if the request is being approved
        if (status === 'approved') {
            password = window.prompt('Set a temporary password for the new user (min 6 chars):');
            if (!password || password.length < 6) return;
        }

        setActionId(id);
        
        try {
            await api.patch(`/registration-requests/${id}`, { status, password });
            await loadRequests();
        } catch (error) {
            alert(error.response?.data?.error?.message || 'Action failed');
        } finally {
            setActionId(null);
        }
    };

    if (loading) return <p>Loading requests…</p>;
    if (!requests.length) return <p>No registration requests yet.</p>;

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            {requests.map((r) => (
                <div key={r.id} style={{
                    border: '1px solid #eee', 
                    borderRadius: 8, 
                    padding: 16,
                    background: r.status === 'pending' ? '#fff8f3' : '#fafafa'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{r.fullName}</strong>
                        <span style={{
                            fontSize: 12, 
                            padding: '2px 10px', 
                            borderRadius: 12,
                            background: r.status === 'pending' ? '#f0dcd4'
                                     : r.status === 'approved' ? '#cfe9cf' : '#f3c9c9'
                        }}>
                            {r.status}
                        </span>
                    </div>
                    
                    <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
                        {r.email} {r.phone && `· ${r.phone}`}
                    </div>
                    
                    {r.message && <p style={{ marginTop: 8, fontSize: 14 }}>{r.message}</p>}
                    
                    <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                        {new Date(r.createdAt).toLocaleString()}
                    </div>

                    {r.status === 'pending' && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <button 
                                disabled={actionId === r.id}
                                onClick={() => handleAction(r.id, 'approved')}
                                style={{ 
                                    padding: '8px 16px', 
                                    background: '#111', 
                                    color: '#fff',
                                    border: 'none', 
                                    borderRadius: 4, 
                                    cursor: 'pointer' 
                                }}
                            >
                                Approve
                            </button>
                            <button 
                                disabled={actionId === r.id}
                                onClick={() => handleAction(r.id, 'rejected')}
                                style={{ 
                                    padding: '8px 16px', 
                                    background: '#fff', 
                                    color: '#111',
                                    border: '1px solid #111', 
                                    borderRadius: 4, 
                                    cursor: 'pointer' 
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminRequestsPanel;