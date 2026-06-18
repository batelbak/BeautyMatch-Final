import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Recommendations = () => {
    const { state } = useLocation();
    const result = state?.result;
    const answers = state?.answers;


    const { addToCart } = useCart();

    const handleAddToCart = (product) => {
        addToCart(product);

    };

    if (!result) {
        return (
            <div className="recommendations-container" style={{ padding: '80px 24px', textAlign: 'center', backgroundColor: '#fcfbf9' }}>
                <h2 style={{ fontFamily: 'serif', fontWeight: 300, fontSize: 28 }}>No recommendations yet</h2>
                <p style={{ color: '#777', marginTop: 8 }}>Please take the <Link to="/quiz" style={{ color: '#c89b8a', textDecoration: 'underline' }}>skin quiz</Link> first.</p>
            </div>
        );
    }

    const { summary, routine, recommendations } = result;

    return (
        <div className="recommendations-container" style={{ padding: '40px 24px 80px', maxWidth: 1120, margin: '0 auto', backgroundColor: '#fcfbf9' }}>
            <p style={{ textAlign: 'center', letterSpacing: 4, color: '#c89b8a', fontSize: 11, fontWeight: 500 }}>
                — YOUR PERSONAL ROUTINE —
            </p>
            <h1 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: 44, fontWeight: 300, margin: '12px 0 24px', color: '#1a1a1a' }}>
                Recommended for You
            </h1>

            {answers && (
                <p style={{ textAlign: 'center', color: '#777', fontSize: 14, marginBottom: 32 }}>
                    Skin type: <strong style={{ color: '#c89b8a', fontWeight: 400 }}>{answers.skinType}</strong> · Concern: <strong style={{ color: '#c89b8a', fontWeight: 400 }}>{answers.concern}</strong>
                </p>
            )}

            {summary && (
                <p style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px', color: '#555', fontStyle: 'italic', fontSize: 15, lineHeight: 1.6, fontWeight: 300 }}>
                    "{summary}"
                </p>
            )}

            {/* Routine cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32 }}>
                <RoutineCard title="Morning Routine" label="AM" steps={routine?.morning} />
                <RoutineCard title="Evening Routine" label="PM" steps={routine?.evening} />
            </div>

            {/* Curated products */}
            <h2 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: 32, fontWeight: 300, marginTop: 72, marginBottom: 12, color: '#1a1a1a' }}>
                Your Curated Selection
            </h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 32, fontWeight: 300 }}>
                The core essentials selected specifically to target your skin concerns.
            </p>

            {recommendations?.length > 0 ? (
                <div className="catalog-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: 28,
                }}>
                    {recommendations.map(({ product, reason }) => (
                        <div key={product.id} style={{
                            background: '#fff',
                            border: '1px solid #f3ece6',
                            borderRadius: 4,
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                                {product.imageUrl && (
                                    <img src={product.imageUrl} alt={product.name}
                                         style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                                )}
                            </div>

                            <div style={{ marginTop: 14, flexGrow: 1 }}>
                                <div style={{ color: '#a0a0a0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {product.brand}
                                </div>
                                <h3 style={{ marginTop: 4, marginBottom: 6, fontFamily: 'serif', fontSize: 18, fontWeight: 400, color: '#222' }}>
                                    {product.name}
                                </h3>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>
                                    ${product.price}
                                </div>
                                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, minHeight: 60, fontWeight: 300 }}>
                                    {reason}
                                </p>
                            </div>

                            {/* כפתור הוספה לעגלה קלאסי ונקי, מחובר ל-Context */}
                            <button
                                onClick={() => handleAddToCart(product)}
                                style={{
                                    width: '100%',
                                    background: '#1a1a1a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    marginTop: 16,
                                    transition: 'background 0.2s ease',
                                }}
                                onMouseOver={(e) => e.target.style.background = '#333'}
                                onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
                            >
                                Add To Cart
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#999', marginTop: 16, fontWeight: 300 }}>
                    No matching products were found in the catalog.
                </p>
            )}

            <div style={{ textAlign: 'center', marginTop: 64 }}>
                <Link to="/quiz" style={{ color: '#c89b8a', textDecoration: 'none', fontSize: 14, letterSpacing: 1, borderBottom: '1px solid #c89b8a', paddingBottom: 2 }}>
                    RETAKE THE QUIZ
                </Link>
            </div>
        </div>
    );
};

const RoutineCard = ({ title, label, steps }) => (
    <div style={{ background: '#faf6f0', border: '1px solid #f5ede4', borderRadius: 4, padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #ede2d5', paddingBottom: 12 }}>
            <h3 style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 400, margin: 0, color: '#1a1a1a' }}>
                {title}
            </h3>
            <span style={{ fontSize: 11, background: '#fff', border: '1px solid #ede2d5', padding: '4px 8px', letterSpacing: 1, color: '#888' }}>
                {label}
            </span>
        </div>
        {steps?.length > 0 ? (
            <ol style={{ paddingLeft: 16, margin: 0, color: '#444', lineHeight: 1.8, fontSize: 14, fontWeight: 300 }}>
                {steps.map((s, i) => <li key={i} style={{ marginBottom: 10 }}>{s}</li>)}
            </ol>
        ) : (
            <p style={{ color: '#999', fontStyle: 'italic', fontSize: 14, fontWeight: 300 }}>No steps returned.</p>
        )}
    </div>
);

export default Recommendations;