const Recipe = require('../../models/Recipe');
const mongoose = require('mongoose');
const { buildUserQuery } = require('./utils');
const { validateObjectId } = require('./validation');

// Pobierz wszystkie przepisy użytkownika
exports.getUserRecipes = async (req, res) => {
  try {
    const { search, tags, difficulty, maxPreparationTime, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = buildUserQuery(req.user);
    
    // Dodaj filtry wyszukiwania
    if (search) query.$text = { $search: search };
    if (tags) query.tags = { $in: tags.split(',') };
    if (difficulty) query.difficulty = difficulty;
    if (maxPreparationTime) query.preparationTime = { $lte: parseInt(maxPreparationTime) };
    
    const recipes = await Recipe.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title ingredients.ingredient.name preparationTime difficulty servings tags nutritionalValues createdAt');
    
    const total = await Recipe.countDocuments(query);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      recipes
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobierz jeden przepis
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Nieprawidłowy format identyfikatora przepisu' });
    }
    
    const query = {
      _id: id,
      ...buildUserQuery(req.user)
    };
    
    const recipe = await Recipe.findOne(query);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Wyszukiwanie przepisów
exports.searchRecipes = async (req, res) => {
  try {
    const { query, tags, ingredients, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const searchQuery = buildUserQuery(req.user);
    
    if (query) searchQuery.$text = { $search: query };
    if (tags) searchQuery.tags = { $in: tags.split(',') };
    if (ingredients) {
      searchQuery['ingredients.ingredient.name'] = { 
        $in: ingredients.split(',').map(i => new RegExp(i.trim(), 'i')) 
      };
    }
    
    const recipes = await Recipe.find(searchQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title ingredients tags nutritionalValues');
    
    const total = await Recipe.countDocuments(searchQuery);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      recipes
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
}; 