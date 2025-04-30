/**
 * Mock dla modelu użytkownika do testów
 */
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Mock dla metod operujących na preferencjach użytkownika
const userMock = {
  // Symulacja użytkownika w testach
  _id: new mongoose.Types.ObjectId(),
  email: 'testuser@example.com',
  password: bcryptjs.hashSync('Test123456', 10),
  
  // Domyślne preferencje dla testów
  preferences: {
    dietType: 'lowCarb',
    maxCarbs: 50,
    excludedProducts: ['mleko', 'jajka'],
    allergens: ['gluten']
  },
  
  // Limity wykorzystania AI
  aiUsage: {
    date: new Date(),
    count: 0
  },
  
  // Metoda do porównywania haseł
  comparePassword: async (candidatePassword) => {
    return bcryptjs.compare(candidatePassword, userMock.password);
  },
  
  // Metoda do sprawdzania limitów AI
  hasRemainingAIModifications: (dailyLimit) => {
    return userMock.aiUsage.count < dailyLimit;
  }
};

module.exports = {
  findOne: async (query) => {
    if (query.email === userMock.email) {
      return { ...userMock };
    }
    return null;
  },
  
  findById: async (id) => {
    if (id.toString() === userMock._id.toString()) {
      return { ...userMock };
    }
    return null;
  },
  
  findByIdAndUpdate: async (id, update) => {
    if (id.toString() === userMock._id.toString()) {
      if (update.preferences) {
        userMock.preferences = {
          ...userMock.preferences,
          ...update.preferences
        };
      }
      
      if (update.aiUsage) {
        userMock.aiUsage = {
          ...userMock.aiUsage,
          ...update.aiUsage
        };
      }
      
      return { ...userMock };
    }
    return null;
  },
  
  create: async (userData) => {
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      ...userData,
      password: bcryptjs.hashSync(userData.password, 10),
      preferences: userData.preferences || {
        dietType: 'normal',
        maxCarbs: 0,
        excludedProducts: [],
        allergens: []
      },
      aiUsage: {
        date: new Date(),
        count: 0
      },
      comparePassword: userMock.comparePassword,
      hasRemainingAIModifications: userMock.hasRemainingAIModifications
    };
    
    return newUser;
  }
}; 