import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Recommendations = () => {
    const { state } = useLocation();
    const result = state?.result;
    const answers = state?.answers;

    if (!result) {
        return (
            <div className="recommendations-container" style={{ padding: 24, textAlign: 'center' }}>
                <h2>No recommendations yet</h2>
                <p>Please take the <Link to="/quiz">skin quiz</Link> first.</p>
            </div>
        );
    }

    const { summary, routine, recommendations } = result;
    const hasMorning = routine?.morning?.length > 0;
    const hasEvening = routine?.evening?.length > 0;

    return (
        <div className="recommendations-container" style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', letterSpacing: 4, color: '#c89b8a', fontSize: 12 }}>
                — YOUR PERSONAL ROUTINE —
            </p>
            <h1 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: 56, margin: '8px 0' }}>
                Recommended for You
            </h1>
            {answers && (
                <p style={{ textAlign: 'center', color: '#888' }}>
                    Skin type: <strong style={{ color: '#c89b8a' }}>{answers.skinType}</strong> · Concern: <strong style={{ color: '#c89b8a' }}>{answers.concern}</strong>
                </p>
            )}

            {summary && (
                <p style={{ textAlign: 'center', maxWidth: 720, margin: '24px auto', color: '#555', fontStyle: 'italic' }}>
                    {summary}
                </p>
            )}

            {/* Routine cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
                <RoutineCard icon="☀️" title="Morning Routine" steps={routine?.morning} />
                <RoutineCard icon="🌙" title="Evening Routine" steps={routine?.evening} />
            </div>

            {/* Curated products */}
            <h2 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: 36, marginTop: 56 }}>
                Your Curated Products
            </h2>

            {recommendations?.length > 0 ? (
                <div className="catalog-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))',
                    gap: 20,
                    marginTop: 24,
                }}>
                    {recommendations.map(({ product, reason }) => (
                        <div key={product.id} style={{ background: '#fff', border: '1px solid #efe6df', borderRadius: 14, padding: 16 }}>
                            {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name}
                                     style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }} />
                            )}
                            <h3 style={{ marginTop: 12, fontFamily: 'serif' }}>{product.name}</h3>
                            <div style={{ color: '#999', fontSize: 13 }}>{product.brand} · {product.category}</div>
                            <div style={{ fontWeight: 600, marginTop: 6, color: '#c89b8a' }}>{product.price}₪</div>
                            <p style={{ marginTop: 10, fontSize: 14, color: '#555', lineHeight: 1.5 }}>{reason}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#999', marginTop: 16 }}>
                    No matching products were found in the catalog.
                </p>
            )}

            <div style={{ textAlign: 'center', marginTop: 48 }}>
                <Link to="/quiz" style={{ color: '#c89b8a', textDecoration: 'underline' }}>retake the quiz</Link>
            </div>
        </div>
    );
};

const RoutineCard = ({ icon, title, steps }) => (
    <div style={{ background: '#f7e9e1', borderRadius: 14, padding: '24px 28px', minHeight: 140 }}>
        <h3 style={{ fontFamily: 'serif', fontSize: 24, marginTop: 0 }}>
            <span style={{ marginRight: 8 }}>{icon}</span>{title}
        </h3>
        {steps?.length > 0 ? (
            <ol style={{ paddingLeft: 20, margin: 0, color: '#444', lineHeight: 1.7 }}>
                {steps.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
            </ol>
        ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>No steps returned.</p>
        )}
    </div>
);

export default Recommendations;
