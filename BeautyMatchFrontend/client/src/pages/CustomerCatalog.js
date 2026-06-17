// src/pages/CustomerCatalog.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import heroModel from '../assets/hero-model.jpeg';

/**
 * CustomerCatalog page.
 * Displays the hero section, the product collection with flip-enabled cards,
 * and a promotional banner for the skin quiz.
 */
const CustomerCatalog = () => {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Fetch products from the catalog API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data.data || res.data);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="catalog-page">
            {/* Hero Section */}
            <section className="hero">
                <img src={heroModel} alt="AI Beauty" className="hero-img" />
                <div className="hero-overlay">
                    <p className="hero-eyebrow">the new ritual</p>
                    <h1 className="hero-title">radiance,<br/>personalized</h1>
                    <button className="hero-btn" onClick={() => navigate('/quiz')}>
                        take the skin quiz
                    </button>
                </div>
            </section>

            {/* Collection Header */}
            <h2 className="app-title">Our Collection</h2>
            <p className="app-subtitle">crafted with care · loved by all</p>

            {/* Product Grid */}
            <div className="catalog-container">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        flippable={true} // Enables flip interaction for details
                        onAdd={(product) => addToCart(product)}
                    />
                ))}
            </div>

            {/* Quiz Promotion Banner */}
            <div className="quiz-banner">
                <h3>Looking for the perfect match?</h3>
                <button className="quiz-button" onClick={() => navigate('/quiz')}>
                    take the skin quiz
                </button>
            </div>
        </div>
    );
};

export default CustomerCatalog;