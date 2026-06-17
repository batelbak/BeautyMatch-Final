import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QuizPage = () => {
    const [answers, setAnswers] = useState({ skinType: '', concern: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/ai/quiz-recommendations', answers);
            navigate('/recommendations', { state: { result: data, answers } });
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quiz-page">
            <h1>Skin Quiz</h1>
            <p className="app-subtitle">discover your perfect match</p>

            <form onSubmit={handleSubmit}>
                <div className="quiz-field">
                    <label htmlFor="skinType">What is your skin type?</label>
                    <select id="skinType" value={answers.skinType} required
                        onChange={(e) => setAnswers({ ...answers, skinType: e.target.value })}>
                        <option value="">Select your type…</option>
                        <option value="dry">Dry</option>
                        <option value="oily">Oily</option>
                        <option value="combination">Combination</option>
                        <option value="normal">Normal</option>
                        <option value="sensitive">Sensitive</option>
                        <option value="mature">Mature</option>
                    </select>
                </div>

                <div className="quiz-field">
                    <label htmlFor="concern">What is your primary concern?</label>
                    <select id="concern" value={answers.concern} required
                        onChange={(e) => setAnswers({ ...answers, concern: e.target.value })}>
                        <option value="">Select your concern…</option>
                        <option value="acne">Acne</option>
                        <option value="aging">Signs of Aging</option>
                        <option value="pigmentation">Pigmentation</option>
                        <option value="hydration">Hydration</option>
                        <option value="wrinkles">Wrinkles</option>
                    </select>
                </div>

                {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

                <button type="submit" className="quiz-button" disabled={loading}>
                    {loading ? 'analyzing…' : 'get my recommendations'}
                </button>
            </form>
        </div>
    );
};

export default QuizPage;
