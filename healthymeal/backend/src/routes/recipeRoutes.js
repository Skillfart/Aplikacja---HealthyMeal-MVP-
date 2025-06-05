const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authenticate } = require('../middleware/auth');

// Wszystkie ścieżki wymagają uwierzytelnienia
router.use(authenticate);

// Pobierz wszystkie przepisy użytkownika
router.get('/', recipeController.getUserRecipes);

// Wyszukaj przepisy
router.get('/search', recipeController.searchRecipes);

// Pobierz pojedynczy przepis
router.get('/:id', recipeController.getRecipe);

// Utwórz nowy przepis
router.post('/', recipeController.createRecipe);

// Zaktualizuj przepis
router.put('/:id', recipeController.updateRecipe);

// Usuń przepis
router.delete('/:id', recipeController.deleteRecipe);

// Modyfikuj przepis za pomocą AI
router.post('/:id/modify-with-ai', recipeController.modifyRecipeWithAI);

module.exports = router; 