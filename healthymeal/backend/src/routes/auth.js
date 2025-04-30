const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Trasy dla kompatybilności ze starszym kodem (symulowane)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Nowe endpointy do integracji z Supabase
router.post('/verify-token', authController.verifyToken);
router.get('/profile', authController.getProfile);

module.exports = router; 