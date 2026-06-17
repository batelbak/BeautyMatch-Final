// src/pages/QuizPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * QuizPage component.
 * Allows users to input their skin type and primary concerns 
 * to receive personalized product recommendations.
 */
const QuizPage = () => {
    const [answers, setAnswers] = useState({ skinType: '', concern: '' });
    const navigate = useNavigate();

    /**
     * Handles quiz submission and redirects to the recommendations page.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("User quiz responses:", answers);
        // Navigate to results page with quiz data
        navigate('/recommendations', { state: { answers } });
    };

    return (
        <div className="quiz-page">
            <h1>Skin Quiz</h1>
            <p className="app-subtitle">discover your perfect match</p>

            <form onSubmit={handleSubmit}>
                {/* Skin Type Selection */}
                <div className="quiz-field">
                    <label htmlFor="skinType">What is your skin type?</label>
                    <select
                        id="skinType"
                        value={answers.skinType}
                        onChange={(e) => setAnswers({ ...answers, skinType: e.target.value })}
                        required
                    >
                        <option value="">Select your type…</option>
                        <option value="dry">Dry</option>
                        <option value="oily">Oily</option>
                        <option value="combination">Combination</option>
                        <option value="normal">Normal</option>
                    </select>
                </div>

                {/* Primary Concern Selection */}
                <div className="quiz-field">
                    <label htmlFor="concern">What is your primary concern?</label>
                    <select
                        id="concern"
                        value={answers.concern}
                        onChange={(e) => setAnswers({ ...answers, concern: e.target.value })}
                        required
                    >
                        <option value="">Select your concern…</option>
                        <option value="acne">Acne</option>
                        <option value="aging">Signs of Aging</option>
                        <option value="pigmentation">Pigmentation</option>
                        <option value="hydration">Hydration</option>
                    </select>
                </div>

                <button type="submit" className="quiz-button">
                    get my recommendations
                </button>
            </form>
        </div>
    );
};

export default QuizPage;