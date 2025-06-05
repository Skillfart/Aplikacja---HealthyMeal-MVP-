const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { authMiddleware } = require('../middleware/auth');

// Wszystkie ścieżki są chronione przez middleware autoryzacji
router.use(authMiddleware);

// Profil użytkownika
router.get('/profile', userController.getProfile);

// Preferencje użytkownika
router.put('/preferences', userController.updatePreferences);

// Sprawdzanie limitu AI
router.get('/ai-usage', userController.checkAILimit);

// Inkrementacja licznika AI
router.post('/ai-usage/increment', userController.incrementAIUsage);

module.exports = router; 