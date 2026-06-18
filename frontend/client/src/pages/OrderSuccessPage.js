// src/pages/OrderSuccessPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './OrderSuccessPage.css';

/**
 * OrderSuccessPage component.
 * Displays a confirmation message to the user after a successful purchase.
 */
const OrderSuccessPage = () => {
  return (
    <div className="order-success-page">
      <div className="success-container">
        <img
          src="/images/cream-heart.png"
          alt="Order Success"
          className="success-image"
        />
        
        <h1 className="success-title">ORDER PLACED</h1>
        
        <p className="success-subtitle">
          Thank you for choosing the best for your skin
        </p>
        
        <p className="success-message">
          Your order has been placed successfully.
          <br />
          We're already preparing it with love, just for you.
        </p>
        
        <Link to="/" className="continue-button">
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;