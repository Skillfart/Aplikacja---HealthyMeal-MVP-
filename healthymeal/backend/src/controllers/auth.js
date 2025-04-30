const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

// Inicjalizacja klienta Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || config.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || config.SUPABASE_SERVICE_KEY
);

/**
 * Rejestracja użytkownika - zmieniona by przekazywać sukces bez tworzenia użytkownika
 * Ponieważ używamy Supabase do autentykacji
 */
exports.register = async (req, res) => {
  try {
    console.log('Backend symuluje rejestrację, używamy Supabase Auth');
    
    // Zwracamy sukces bez faktycznego tworzenia użytkownika w MongoDB
    res.status(201).json({
      message: 'Użytkownik zarejestrowany pomyślnie (symulacja - używamy Supabase)',
      token: 'fake-jwt-token-because-we-use-supabase',
      user: {
        id: 'fake-user-id',
        email: req.body.email,
        preferences: {
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        }
      }
    });
  } catch (error) {
    console.error('Błąd symulacji rejestracji:', error);
    res.status(500).json({ message: 'Błąd serwera podczas rejestracji' });
  }
};

/**
 * Logowanie użytkownika - zmienione by przekazywać sukces bez faktycznej weryfikacji
 * Ponieważ używamy Supabase do autentykacji
 */
exports.login = async (req, res) => {
  try {
    console.log('Backend symuluje logowanie, używamy Supabase Auth');
    
    // Zwracamy sukces bez faktycznej weryfikacji użytkownika w MongoDB
    res.status(200).json({
      message: 'Zalogowano pomyślnie (symulacja - używamy Supabase)',
      token: 'fake-jwt-token-because-we-use-supabase',
      user: {
        id: 'fake-user-id',
        email: req.body.email,
        preferences: {
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        },
        aiUsage: {
          date: new Date(),
          count: 0
        }
      }
    });
  } catch (error) {
    console.error('Błąd symulacji logowania:', error);
    res.status(500).json({ message: 'Błąd serwera podczas logowania' });
  }
};

/**
 * Weryfikacja tokenu Supabase - endpoint pomocniczy
 * Użyteczne dla frontendu do sprawdzenia ważności tokenu bez pobierania dodatkowych danych
 */
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Weryfikacja tokenu w Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        valid: false 
      });
    }
    
    return res.status(200).json({ 
      message: 'Token is valid',
      valid: true,
      user: data.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ message: 'Error verifying token' });
  }
};

/**
 * Pobieranie danych profilu użytkownika
 * Używa tokenu Supabase do identyfikacji użytkownika
 */
exports.getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Weryfikacja tokenu w Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Pobranie dodatkowych danych profilu z Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError && !profileError.message.includes('No row found')) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ message: 'Error fetching profile data' });
    }
    
    res.status(200).json({
      user: data.user,
      profile: profileData || { 
        diet_type: 'normal',
        max_carbs: 0,
        excluded_products: [],
        allergens: []
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
}; 