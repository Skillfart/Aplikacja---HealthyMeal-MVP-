const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai');
const { verifyToken, checkAIUsageLimit } = require('../middleware/auth');

// Wszystkie poniższe trasy wymagają uwierzytelnienia
router.use(verifyToken);

// Sprawdź limit dzienny użycia AI
router.get('/usage', aiController.checkAIUsageLimit);

// Modyfikacja przepisu przez AI (wymaga sprawdzenia limitu)
router.post('/modify/:recipeId', checkAIUsageLimit, aiController.modifyRecipe);

module.exports = router; 