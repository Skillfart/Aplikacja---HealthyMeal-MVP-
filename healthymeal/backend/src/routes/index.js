const express = require('express');
const router = express.Router();
const aiRoutes = require('./aiRoutes');

// Rejestracja tras
router.use('/api/ai', aiRoutes);

// Trasa domyślna dla sprawdzenia API
router.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

module.exports = router; 