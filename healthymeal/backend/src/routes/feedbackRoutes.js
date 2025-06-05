const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware do weryfikacji tokenu
const verifyToken = (req, res, next) => {
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

// Pobierz wszystkie opinie
router.get('/', (req, res) => {
  return res.json([
    {
      id: '1',
      recipeId: '1',
      userId: 'test-user-id',
      rating: 5,
      comment: 'Testowa opinia 1',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      recipeId: '2',
      userId: 'test-user-id',
      rating: 4,
      comment: 'Testowa opinia 2',
      createdAt: new Date().toISOString()
    }
  ]);
});

// Dodaj nową opinię
router.post('/', verifyToken, (req, res) => {
  return res.json({
    id: 'new-feedback-id',
    ...req.body,
    userId: req.user.id,
    createdAt: new Date().toISOString()
  });
});

// Aktualizuj opinię
router.put('/:id', verifyToken, (req, res) => {
  return res.json({
    id: req.params.id,
    ...req.body,
    userId: req.user.id,
    updatedAt: new Date().toISOString()
  });
});

// Usuń opinię
router.delete('/:id', verifyToken, (req, res) => {
  return res.json({ message: 'Opinia została usunięta' });
});

module.exports = router; 