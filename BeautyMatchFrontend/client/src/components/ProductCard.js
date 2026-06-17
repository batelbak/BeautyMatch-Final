// src/components/ProductCard.js
import React, { useState } from 'react';

/**
 * Uniform Product Card component for the entire site.
 * Supports different variants and an optional flip animation for product details.
 * * @param {Object} product - The product object to display.
 * @param {string} variant - Layout style: 'full' (catalog), 'compact' (cart), or 'checkout'.
 * @param {boolean} flippable - If true, enables flip interaction to view description.
 * @param {Function} onAdd - Handler for adding the product to cart.
 * @param {Function} onRemove - Handler for removing the product from cart.
 */
const ProductCard = ({
  product,
  variant = 'full',
  flippable = false,
  onAdd,
  onRemove,
}) => {
  const [flipped, setFlipped] = useState(false);

  if (!product) return null;

  /**
   * Handles the flip state toggle, preventing flip if action buttons are clicked.
   */
  const handleFlip = (e) => {
    if (!flippable) return;
    if (e.target.closest('.pc-action')) return; // Do not flip when clicking buttons
    setFlipped((f) => !f);
  };

  const handleKey = (e) => {
    if (!flippable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  };

  // ----- Variant: Compact (For Cart Drawer) -----
  if (variant === 'compact') {
    return (
      <div className="product-card product-card--compact">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="pc-img-compact" />
        )}
        <div className="pc-info-compact">
          <p className="pc-name-compact">{product.name}</p>
          <p className="pc-price-compact">${product.price}</p>
        </div>
        {onRemove && (
          <button className="pc-action remove-btn" onClick={onRemove}>
            remove
          </button>
        )}
      </div>
    );
  }

  // ----- Variant: Checkout (For Order Summary) -----
  if (variant === 'checkout') {
    return (
      <div className="product-card product-card--checkout">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="pc-img-compact" />
        )}
        <div className="pc-info-compact">
          <p className="pc-name-compact">{product.name}</p>
          <p className="pc-price-compact">${product.price}</p>
        </div>
      </div>
    );
  }

  // ----- Variant: Full (For Catalog, with optional flip) -----
  return (
    <div
      className={`product-card product-card--full ${flippable ? 'is-flippable' : ''} ${flipped ? 'is-flipped' : ''}`}
      onClick={handleFlip}
      onKeyDown={handleKey}
      tabIndex={flippable ? 0 : -1}
      role={flippable ? 'button' : undefined}
      aria-pressed={flippable ? flipped : undefined}
    >
      <div className="pc-flip">
        <div className="pc-flip-inner">
          {/* Front Side */}
          <div className="pc-face pc-face-front">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="pc-img" />
            )}
            <h3 className="pc-name">{product.name}</h3>
            <p className="pc-price">${product.price}</p>
            {onAdd && (
              <button
                className="pc-action pc-add-btn"
                onClick={(e) => { e.stopPropagation(); onAdd(product); }}
              >
                add to cart
              </button>
            )}
            {flippable && <span className="pc-hint">click for details</span>}
          </div>

          {/* Back Side */}
          <div className="pc-face pc-face-back">
            <h4 className="pc-back-name">{product.name}</h4>
            {product.category && <p className="pc-back-cat">{product.category}</p>}
            <p className="pc-desc">{product.description || 'No description available.'}</p>
            <p className="pc-price">${product.price}</p>
            <button
              className="pc-action pc-back-btn"
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            >
              back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;