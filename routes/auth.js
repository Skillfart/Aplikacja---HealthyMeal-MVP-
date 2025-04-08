const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Rejestracja nowego użytkownika
router.post('/register', authController.register);

// Logowanie użytkownika
router.post('/login', authController.login);

module.exports = router; 