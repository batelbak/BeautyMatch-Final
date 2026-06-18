// src/components/Card.js
import React, { useState } from 'react';
import './Card.css';

/**
 * Helper to retrieve image URL from various possible object properties
 */
export const getImage = (item) =>
  item?.imageUrl || item?.image || item?.image_url || item?.img || '';

/**
 * Reusable Card component for displaying product information.
 * Supports both standard static layout and flippable layout.
 */
const Card = ({
  item,
  image,
  title,
  description,
  price,
  badge,
  category,
  buttonLabel = 'Add to Cart',
  onButtonClick,
  onRemove,
  variant = 'product', // 'product' | 'row'
  flippable = false,
}) => {
  const [flipped, setFlipped] = useState(false);

  // Extract properties from either the item object or individual props
  const img = image ?? getImage(item);
  const ttl = title ?? item?.name;
  const desc = description ?? item?.description;
  const prc = price ?? item?.price;
  const cat = category ?? item?.category;

  // ===== Variant: ROW (Used for cart or checkout lists) =====
  if (variant === 'row') {
    return (
      <div className="card-row">
        {img && <img src={img} alt={ttl} className="card-row-img" />}
        <div className="card-row-info">
          <h4 className="card-row-title">{ttl}</h4>
          {desc && <p className="card-row-desc">{desc}</p>}
          {prc != null && <span className="card-row-price">${prc}</span>}
        </div>
        {onRemove && (
          <button className="card-row-remove" onClick={onRemove}>✕</button>
        )}
      </div>
    );
  }

  // ===== Variant: PRODUCT (Standard catalog layout) =====
  if (!flippable) {
    return (
      <div className="card-product">
        {badge && <span className="card-badge">{badge}</span>}
        {img && <img src={img} alt={ttl} className="card-img" />}
        {cat && <span className="card-category">{cat}</span>}
        <h3 className="card-title">{ttl}</h3>
        {desc && <p className="card-desc">{desc}</p>}
        {prc != null && <span className="card-price">${prc}</span>}
        {onButtonClick && (
          <button className="card-btn" onClick={onButtonClick}>
            {buttonLabel}
          </button>
        )}
      </div>
    );
  }

  // ===== Variant: PRODUCT + FLIPPABLE (Interactive card with details back) =====
  return (
    <div
      className={`card-flip ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="card-flip-inner">
        {/* Front side */}
        <div className="card-flip-front">
          {badge && <span className="card-badge">{badge}</span>}
          {img && <img src={img} alt={ttl} className="card-img" />}
          {cat && <span className="card-category">{cat}</span>}
          <h3 className="card-title">{ttl}</h3>
          {prc != null && <span className="card-price">${prc}</span>}
          {onButtonClick && (
            <button
              className="card-btn"
              onClick={(e) => {
                e.stopPropagation(); // Prevents triggering card flip
                onButtonClick();
              }}
            >
              {buttonLabel}
            </button>
          )}
          <span className="card-flip-hint">Click for details ↻</span>
        </div>

        {/* Back side */}
        <div className="card-flip-back">
          <h3 className="card-title">{ttl}</h3>
          <p className="card-flip-desc">
            {desc || 'No description available.'}
          </p>
          <span className="card-flip-hint">↻ Click to go back</span>
        </div>
      </div>
    </div>
  );
};

export default Card;