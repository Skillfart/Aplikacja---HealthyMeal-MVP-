const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, getProfile);

module.exports = router;
