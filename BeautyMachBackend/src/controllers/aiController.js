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

    // 1. שליפת כל המוצרים מהדאטה-בייס
    const products = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'description', 'price', 'imageUrl', 'skinType', 'concern'],
    });

    if (!products.length) {
      return fail(res, 404, 'EMPTY_CATALOG', 'No products available to recommend');
    }

    const catalog = products.map((p) => p.toJSON());

    // 2. קריאה ל-AI לקבלת ההמלצות הגולמיות (האובייקט הגדול שראינו בטרמינל)
    const aiResult = await getRecommendationsFromAI({
      skinType,
      concern,
      freeText: cleanFreeText,
      catalog,
    });

    // 3. התאמת מבנה הנתונים למה שקוד ה-React (Recommendations.js) מצפה לקבל!
    // אנחנו בונים אובייקט מובנה עם summary, routine ו-recommendations
    const formattedResult = {
      summary: aiResult.summary || "Based on your skin profile, here is your personalized routine.",
      routine: aiResult.routine || { morning: [], evening: [] },
      recommendations: []
    };

    // במידה וה-AI החזיר מערך המלצות, נחבר לכל המלצה את אובייקט ה-product המלא מהדאטה בייס
    const aiRecommendations = aiResult.recommendations || [];

    formattedResult.recommendations = aiRecommendations.map(rec => {
      // מחפשים את המוצר המלא בקטלוג לפי ה-ID שה-AI החזיר (או לפי השם אם ה-ID לא תואם)
      const foundProduct = catalog.find(p => p.id === rec.productId || p.name === rec.name);

      return {
        reason: rec.reason || "Recommended for your skin type.",
        product: foundProduct || {
          id: rec.productId || Math.random(),
          name: rec.name,
          brand: "AI Beauty",
          category: "Skincare",
          price: 25,
          imageUrl: "https://via.placeholder.com/240" // ברירת מחדל אם המוצר לא נמצא בקטלוג
        }
      };
    });

    // 4. החזרת התשובה המובנית לפרונטאנד
    return ok(res, formattedResult);

  } catch (err) {
    console.error('AI quizRecommendations error:', err);
    return fail(res, 500, 'AI_ERROR', err.message || 'AI service failed');
  }
};