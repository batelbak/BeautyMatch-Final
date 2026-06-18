// src/components/CartDrawer.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import './CartDrawer.css';

/**
 * CartDrawer component displays the side panel containing items added to the cart.
 * Allows users to review items, remove them, and proceed to checkout.
 */
const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Calculate the total price of all items in the cart
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  /**
   * Navigates to the checkout page and closes the cart drawer
   */
  const goToCheckout = () => {
    if (cart.length === 0) return;
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Background overlay to dim the screen when cart is open */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      />
      
      {/* Sidebar drawer containing cart content */}
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>
            cart{' '}
            <span className="muted">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <button className="drawer-close" onClick={closeCart} aria-label="close">
            ×
          </button>
        </div>

        <div className="drawer-content">
          {cart.length === 0 ? (
            <p className="empty">Your cart is empty</p>
          ) : (
            cart.map((item, index) => (
              <ProductCard
                key={index}
                product={item}
                variant="compact"
                onRemove={() => removeFromCart(index)}
              />
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div className="total-row">
            <span>estimated total:</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button
            className="checkout-button"
            onClick={goToCheckout}
            disabled={cart.length === 0}
          >
            place order
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;