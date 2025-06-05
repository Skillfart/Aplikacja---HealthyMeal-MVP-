const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getUserPreferences, updateUserPreferences } = require('../controllers/userPreferencesController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);

module.exports = router; 