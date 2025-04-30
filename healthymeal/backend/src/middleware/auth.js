const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware autentykacji wyłączone, gdyż używamy Supabase
 * Przepuszcza wszystkie żądania bez weryfikacji JWT
 */
module.exports = async (req, res, next) => {
  try {
    // Wyłączona weryfikacja JWT - używamy Supabase Auth
    console.log('Auth middleware: przepuszczam żądanie (używamy Supabase Auth)');
    req.user = { role: 'user' };  // Dodajemy podstawowe informacje o użytkowniku
    return next();
    
    /* Oryginalny kod autentykacji JWT - obecnie wyłączony
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Brak autoryzacji. Token nie został dostarczony.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy token. Użytkownik nie istnieje.' });
    }
    
    req.user = user;
    req.token = token;
    next();
    */
  } catch (error) {
    console.error('Błąd autentykacji:', error);
    return res.status(401).json({ message: 'Proszę dokonać autentykacji.' });
  }
};

// Middleware do weryfikacji tokenu JWT
exports.verifyToken = async (req, res, next) => {
  try {
    // Pobierz token z nagłówka
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
    }
    
    // Weryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Znajdź użytkownika
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Użytkownik nie istnieje' });
    }
    
    // Dodaj użytkownika do obiektu req
    req.user = user;
    next();
  } catch (error) {
    console.error('Błąd autoryzacji:', error);
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

// Middleware do sprawdzania, czy użytkownik ma jeszcze dostępne modyfikacje AI
exports.checkAIUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user.hasRemainingAIModifications()) {
      return res.status(403).json({ 
        message: 'Wykorzystano dzienny limit modyfikacji AI (5/5)',
        aiUsage: user.aiUsage
      });
    }
    
    next();
  } catch (error) {
    console.error('Błąd sprawdzania limitu AI:', error);
    return res.status(500).json({ message: 'Błąd serwera' });
  }
}; 