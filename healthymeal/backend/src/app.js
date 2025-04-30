// Dodaj obsługę błędów modułu OpenAI już na wczesnym etapie
try {
  require('openai');
} catch (error) {
  console.warn('Moduł OpenAI nie został znaleziony. Usługi AI będą działać w trybie symulacji.');
  console.warn('Wykonaj instalację pakietu z katalogu backend: npm install openai');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes (będziemy je tworzyć później)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const ingredientRoutes = require('./routes/ingredient');
const preferenceRoutes = require('./routes/preference');
const aiRoutes = require('./routes/ai');
const feedbackRoutes = require('./routes/feedback');

// Inicjalizacja aplikacji
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Obsługa błędów CORS dla pre-flight
app.options('*', cors());

// Połączenie z bazą danych
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthymeal')
  .then(() => console.log('Połączono z bazą danych MongoDB'))
  .catch(err => console.error('Błąd połączenia z bazą danych:', err));

// Obsługa błędów MongoDB
mongoose.connection.on('error', err => {
  console.error('Błąd MongoDB:', err);
});

// Routy
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);

// Statyczna obsługa plików frontendu w trybie produkcyjnym
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Globalny middleware obsługi błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'production' ? 'Szczegóły dostępne w logach serwera' : err.message
  });
});

// Obsługa nieistniejących tras
app.use((req, res) => {
  res.status(404).json({ message: 'Nie znaleziono zasobu' });
});

// Eksport aplikacji
module.exports = app; 