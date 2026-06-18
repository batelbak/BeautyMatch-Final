// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * DashboardPage component.
 * Displays the product inventory and AI-driven product recommendations.
 * Allows users to add items to their local cart.
 */
const DashboardPage = () => {
    const [products, setProducts] = useState([]);
    const [aiRecommendations, setAiRecommendations] = useState([]);
    const [aiText, setAiText] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Retrieve active logged-in user details
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const loggedInUserId = user ? user.id : '1';

    /**
     * Adds a product to the cart state and persists it to localStorage
     */
    const addToCart = (product) => {
        const newCart = [...cart, product];
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        alert(`${product.name} has been added to your cart successfully!`);
    };

    useEffect(() => {
        // Load existing cart from storage on mount
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch inventory products
                const productsRes = await axios.get('http://localhost:3000/api/products');
                if (productsRes.data.success) {
                    setProducts(productsRes.data.data);
                }

                // Fetch AI-driven recommendations
                const recommendationsRes = await axios.get(`http://localhost:3000/api/products/recommendations/${loggedInUserId}`);
                if (recommendationsRes.data.success) {
                    setAiRecommendations(recommendationsRes.data.data.recommendedProducts);
                    setAiText(recommendationsRes.data.data.aiText);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError("Failed to fetch data from the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [loggedInUserId]);

    if (loading) return <div style={styles.centerMessage}>Loading inventory profiles & executing AI Agent... 🤖</div>;
    if (error) return <div style={{...styles.centerMessage, color: '#e74c3c'}}>{error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.mainTitle}>NextBite Dashboard</h1>
            <p style={styles.subTitle}>Hello {user ? user.firstName : 'Guest'}, manage your inventory here.</p>

            {/* --- Section 1: Product Inventory --- */}
            <div style={styles.section}>
                <h2 style={styles.sectionHeading}>All Available Products</h2>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Product Name</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} style={styles.tr}>
                                <td style={styles.td}>{product.id}</td>
                                <td style={styles.td}>{product.name}</td>
                                <td style={styles.td}>${product.price}</td>
                                <td style={styles.td}>
                                    <button onClick={() => addToCart(product)} style={styles.addToCartButton}>
                                        Add to Cart 🛒
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr style={styles.divider} />

            {/* --- Section 2: AI Recommendations --- */}
            <div style={styles.aiSection}>
                <h3 style={styles.aiTitle}>✨ {aiText}</h3>
                <div style={styles.recommendationsGrid}>
                    {aiRecommendations.map((prod) => (
                        <div key={prod.id} style={styles.productCard}>
                            <h4 style={styles.cardName}>{prod.name}</h4>
                            <p style={styles.cardPrice}>${prod.price}</p>
                            <button onClick={() => addToCart(prod)} style={styles.addToCartButton}>Add to Cart 🛒</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Styles ---
const styles = {
    container: { padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1000px', margin: '0 auto' },
    mainTitle: { color: '#2c3e50' },
    subTitle: { color: '#7f8c8d', marginBottom: '30px' },
    section: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    sectionHeading: { fontSize: '20px', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px', textAlign: 'left', borderBottom: '2px solid #eee' },
    td: { padding: '10px', borderBottom: '1px solid #eee' },
    addToCartButton: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
    aiSection: { backgroundColor: '#f3e8ff', padding: '25px', borderRadius: '12px' },
    aiTitle: { color: '#6b21a8', marginBottom: '15px' },
    recommendationsGrid: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    productCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e9d5ff', textAlign: 'center' },
    cardName: { margin: '5px 0' },
    cardPrice: { color: '#7e22ce', fontWeight: 'bold' },
    centerMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '18px' },
    divider: { margin: '40px 0', border: '0', height: '1px', background: '#ccc' }
};

export default DashboardPage;