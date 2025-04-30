/**
 * Trasy API związane z funkcjami AI
 */
const express = require('express');
const { auth } = require('../middleware/auth');
const aiController = require('../controllers/ai');

const router = express.Router();

// Wszystkie trasy wymagają uwierzytelnienia
router.use(auth);

// Pobieranie informacji o wykorzystaniu AI przez użytkownika
router.get('/usage', aiController.getAIUsage);

// Modyfikacja przepisu za pomocą AI
router.post('/modify-recipe', aiController.modifyRecipeWithAI);

// Generowanie alternatywnych składników
router.post('/ingredient-alternatives', aiController.suggestIngredientAlternatives);

// Sprawdzanie statusu API AI
router.get('/status', aiController.checkAPIStatus);

module.exports = router; 