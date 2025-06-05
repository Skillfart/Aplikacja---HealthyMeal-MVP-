const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

// Publiczne endpointy
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Chronione endpointy - wymagają tokenu
router.get('/check-session', authenticate, authController.checkSession);

module.exports = router; 