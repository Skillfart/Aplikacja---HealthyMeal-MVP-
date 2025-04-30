const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient');
const { verifyToken } = require('../middleware/auth');

// Wszystkie poniższe trasy wymagają uwierzytelnienia
router.use(verifyToken);

// Pobierz wszystkie składniki
router.get('/', ingredientController.getAllIngredients);

// Pobierz jeden składnik
router.get('/:id', ingredientController.getIngredientById);

// Utwórz nowy składnik (tylko dla administratorów)
router.post('/', ingredientController.createIngredient);

module.exports = router; 