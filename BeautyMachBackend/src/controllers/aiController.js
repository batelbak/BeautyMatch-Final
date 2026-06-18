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

    // 2. קריאה ל-AI לקבלת ההמלצות הגולמיות
    const aiResult = await getRecommendationsFromAI({
      skinType,
      concern,
      freeText: cleanFreeText,
      catalog,
    });

    // 3. התאמת מבנה הנתונים למה שקוד ה-React (Recommendations.js) מצפה לקבל!
    const formattedResult = {
      summary: aiResult.summary || "Based on your skin profile, here is your personalized routine.",
      routine: aiResult.routine || { morning: [], evening: [] },
      recommendations: []
    };

    const aiRecommendations = aiResult.recommendations || [];

    formattedResult.recommendations = aiRecommendations.map(rec => {
      // חיפוש חכם וגמיש: בודק התאמת ID או התאמה חלקית של שם המוצר ללא תלות באותיות גדולות/קטנות
      const foundProduct = catalog.find(p => {
        const matchId = String(p.id) === String(rec.productId);
        const matchName = rec.name && p.name && (
          p.name.toLowerCase().includes(rec.name.toLowerCase()) ||
          rec.name.toLowerCase().includes(p.name.toLowerCase())
        );
        return matchId || matchName;
      });

      // אם מצאנו את המוצר האמיתי בקטלוג - נשלוף את הנתונים והתמונות המקוריות מה-Database
      if (foundProduct) {
        return {
          reason: rec.reason || "Recommended for your skin type.",
          product: {
            id: foundProduct.id,
            name: foundProduct.name,
            brand: foundProduct.brand || "AI Beauty",
            category: foundProduct.category,
            price: foundProduct.price,
            imageUrl: foundProduct.imageUrl // התמונה האמיתית מה-DB שלך
          }
        };
      }

      // במידה והמוצר לא נמצא (הגנת ברירת מחדל כדי שלא יקרוס, משתמש בתמונה מהסיד)
      return {
        reason: rec.reason || "Recommended for your skin type.",
        product: {
          id: rec.productId || Math.random(),
          name: rec.name || "Special Treatment",
          brand: "AI Beauty",
          category: "Skincare",
          price: 25,
          imageUrl: "https://i.postimg.cc/Ghh7rwJD/Whats-App-Image-2026-06-01-at-19-47-56-(1).jpg"
        }
      };
    });

    // 4. החזרת התשובה המובנית והמלאה לפרונטאנד
    return ok(res, formattedResult);

  } catch (err) {
    console.error('AI quizRecommendations error:', err);
    return fail(res, 500, 'AI_ERROR', err.message || 'AI service failed');
  }
};