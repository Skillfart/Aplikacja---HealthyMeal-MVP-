const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const mongoose = require('mongoose');

// Pobierz wszystkie przepisy użytkownika
exports.getUserRecipes = async (req, res) => {
  try {
    const { search, tags, difficulty, maxPreparationTime, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * limit;
    
    // Podstawowy filtr: przepisy należące do użytkownika i nieusunięte
    let query = {
      'user._id': userId,
      isDeleted: false
    };
    
    // Dodaj filtr wyszukiwania, jeśli podano
    if (search) {
      query.$text = { $search: search };
    }
    
    // Dodaj filtr tagów, jeśli podano
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Dodaj filtr trudności, jeśli podano
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Dodaj filtr czasu przygotowania, jeśli podano
    if (maxPreparationTime) {
      query.preparationTime = { $lte: parseInt(maxPreparationTime) };
    }
    
    // Pobierz przepisy z paginacją
    const recipes = await Recipe.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title ingredients.ingredient.name preparationTime difficulty servings tags nutritionalValues createdAt');
    
    // Pobierz całkowitą liczbę przepisów spełniających kryteria
    const total = await Recipe.countDocuments(query);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      recipes
    });
  } catch (error) {
    console.error('Błąd pobierania przepisów:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobierz jeden przepis
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const recipe = await Recipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Błąd pobierania przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Utwórz nowy przepis
exports.createRecipe = async (req, res) => {
  try {
    const {
      title,
      ingredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags,
      nutritionalValues
    } = req.body;
    
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    // Walidacja składników - sprawdź czy wszystkie istnieją w bazie
    for (const item of ingredients) {
      const ingredientExists = await Ingredient.exists({ _id: item.ingredient._id });
      if (!ingredientExists) {
        return res.status(400).json({ message: `Składnik o ID ${item.ingredient._id} nie istnieje` });
      }
    }
    
    // Utwórz nowy przepis
    const recipe = new Recipe({
      title,
      user: {
        _id: userId,
        email: userEmail
      },
      ingredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags,
      nutritionalValues,
      isDeleted: false
    });
    
    await recipe.save();
    
    res.status(201).json({
      message: 'Przepis dodany pomyślnie',
      recipeId: recipe._id
    });
  } catch (error) {
    console.error('Błąd tworzenia przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Aktualizuj przepis
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const {
      title,
      ingredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags,
      nutritionalValues
    } = req.body;
    
    // Znajdź przepis
    const recipe = await Recipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // Aktualizuj pola
    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients;
    if (steps) recipe.steps = steps;
    if (preparationTime !== undefined) recipe.preparationTime = preparationTime;
    if (difficulty) recipe.difficulty = difficulty;
    if (servings) recipe.servings = servings;
    if (tags) recipe.tags = tags;
    if (nutritionalValues) recipe.nutritionalValues = nutritionalValues;
    
    await recipe.save();
    
    res.status(200).json({
      message: 'Przepis zaktualizowany pomyślnie',
      recipeId: recipe._id
    });
  } catch (error) {
    console.error('Błąd aktualizacji przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Usuń przepis (soft delete)
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Znajdź przepis
    const recipe = await Recipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // Wykonaj soft delete
    recipe.isDeleted = true;
    await recipe.save();
    
    res.status(200).json({ message: 'Przepis usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
}; 