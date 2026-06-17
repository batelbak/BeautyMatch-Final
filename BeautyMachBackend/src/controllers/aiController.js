const { Product } = require('../models');
const { getRecommendationsFromAI } = require('../services/aiService');

exports.quizRecommendations = async (req, res) => {
  try {
    const { skinType, concern } = req.body;
    if (!skinType || !concern) return res.status(400).json({ message: 'skinType and concern are required' });

    const catalog = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'price', 'skinType', 'concern', 'description'],
    });

    const result = await getRecommendationsFromAI({ skinType, concern, catalog });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
