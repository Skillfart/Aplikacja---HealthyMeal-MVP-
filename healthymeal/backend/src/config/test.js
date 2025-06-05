const config = require('./config');

const testConfig = {
  // Konfiguracja testowa
  port: 3030,
  baseUrl: 'http://localhost:3030',
  
  // Dane testowego użytkownika
  testUser: {
    email: 'test@example.com',
    password: 'Test123Password!',
  },
  
  // Dane testowego przepisu
  testRecipe: {
    title: 'Test Recipe',
    description: 'This is a test recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['step1', 'step2'],
    cookingTime: 30,
    difficulty: 'easy',
  },
  
  // Konfiguracja testów
  test: {
    timeout: 10000, // 10 sekund
    retries: 3,
  },
  
  // Konfiguracja mocków
  mocks: {
    supabase: {
      url: 'http://localhost:3030',
      key: 'test-key',
    },
    mongodb: {
      uri: 'mongodb://localhost:27017/healthymeal_test',
    },
  },
};

// Eksportuj konfigurację testową
module.exports = testConfig; 