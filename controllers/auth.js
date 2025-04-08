const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Rejestracja użytkownika
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sprawdź, czy użytkownik już istnieje
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Użytkownik z tym adresem email już istnieje' });
    }
    
    // Utwórz nowego użytkownika
    const user = new User({
      email,
      password, // hasło będzie hashowane przez middleware przed zapisem
      preferences: {
        dietType: 'normal',
        maxCarbs: 0,
        excludedProducts: [],
        allergens: []
      },
      aiUsage: {
        date: new Date(),
        count: 0
      },
      isActive: true
    });
    
    await user.save();
    
    // Generuj token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'Użytkownik zarejestrowany pomyślnie',
      token,
      user: {
        id: user._id,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ message: 'Błąd serwera podczas rejestracji' });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Znajdź użytkownika
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }
    
    // Sprawdź hasło
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }
    
    // Aktualizuj datę ostatniego logowania
    user.lastLogin = new Date();
    await user.save();
    
    // Generuj token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      message: 'Zalogowano pomyślnie',
      token,
      user: {
        id: user._id,
        email: user.email,
        preferences: user.preferences,
        aiUsage: user.aiUsage
      }
    });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ message: 'Błąd serwera podczas logowania' });
  }
}; 