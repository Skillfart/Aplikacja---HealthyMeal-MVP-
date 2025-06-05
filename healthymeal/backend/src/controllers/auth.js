const { createClient } = require('@supabase/supabase-js');
const { validateRegistration, validateLogin } = require('../validators/authValidator');
const { AuthError } = require('../errors/AuthError');
const logger = require('../utils/logger');
const config = require('../config/env');
const User = require('../models/User');

// Inicjalizacja klienta Supabase
const supabase = createClient(config.supabaseUrl, config.SUPABASE_ANON_KEY);

/**
 * Kontroler autentykacji
 * @class AuthController
 */
class AuthController {
  /**
   * Rejestracja nowego użytkownika
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      // Walidacja danych wejściowych
      const { error: validationError } = validateRegistration(req.body);
      if (validationError) {
        throw new AuthError('Nieprawidłowe dane rejestracji', 400, validationError.details);
      }

      const { email, password } = req.body;

      // Rejestracja użytkownika w Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw new AuthError('Błąd rejestracji', 400, error.message);
      }

      // Utworzenie użytkownika w MongoDB
      const mongoUser = await User.create({
        email: email,
        supabaseId: data.user.id,
        preferences: {
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        }
      });

      logger.info('Zarejestrowano nowego użytkownika', { email, mongoId: mongoUser._id });

      res.status(201).json({
        message: 'Użytkownik zarejestrowany pomyślnie',
        token: data.session.access_token,
        user: {
          id: mongoUser._id,
          email: mongoUser.email,
          preferences: mongoUser.preferences,
          aiUsage: mongoUser.aiUsage
        }
      });
    } catch (error) {
      logger.error('Błąd podczas rejestracji', { error });
      throw error;
    }
  }

  /**
   * Logowanie użytkownika
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      // Walidacja danych wejściowych
      const { error: validationError } = validateLogin(req.body);
      if (validationError) {
        throw new AuthError('Nieprawidłowe dane logowania', 400, validationError.details);
      }

      const { email, password } = req.body;

      // Logowanie użytkownika w Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new AuthError('Nieprawidłowe dane logowania', 401, error.message);
      }

      // Pobierz lub utwórz użytkownika w MongoDB
      let mongoUser = await User.findOne({ supabaseId: data.user.id });
      
      if (!mongoUser) {
        // Jeśli użytkownik nie istnieje w MongoDB, utwórz go
        mongoUser = await User.create({
          email: email,
          supabaseId: data.user.id,
          preferences: {
            dietType: 'normal',
            maxCarbs: 0,
            excludedProducts: [],
            allergens: []
          }
        });
        logger.info('Utworzono nowego użytkownika w MongoDB', { email, mongoId: mongoUser._id });
      }

      // Aktualizuj datę ostatniego logowania
      mongoUser.lastLogin = new Date();
      await mongoUser.save();

      logger.info('Zalogowano użytkownika', { email, mongoId: mongoUser._id });

      res.json({
        message: 'Zalogowano pomyślnie',
        token: data.session.access_token,
        user: {
          id: mongoUser._id,
          email: mongoUser.email,
          preferences: mongoUser.preferences,
          aiUsage: mongoUser.aiUsage
        }
      });
    } catch (error) {
      logger.error('Błąd podczas logowania', { error });
      throw error;
    }
  }

  /**
   * Wylogowanie użytkownika
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new AuthError('Błąd wylogowania', 400, error.message);
      }

      logger.info('Wylogowano użytkownika');

      res.json({
        message: 'Wylogowano pomyślnie'
      });
    } catch (error) {
      logger.error('Błąd podczas wylogowania', { error });
      throw error;
    }
  }

  /**
   * Sprawdzenie statusu sesji użytkownika
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkSession(req, res) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        throw new AuthError('Brak aktywnej sesji', 401);
      }

      // Pobierz dane użytkownika z MongoDB
      const mongoUser = await User.findOne({ supabaseId: session.user.id });
      
      if (!mongoUser) {
        throw new AuthError('Nie znaleziono użytkownika', 404);
      }

      res.json({
        message: 'Sesja aktywna',
        user: {
          id: mongoUser._id,
          email: mongoUser.email,
          preferences: mongoUser.preferences,
          aiUsage: mongoUser.aiUsage
        }
      });
    } catch (error) {
      logger.error('Błąd podczas sprawdzania sesji', { error });
      throw error;
    }
  }
}

module.exports = new AuthController(); 