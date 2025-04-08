const ModifiedRecipe = require('../models/ModifiedRecipe');
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

// Pobierz wszystkie zmodyfikowane przepisy użytkownika
exports.getUserModifiedRecipes = async (req, res) => {
  try {
    const { originalRecipeId, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * limit;
    
    // Podstawowy filtr: zmodyfikowane przepisy należące do użytkownika i nieusunięte
    let query = {
      'user._id': userId,
      isDeleted: false
    };
    
    // Dodaj filtr oryginalnego przepisu, jeśli podano
    if (originalRecipeId) {
      query['originalRecipe._id'] = originalRecipeId;
    }
    
    // Pobierz zmodyfikowane przepisy z paginacją
    const modifiedRecipes = await ModifiedRecipe.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title originalRecipe changesDescription nutritionalValues.carbsReduction createdAt');
    
    // Pobierz całkowitą liczbę zmodyfikowanych przepisów spełniających kryteria
    const total = await ModifiedRecipe.countDocuments(query);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      modifiedRecipes
    });
  } catch (error) {
    console.error('Błąd pobierania zmodyfikowanych przepisów:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobierz jeden zmodyfikowany przepis
exports.getModifiedRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const modifiedRecipe = await ModifiedRecipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!modifiedRecipe) {
      return res.status(404).json({ message: 'Zmodyfikowany przepis nie znaleziony' });
    }
    
    res.status(200).json(modifiedRecipe);
  } catch (error) {
    console.error('Błąd pobierania zmodyfikowanego przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Zapisz zmodyfikowany przepis z AI
exports.saveModifiedRecipe = async (req, res) => {
  try {
    const {
      originalRecipeId,
      title,
      ingredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags,
      nutritionalValues,
      changesDescription,
      aiPrompt
    } = req.body;
    
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    // Sprawdź czy oryginalny przepis istnieje i należy do użytkownika
    const originalRecipe = await Recipe.findOne({
      _id: originalRecipeId,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!originalRecipe) {
      return res.status(404).json({ message: 'Oryginalny przepis nie znaleziony' });
    }
    
    // Utwórz zmodyfikowany przepis
    const modifiedRecipe = new ModifiedRecipe({
      originalRecipe: {
        _id: originalRecipe._id,
        title: originalRecipe.title
      },
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
      changesDescription,
      aiPrompt,
      isDeleted: false
    });
    
    await modifiedRecipe.save();
    
    // Zwiększ licznik użycia AI
    req.user.aiUsage.count += 1;
    await req.user.save();
    
    res.status(201).json({
      message: 'Zmodyfikowany przepis zapisany pomyślnie',
      modifiedRecipeId: modifiedRecipe._id
    });
  } catch (error) {
    console.error('Błąd zapisywania zmodyfikowanego przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Usuń zmodyfikowany przepis (soft delete)
exports.deleteModifiedRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Znajdź zmodyfikowany przepis
    const modifiedRecipe = await ModifiedRecipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!modifiedRecipe) {
      return res.status(404).json({ message: 'Zmodyfikowany przepis nie znaleziony' });
    }
    
    // Wykonaj soft delete
    modifiedRecipe.isDeleted = true;
    await modifiedRecipe.save();
    
    res.status(200).json({ message: 'Zmodyfikowany przepis usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania zmodyfikowanego przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
}; 