const router = require('express').Router();
const ai = require('../controllers/aiController');
router.post('/quiz-recommendations', ai.quizRecommendations);
module.exports = router;
