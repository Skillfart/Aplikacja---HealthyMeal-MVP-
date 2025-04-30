const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

// Inicjalizacja klienta Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || config.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || config.SUPABASE_SERVICE_KEY
);

/**
 * Middleware weryfikujący token Supabase i dodający użytkownika do obiektu żądania
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
    
    // Weryfikacja tokenu z Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Supabase auth error:', error);
      
      if (error.message.includes('expired')) {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Dodanie informacji o użytkowniku do obiektu żądania
    req.user = data.user;
    req.userId = data.user.id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = {
  authenticate
}; 