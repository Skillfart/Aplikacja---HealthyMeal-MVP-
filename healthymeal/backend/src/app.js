// Główny plik aplikacji backend
try {
  require('openai');
  console.log('Moduł OpenAI załadowany pomyślnie. Używamy prawdziwego API OpenRouter.');
} catch (error) {
  console.warn('Moduł OpenAI nie został zainstalowany. Serwis AI będzie działać w trybie symulacji.');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/env');
const logger = require('./utils/logger');

// Import routes
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const aiRoutes = require('./routes/ai');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: config.maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxRequestSize }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Error',
        message: 'A resource with that identifier already exists'
      });
    }
  }

  // Default error response
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Uruchomienie serwera
if (require.main === module) {
  const PORT = config.port || 3001;
  app.listen(PORT, () => {
    logger.info(`Serwer uruchomiony na porcie ${PORT}`);
    logger.info(`URL API: http://localhost:${PORT}`);
    logger.info(`Środowisko: ${config.nodeEnv}`);
  });
}

module.exports = app;

// Obsługa nieobsłużonych błędów
process.on('uncaughtException', (error) => {
  logger.error('Nieobsłużony błąd:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Nieobsłużone odrzucenie promise:', reason);
}); 