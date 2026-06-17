import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Recommendations = () => {
    const { state } = useLocation();
    const result = state?.result;
    const answers = state?.answers;

    if (!result) {
        return (
            <div className="recommendations-container" style={{ padding: 24 }}>
                <h2>No recommendations yet</h2>
                <p>Please take the <Link to="/quiz">skin quiz</Link> first.</p>
            </div>
        );
    }

    return (
        <div className="recommendations-container" style={{ padding: 24 }}>
            <h2>Recommended for You</h2>
            {answers && (
                <p style={{ color: '#666' }}>
                    Based on skin type <strong>{answers.skinType}</strong> and concern <strong>{answers.concern}</strong>
                </p>
            )}
            <div className="catalog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 }}>
                {result.recommendations.map(({ product, reason }) => (
                    <div key={product.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14 }}>
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name}
                                 style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
                        )}
                        <h3 style={{ marginTop: 10 }}>{product.name}</h3>
                        <div style={{ color: '#888', fontSize: 13 }}>{product.brand} · {product.category}</div>
                        <div style={{ fontWeight: 600, marginTop: 6 }}>{product.price}₪</div>
                        <p style={{ marginTop: 8, fontSize: 14 }}>{reason}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
