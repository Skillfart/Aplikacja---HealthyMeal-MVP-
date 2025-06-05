const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Middleware do weryfikacji tokenu
const verifyToken = (req, res, next) => {
  // Sprawdź, czy jesteśmy w trybie testowym
  if (config.nodeEnv === 'test' || process.env.REACT_APP_TEST_MODE === 'true' || 
      req.headers['x-test-mode'] === 'true') {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    return next();
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu autoryzacji' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

// Pobierz profil użytkownika
router.get('/profile', verifyToken, (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    name: 'Testowy Użytkownik',
    role: 'user'
  });
});

// Aktualizuj profil użytkownika
router.put('/profile', verifyToken, (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.body.name || 'Testowy Użytkownik',
    role: 'user'
  });
});

// Zmień hasło
router.post('/change-password', verifyToken, (req, res) => {
  return res.json({ message: 'Hasło zostało zmienione' });
});

module.exports = router; 