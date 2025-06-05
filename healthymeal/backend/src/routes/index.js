const express = require('express');
const userRoutes = require('./userRoutes');
const recipeRoutes = require('./recipes');
const userPreferencesRoutes = require('./userPreferencesRoutes');
const aiRoutes = require('./ai');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

// Rejestracja tras
router.use('/api/users', userRoutes);
router.use('/recipes', recipeRoutes);
router.use('/api/preferences', userPreferencesRoutes);
router.use('/api/ai', aiRoutes);
router.use('/api/dashboard', dashboardRoutes);

// Trasa domyślna dla sprawdzenia API
router.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

module.exports = router;