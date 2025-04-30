const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const aiLimitMiddleware = require('../middleware/aiLimitMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/ai/modify/:recipeId
 * @desc    Modyfikuje przepis przy użyciu AI
 * @access  Private
 */
router.post(
  '/modify/:recipeId',
  authMiddleware.authenticate,
  validationMiddleware.validateRecipeId,
  aiLimitMiddleware.checkAIUsageLimit,
  aiController.modifyRecipe
);

/**
 * @route   GET /api/ai/usage
 * @desc    Pobiera informacje o limitach użycia AI
 * @access  Private
 */
router.get(
  '/usage',
  authMiddleware.authenticate,
  async (req, res) => {
    try {
      const userService = require('../services/userService');
      const usage = await userService.checkAIUsageLimit(req.user._id);
      
      return res.status(200).json(usage);
    } catch (error) {
      console.error('Error fetching AI usage:', error);
      return res.status(500).json({ message: 'Error fetching AI usage information' });
    }
  }
);

module.exports = router; 