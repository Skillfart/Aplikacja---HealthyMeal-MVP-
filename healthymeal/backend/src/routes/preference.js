/**
 * Trasy API związane z preferencjami użytkownika
 */
const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Wszystkie trasy wymagają uwierzytelnienia
router.use(auth);

// Przykładowa trasa - pobranie preferencji użytkownika
router.get('/', (req, res) => {
  return res.status(200).json({ message: 'Preferencje użytkownika' });
});

// Przykładowa trasa - aktualizacja preferencji użytkownika
router.put('/', (req, res) => {
  return res.status(200).json({ message: 'Preferencje zaktualizowane' });
});

module.exports = router; 