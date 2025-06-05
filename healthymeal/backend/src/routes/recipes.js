const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const recipeController = require('../controllers/recipe');

const router = express.Router();

// Wszystkie trasy wymagają uwierzytelnienia
router.use(authMiddleware);

// Przepis dnia
router.get('/recipe-of-day', recipeController.getRecipeOfDay);

// Ostatnie przepisy
router.get('/recent', recipeController.getRecentRecipes);

// Lista wszystkich przepisów
router.get('/', recipeController.getRecipes);

// Pojedynczy przepis
router.get('/:id', recipeController.getRecipe);

// Tworzenie nowego przepisu
router.post('/', recipeController.createRecipe);

// Aktualizacja przepisu
router.put('/:id', recipeController.updateRecipe);

// Usuwanie przepisu
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router; 