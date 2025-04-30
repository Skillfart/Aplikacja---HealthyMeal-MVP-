const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback');
const { verifyToken } = require('../middleware/auth');

// Wszystkie poniższe trasy wymagają uwierzytelnienia
router.use(verifyToken);

// Pobierz wszystkie zgłoszenia użytkownika
router.get('/', feedbackController.getUserFeedbacks);

// Pobierz jedno zgłoszenie
router.get('/:id', feedbackController.getFeedbackById);

// Utwórz nowe zgłoszenie
router.post('/', feedbackController.createFeedback);

// Aktualizuj zgłoszenie
router.put('/:id', feedbackController.updateFeedback);

module.exports = router; 