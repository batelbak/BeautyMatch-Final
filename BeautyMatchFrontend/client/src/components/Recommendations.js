// src/components/Recommendations.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Recommendations component that fetches and displays AI-driven
 * product suggestions for a specific user.
 * @param {string|number} userId - The unique identifier of the current user.
 */
const Recommendations = ({ userId }) => {
    const [products, setProducts] = useState([]);

    // Fetch recommendations whenever the userId changes
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await api.get(`/api/products/recommendations/${userId}`);
                setProducts(response.data.data.recommendedProducts);
            } catch (error) {
                console.error('Failed to fetch personalized recommendations:', error);
            }
        };

        if (userId) {
            fetchRecommendations();
        }
    }, [userId]);

    return (
        <div className="recommendations-container">
            <h2>Recommended for You</h2>
            <div className="catalog-grid">
                {products.map((product) => (
                    <div key={product.id} className="recommended-product-item">
                        {product.name} - ${product.price}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;