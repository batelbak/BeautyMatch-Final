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

    // 1. Load the full product catalog from the DB
    const products = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'description', 'price', 'imageUrl', 'skinType', 'concern'],
    });

    if (!products.length) {
      return fail(res, 404, 'EMPTY_CATALOG', 'No products available to recommend');
    }

    const catalog = products.map((p) => p.toJSON());

    // 2. Ask the AI service for recommendations.
    // NOTE: aiService already enriches each recommendation with the full
    // product object from the catalog, so the shape is:
    //   { summary, routine: { morning, evening }, recommendations: [{ product, reason }] }
    const aiResult = await getRecommendationsFromAI({
      skinType,
      concern,
      freeText: cleanFreeText,
      catalog,
    });

    // 3. Return it straight through — DO NOT rebuild `recommendations` here,
    // otherwise we lose the full product objects (image, price, brand, ...).
    const formattedResult = {
      summary: aiResult.summary || 'Based on your skin profile, here is your personalized routine.',
      routine: aiResult.routine || { morning: [], evening: [] },
      recommendations: Array.isArray(aiResult.recommendations) ? aiResult.recommendations : [],
    };

    return ok(res, formattedResult);
  } catch (err) {
    console.error('AI quizRecommendations error:', err);
    return fail(res, 500, 'AI_ERROR', err.message || 'AI service failed');
  }
};
