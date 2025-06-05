const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Wszystkie trasy wymagają uwierzytelnienia
router.use(authMiddleware);

// Pobierz dane dashboardu
router.get('/', dashboardController.getDashboard);

module.exports = router; 