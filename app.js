const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes (będziemy je tworzyć później)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const ingredientRoutes = require('./routes/ingredient');
const aiRoutes = require('./routes/ai');
const feedbackRoutes = require('./routes/feedback');

// Inicjalizacja aplikacji
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);

// Route główny
app.get('/', (req, res) => {
  res.json({ message: 'API HealthyMeal działa!' });
});

// Obsługa błędów
app.use((req, res, next) => {
  const error = new Error('Nie znaleziono');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// Eksport aplikacji
module.exports = app; 