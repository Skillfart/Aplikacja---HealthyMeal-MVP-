import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Pobierz profil użytkownika
router.get('/profile', async (req, res) => {
  try {
    let user = await User.findOne({ supabaseId: req.user.id });
    
    // Jeśli użytkownik nie istnieje w MongoDB, stwórz go
    if (!user) {
      user = await User.create({
        supabaseId: req.user.id,
        email: req.user.email,
        preferences: {
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania profilu' });
  }
});

// Aktualizuj preferencje użytkownika
router.put('/preferences', async (req, res) => {
  try {
    const { dietType, maxCarbs, excludedProducts, allergens } = req.body;
    
    const user = await User.findOne({ supabaseId: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    user.preferences = {
      dietType: dietType || user.preferences.dietType,
      maxCarbs: maxCarbs !== undefined ? maxCarbs : user.preferences.maxCarbs,
      excludedProducts: excludedProducts || user.preferences.excludedProducts,
      allergens: allergens || user.preferences.allergens
    };

    await user.save();
    res.json({ message: 'Preferencje zaktualizowane', preferences: user.preferences });
  } catch (error) {
    console.error('Błąd podczas aktualizacji preferencji:', error);
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji preferencji' });
  }
});

// Pobierz statystyki użycia AI
router.get('/ai-usage', async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    user.resetAiUsageIfNewDay();
    await user.save();

    res.json(user.aiUsage);
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk AI:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania statystyk AI' });
  }
});

export default router; 