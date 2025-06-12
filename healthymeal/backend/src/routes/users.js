import express from 'express';
import User from '../models/User.js';
import { userPreferencesValidationRules } from '../middleware/validator.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Pobierz preferencje użytkownika
router.get('/preferences', async (req, res) => {
  try {
    res.json({ preferences: req.mongoUser.preferences });
  } catch (error) {
    console.error('Błąd podczas pobierania preferencji:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania preferencji' });
  }
});

// Aktualizuj preferencje użytkownika
router.put('/preferences', userPreferencesValidationRules, async (req, res) => {
  try {
    // Sprawdź błędy walidacji
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dietType, maxCarbs, excludedProducts, allergens } = req.body;
    
    // Aktualizuj tylko te pola, które zostały przesłane
    if (dietType !== undefined) req.mongoUser.preferences.dietType = dietType;
    if (maxCarbs !== undefined) req.mongoUser.preferences.maxCarbs = maxCarbs;
    if (excludedProducts !== undefined) req.mongoUser.preferences.excludedProducts = excludedProducts;
    if (allergens !== undefined) req.mongoUser.preferences.allergens = allergens;

    await req.mongoUser.save();
    res.json({ message: 'Preferencje zaktualizowane', preferences: req.mongoUser.preferences });
  } catch (error) {
    console.error('Błąd podczas aktualizacji preferencji:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji preferencji' });
  }
});

// Pobierz profil użytkownika
router.get('/profile', async (req, res) => {
  try {
    res.json(req.mongoUser);
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania profilu' });
  }
});

// Aktualizuj dane profilu
router.put('/profile', async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name === 'string') {
      req.mongoUser.name = name;
    }

    await req.mongoUser.save();
    res.json({ message: 'Profil zaktualizowany', user: req.mongoUser });
  } catch (error) {
    console.error('Błąd podczas aktualizacji profilu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji profilu' });
  }
});

// Pobierz statystyki użycia AI
router.get('/ai-usage', async (req, res) => {
  try {
    // Sprawdź czy minął dzień od ostatniego resetu
    await req.mongoUser.resetAIUsageIfNeeded();

    const dailyLimit = process.env.DAILY_AI_LIMIT || 5;
    res.json({
      current: req.mongoUser.aiUsage.count,
      limit: dailyLimit,
      remaining: dailyLimit - req.mongoUser.aiUsage.count
    });
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk AI:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania statystyk AI' });
  }
});

// Inkrementuj licznik użycia AI
router.post('/ai-usage', async (req, res) => {
  try {
    const dailyLimit = process.env.DAILY_AI_LIMIT || 5;
    
    // Sprawdź czy minął dzień
    await req.mongoUser.resetAIUsageIfNeeded();
    
    // Sprawdź czy nie przekroczono limitu
    if (req.mongoUser.aiUsage.count >= dailyLimit) {
      return res.status(429).json({ 
        error: 'Przekroczono dzienny limit użycia AI',
        current: req.mongoUser.aiUsage.count,
        limit: dailyLimit
      });
    }
    
    // Inkrementuj licznik
    req.mongoUser.aiUsage.count += 1;
    await req.mongoUser.save();
    
    res.json({
      message: 'Licznik AI zaktualizowany',
      current: req.mongoUser.aiUsage.count,
      limit: dailyLimit,
      remaining: dailyLimit - req.mongoUser.aiUsage.count
    });
  } catch (error) {
    console.error('Błąd podczas inkrementacji licznika AI:', error);
    res.status(500).json({ error: 'Błąd serwera podczas inkrementacji licznika AI' });
  }
});

export default router; 