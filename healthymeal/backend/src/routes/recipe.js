const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe');
const modifiedRecipeController = require('../controllers/modifiedRecipe');
const { verifyToken } = require('../middleware/auth');

// Wszystkie poniższe trasy wymagają uwierzytelnienia
router.use(verifyToken);

// Oryginalne przepisy
router.get('/', recipeController.getUserRecipes);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.createRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

// Zmodyfikowane przepisy
router.get('/modified', modifiedRecipeController.getUserModifiedRecipes);
router.get('/modified/:id', modifiedRecipeController.getModifiedRecipeById);
router.post('/modified', modifiedRecipeController.saveModifiedRecipe);
router.delete('/modified/:id', modifiedRecipeController.deleteModifiedRecipe);

module.exports = router; 