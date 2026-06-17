// src/pages/WarehouseDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * WarehouseDashboard component.
 * Provides the logistics team with a real-time view of pending orders,
 * including customer details, items to pick, and delivery status updates.
 */
const WarehouseDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Warehouse';

    // Fetches orders and sorts them by creation date (newest first)
    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get('/orders');
            const list = res.data?.data || res.data || [];

            // Sort: Newest orders first
            list.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
            setOrders(list);
            setError('');
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load pending orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();

        // Poll every 8 seconds for real-time updates
        const intervalId = setInterval(fetchOrders, 8000);

        // Refresh when user returns to the tab
        const onFocus = () => fetchOrders();
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
        };
    }, [fetchOrders]);

    /**
     * Marks an order as delivered via API and updates the local state.
     * Includes an optimistic UI update for better responsiveness.
     */
    const markDelivered = async (orderId) => {
        if (!window.confirm(`Mark order #${orderId} as delivered and remove it from the list?`)) return;

        setBusyId(orderId);
        const previousOrders = orders;

        // Optimistic update
        setOrders((list) => list.filter((o) => o.orderId !== orderId));

        try {
            await api.patch(`/orders/${orderId}/deliver`);
        } catch (err) {
            console.error('Error marking delivered:', err);
            setOrders(previousOrders); // Rollback on failure
            alert('Failed to update order status. Please try again.');
        } finally {
            setBusyId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-US', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div style={styles.wrap} dir="ltr">
            <div style={styles.header}>
                <h1 style={styles.title}>Hello {userName}, orders to pick & ship</h1>
            </div>

            {loading && <p style={styles.muted}>Loading orders…</p>}
            {error && <p style={styles.error}>{error}</p>}

            {!loading && orders.length === 0 && (
                <div style={styles.empty}>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>No open orders right now</p>
                    <p style={styles.muted}>New orders will appear here automatically.</p>
                </div>
            )}

            <div style={styles.grid}>
                {orders.map((order) => (
                    <div key={order.orderId} style={styles.card}>
                        <div style={styles.cardHead}>
                            <div>
                                <div style={styles.orderId}>Order #{order.orderId}</div>
                                <div style={styles.date}>{formatDate(order.createDate)}</div>
                            </div>
                            <span style={styles.badge}>Pending shipment</span>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.label}>Customer</div>
                            <div style={styles.value}>
                                {order.shippingAddress?.fullName || order.customerName}
                                {order.customerEmail && <span style={styles.muted}> · {order.customerEmail}</span>}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.label}>Shipping address</div>
                            <div style={styles.value}>
                                {order.shippingAddress?.address}, {order.shippingAddress?.city}
                            </div>
                            <div style={styles.muted}>Phone: {order.shippingAddress?.phone}</div>
                            {order.shippingAddress?.notes && (
                                <div style={styles.muted}>Notes: {order.shippingAddress.notes}</div>
                            )}
                        </div>

                        <div style={styles.section}>
                            <div style={styles.label}>Items to pick</div>
                            <ul style={styles.itemsList}>
                                {(order.items || []).map((item, idx) => (
                                    <li key={item.id || idx} style={styles.item}>
                                        <span>{item.name}</span>
                                        <span style={styles.qty}>×{item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={styles.footer}>
                            <div style={styles.total}>Total: ${Number(order.total || 0).toFixed(2)}</div>
                            <button
                                onClick={() => markDelivered(order.orderId)}
                                disabled={busyId === order.orderId}
                                style={{
                                    ...styles.deliverBtn,
                                    opacity: busyId === order.orderId ? 0.6 : 1,
                                    cursor: busyId === order.orderId ? 'wait' : 'pointer',
                                }}
                            >
                                {busyId === order.orderId ? 'Updating…' : '✓ Mark as delivered'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Component Styles ---
const styles = {
    wrap: { padding: '32px 40px', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 },
    title: { fontSize: 22, fontWeight: 400, letterSpacing: '0.02em', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
    card: { background: '#fff', border: '1px solid #e5ddd3', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 },
    cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0eae2', paddingBottom: 12 },
    orderId: { fontSize: 15, fontWeight: 600 },
    date: { fontSize: 11, color: '#999', marginTop: 4 },
    badge: { fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', background: '#fff4e0', color: '#a36a00', padding: '4px 10px', borderRadius: 2 },
    section: { borderBottom: '1px solid #faf6f2', paddingBottom: 10 },
    label: { fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 4 },
    value: { fontSize: 13, color: '#1a1a1a' },
    muted: { fontSize: 12, color: '#888' },
    error: { color: '#c45c5c', fontSize: 13, padding: 16 },
    empty: { textAlign: 'center', padding: 80, background: '#faf6f2', border: '1px dashed #e5ddd3' },
    itemsList: { listStyle: 'none', padding: 0, margin: 0 },
    item: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px dotted #f0eae2' },
    qty: { color: '#666', fontWeight: 600 },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 10 },
    total: { fontSize: 14, fontWeight: 600 },
    deliverBtn: { padding: '10px 18px', background: '#1a1a1a', color: '#fff', border: 'none', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' },
};

export default WarehouseDashboard;