const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');

// Załaduj zmienne środowiskowe
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100 // limit każdego IP do 100 requestów na okno
});
app.use(limiter);

// Logowanie requestów
app.use(logger.logRequest);

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthymeal')
  .then(() => {
    logger.info('Połączono z bazą MongoDB');
  })
  .catch((err) => {
    logger.error('Błąd połączenia z MongoDB:', err);
    process.exit(1);
  });

// Podstawowy endpoint dla sprawdzenia czy API działa
app.get('/', (req, res) => {
  res.json({ message: 'HealthyMeal API działa!' });
});

// Importuj routery
const recipeController = require('./controllers/recipe/RecipeController');
const preferencesRouter = require('./routes/preferences');

// Routy dla przepisów
app.get('/api/recipes', recipeController.listRecipes);
app.get('/api/recipes/recent', recipeController.getRecentRecipes);
app.get('/api/recipes/day', recipeController.getRecipeOfDay);
app.get('/api/recipes/:id', recipeController.getRecipe);
app.post('/api/recipes', recipeController.createRecipe);
app.put('/api/recipes/:id', recipeController.updateRecipe);
app.delete('/api/recipes/:id', recipeController.deleteRecipe);
app.get('/api/recipes/compare/:originalId/:modifiedId', recipeController.compareRecipes);

// Dodaj router preferencji
app.use('/api/preferences', preferencesRouter);

// Obsługa błędów
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start serwera
const PORT = process.env.PORT || 3031;
app.listen(PORT, () => {
  logger.info(`Serwer uruchomiony na porcie ${PORT}`);
  logger.info(`Środowisko: ${process.env.NODE_ENV || 'development'}`);
}); 