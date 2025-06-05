const express = require('express');
const router = express.Router();
const PreferencesController = require('../controllers/preferences/PreferencesController');
const authMiddleware = require('../middleware/auth');

// Wszystkie ścieżki są chronione przez middleware autoryzacji
router.use(authMiddleware);

// Pobierz preferencje użytkownika
router.get('/', PreferencesController.getPreferences);

// Aktualizuj preferencje użytkownika
router.put('/', PreferencesController.updatePreferences);

// Zarządzanie ulubionymi przepisami
router.post('/favorites', PreferencesController.addToFavorites);
router.delete('/favorites/:recipeId', PreferencesController.removeFromFavorites);

// Dodaj przepis do ostatnio oglądanych
router.post('/recent', PreferencesController.addToRecent);

module.exports = router; 