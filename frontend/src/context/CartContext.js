// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * CartContext provides global state management for the shopping cart.
 * Handles cart persistence, adding/removing items, and drawer toggling.
 */
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    
    /**
     * Helper to generate a unique storage key based on the current user session
     */
    const getCartKey = () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user?.email ? `cart_${user.email}` : 'cart_guest';
    };

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem(getCartKey());
        return saved ? JSON.parse(saved) : [];
    });
    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [toast, setToast] = useState('');

    // Re-sync cart when user session changes
    useEffect(() => {
        const reloadCart = () => {
            const saved = localStorage.getItem(getCartKey());
            setCart(saved ? JSON.parse(saved) : []);
        };
        window.addEventListener('user-changed', reloadCart);
        return () => window.removeEventListener('user-changed', reloadCart);
    }, []);

    // Persist cart to localStorage on every change
    useEffect(() => {
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
    }, [cart]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    /**
     * Adds a product to the cart or increments quantity if it already exists
     */
    const addToCart = (product) => {
        const productId = product._id || product.id || product.productId;
        
        setCart((prev) => {
            if (productId) {
                const existingItem = prev.find((p) => (p._id || p.id || p.productId) === productId);
                if (existingItem) {
                    return prev.map((p) =>
                        (p._id || p.id || p.productId) === productId
                            ? { ...p, quantity: (p.quantity || 1) + 1 }
                            : p
                    );
                }
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showToast(`${product.name || 'Item'} added to cart ✓`);
    };

    /**
     * Removes an item from the cart by its index or product ID
     */
    const removeFromCart = (indexOrId) => {
        setCart((prev) => {
            if (typeof indexOrId === 'number') {
                return prev.filter((_, i) => i !== indexOrId);
            }
            return prev.filter(
                (p) => (p._id || p.id || p.productId) !== indexOrId
            );
        });
    };

    /**
     * Updates the quantity of a specific item
     */
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((p) =>
                (p._id || p.id || p.productId) === id ? { ...p, quantity: quantity } : p
            )
        );
    };

    const clearCart = () => setCart([]);

    // UI Helpers
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen((prev) => !prev);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                setIsCartOpen,
                openCart,
                closeCart,
                toggleCart,
            }}
        >
            {children}

            {/* Notification Toast */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1a1a1a',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: 4,
                        fontSize: 13,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        zIndex: 9999,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                >
                    {toast}
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);