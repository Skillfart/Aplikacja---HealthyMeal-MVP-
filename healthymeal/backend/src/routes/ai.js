const express = require('express');
const router = express.Router();
const { authMiddleware, checkAILimit } = require('../middleware/auth');

// Endpoint do modyfikacji przepisu przez AI
router.post('/modify/:recipeId', [authMiddleware, checkAILimit], async (req, res) => {
  try {
    // TODO: Implementacja modyfikacji przepisu przez AI
    res.status(501).json({ 
      message: 'Funkcjonalność w trakcie implementacji',
      recipeId: req.params.recipeId
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do sprawdzenia limitu użycia AI
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      aiUsage: user.aiUsage,
      hasRemainingModifications: user.hasRemainingAIModifications(),
      dailyLimit: 5,
      remainingModifications: 5 - (user.aiUsage?.count || 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 