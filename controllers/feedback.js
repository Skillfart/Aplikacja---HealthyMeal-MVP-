const RecipeFeedback = require('../models/RecipeFeedback');
const Recipe = require('../models/Recipe');
const ModifiedRecipe = require('../models/ModifiedRecipe');
const mongoose = require('mongoose');

// Pobierz wszystkie zgłoszenia użytkownika
exports.getUserFeedbacks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * limit;
    
    // Filtr: zgłoszenia należące do użytkownika
    let query = {
      'user._id': userId
    };
    
    // Dodaj filtr statusu, jeśli podano
    if (status) {
      query.status = status;
    }
    
    // Pobierz zgłoszenia z paginacją
    const feedbacks = await RecipeFeedback.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .select('recipe.title feedbackType description status createdAt');
    
    // Pobierz całkowitą liczbę zgłoszeń spełniających kryteria
    const total = await RecipeFeedback.countDocuments(query);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      feedbacks
    });
  } catch (error) {
    console.error('Błąd pobierania zgłoszeń:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobierz jedno zgłoszenie
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const feedback = await RecipeFeedback.findOne({
      _id: id,
      'user._id': userId
    });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Zgłoszenie nie znalezione' });
    }
    
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Błąd pobierania zgłoszenia:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Utwórz nowe zgłoszenie
exports.createFeedback = async (req, res) => {
  try {
    const { recipeId, recipeType, feedbackType, description } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    // Sprawdź, czy przepis istnieje
    let recipe;
    let recipeModel = recipeType === 'original' ? Recipe : ModifiedRecipe;
    
    recipe = await recipeModel.findById(recipeId);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // Utwórz nowe zgłoszenie
    const feedback = new RecipeFeedback({
      user: {
        _id: userId,
        email: userEmail
      },
      recipeType,
      recipe: {
        _id: recipeId,
        title: recipe.title
      },
      feedbackType,
      description,
      status: 'pending'
    });
    
    await feedback.save();
    
    res.status(201).json({
      message: 'Zgłoszenie dodane pomyślnie',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('Błąd tworzenia zgłoszenia:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Aktualizuj zgłoszenie (możliwość dodania komentarza przez użytkownika)
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user._id;
    
    // Znajdź zgłoszenie
    const feedback = await RecipeFeedback.findOne({
      _id: id,
      'user._id': userId,
      status: 'pending' // Tylko oczekujące zgłoszenia można aktualizować
    });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Zgłoszenie nie znalezione lub nie może być zaktualizowane' });
    }
    
    // Aktualizuj opis
    feedback.description = description;
    await feedback.save();
    
    res.status(200).json({
      message: 'Zgłoszenie zaktualizowane pomyślnie',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('Błąd aktualizacji zgłoszenia:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
}; 