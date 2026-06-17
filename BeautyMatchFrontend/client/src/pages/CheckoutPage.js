// src/pages/CheckoutPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

/**
 * CheckoutPage component.
 * Manages order processing, shipping/payment details collection,
 * and API submission for finalizing orders.
 */
const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        fullName: '',
        address: '',
        city: '',
        phone: '',
    });

    const total = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    /**
     * Submits order data to the server and handles navigation upon success.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation check
        const requiredFields = ['cardNumber', 'cardName', 'expiry', 'cvv', 'fullName', 'address', 'city', 'phone'];
        const isFormValid = requiredFields.every(field => form[field].trim() !== '');

        if (!isFormValid) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/orders', {
                items: cart,
                total: total,
                customerDetails: form
            });

            clearCart();
            navigate('/order-success');
        } catch (err) {
            console.error("Failed to place order:", err);
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ padding: 60, textAlign: 'center' }}>
                <h2>Your cart is empty</h2>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={buttonStyle}
                >
                    continue shopping
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Checkout Form */}
            <form onSubmit={handleSubmit}>
                <h2 style={sectionTitle}>payment details</h2>
                <input name="cardNumber" placeholder="Card Number" value={form.cardNumber} onChange={handleChange} style={inputStyle} />
                <input name="cardName" placeholder="Name on Card" value={form.cardName} onChange={handleChange} style={inputStyle} />
                <div style={{ display: 'flex', gap: 12 }}>
                    <input name="expiry" placeholder="MM/YY" value={form.expiry} onChange={handleChange} style={inputStyle} />
                    <input name="cvv" placeholder="CVV" value={form.cvv} onChange={handleChange} style={inputStyle} />
                </div>

                <h2 style={{ ...sectionTitle, margin: '32px 0 24px' }}>shipping address</h2>
                <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} style={inputStyle} />
                <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={inputStyle} />
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} style={inputStyle} />
                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={inputStyle} />

                {error && <p style={{ color: '#c45c5c', fontSize: 12, marginTop: 12 }}>{error}</p>}

                <button type="submit" disabled={loading} style={checkoutButtonStyle}>
                    {loading ? 'processing…' : `pay $${total.toFixed(2)}`}
                </button>
            </form>

            {/* Order Summary */}
            <div style={{ background: '#faf6f2', padding: 24 }}>
                <h2 style={sectionTitle}>order summary</h2>
                {cart.map((item, idx) => (
                    <div key={item._id || item.id || idx} style={summaryRowStyle}>
                        <span style={{ fontSize: 13 }}>
                            {item.name} × {item.quantity || 1}
                        </span>
                        <span style={{ fontSize: 13 }}>
                            ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                        </span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 600 }}>
                    <span>TOTAL</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

// --- Styles ---

const containerStyle = {
    maxWidth: 900,
    margin: '60px auto',
    padding: 20,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 40,
};

const sectionTitle = {
    fontSize: 14,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: 24,
};

const inputStyle = {
    width: '100%',
    padding: '10px 0',
    border: 'none',
    borderBottom: '1px solid #e5ddd3',
    background: 'transparent',
    marginBottom: 12,
    fontSize: 14,
    outline: 'none',
};

const buttonStyle = {
    marginTop: 20,
    padding: '12px 24px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    fontSize: 12,
};

const checkoutButtonStyle = {
    ...buttonStyle,
    width: '100%',
    padding: 14,
    marginTop: 24,
};

const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e5ddd3',
};

export default CheckoutPage;