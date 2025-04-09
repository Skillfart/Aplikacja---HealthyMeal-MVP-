const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Middleware weryfikujący token JWT i dodający użytkownika do obiektu żądania
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 */
async function authenticate(req, res, next) {
  try {
    // Sprawdzenie, czy token jest obecny w nagłówku Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Pobranie tokenu z nagłówka
    const token = authHeader.split(' ')[1];
    
    // Weryfikacja tokenu
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Sprawdzenie, czy użytkownik istnieje
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Dodanie informacji o użytkowniku do obiektu żądania
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = {
  authenticate
}; 