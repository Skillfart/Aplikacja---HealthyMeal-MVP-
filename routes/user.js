const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verifyToken } = require('../middleware/auth');

// Wszystkie poniższe trasy wymagają uwierzytelnienia
router.use(verifyToken);

// Pobierz profil użytkownika
router.get('/profile', userController.getProfile);

// Aktualizuj preferencje użytkownika
router.put('/preferences', userController.updatePreferences);

// Zmień hasło użytkownika
router.put('/password', userController.changePassword);

module.exports = router; 