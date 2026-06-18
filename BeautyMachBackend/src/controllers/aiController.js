// src/controllers/aiController.js
const { ok, fail } = require('../utils/response');
const { Product } = require('../../models');
const { getRecommendationsFromAI } = require('../services/aiService');

/**
 * POST /api/ai/quiz-recommendations
 * Body: { skinType, concern, freeText? }
 * Loads the product catalog from the DB and asks the AI for a personalized routine.
 */
exports.quizRecommendations = async (req, res) => {
  try {
    const { skinType, concern, freeText } = req.body || {};
    if (!skinType || !concern) {
      return fail(res, 400, 'VALIDATION_ERROR', 'skinType and concern are required');
    }

    const cleanFreeText = typeof freeText === 'string' ? freeText.trim().slice(0, 500) : '';

    const products = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'description', 'price', 'imageUrl', 'skinType', 'concern'],
    });

    if (!products.length) {
      return fail(res, 404, 'EMPTY_CATALOG', 'No products available to recommend');
    }

    const catalog = products.map((p) => p.toJSON());

    const result = await getRecommendationsFromAI({
      skinType,
      concern,
      freeText: cleanFreeText,
      catalog,
    });

    return ok(res, result);
  } catch (err) {
    console.error('AI quizRecommendations error:', err);
    return fail(res, 500, 'AI_ERROR', err.message || 'AI service failed');
  }
};
