require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

// Konfiguracja portu
const PORT = config.port || 3031;

async function startServer() {
  try {
    // Połączenie z MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info(`Connected to MongoDB: ${config.mongoUri}`);

    // Uruchomienie serwera HTTP
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API URL: http://localhost:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`CORS Origin: ${config.corsOrigin}`);
    });

    // Obsługa zamknięcia serwera
    process.on('SIGTERM', () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        await mongoose.connection.close();
        logger.info('Server and MongoDB connection closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Uruchomienie serwera
const server = startServer();

// Dodajemy middleware do logowania żądań
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  
  // Logowanie typu zawartości i rozmiaru ciała dla żądań POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log(`Content-Type: ${req.headers['content-type']}`);
    console.log(`Body Size: ${req.headers['content-length']} bytes`);
  }
  
  // Przechwytuj odpowiedź
  const originalSend = res.send;
  res.send = function(body) {
    const statusCode = res.statusCode;
    console.log(`Response: ${statusCode} ${res.statusMessage || ''}`);
    
    // Loguj błędy ze szczegółami
    if (statusCode >= 400) {
      try {
        const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
        console.error('Błąd odpowiedzi:', parsedBody);
      } catch (e) {
        console.error('Nie można sparsować ciała odpowiedzi:', body);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});

console.log('Wartości konfiguracyjne:');
console.log('PORT z env:', process.env.PORT);
console.log('PORT z config:', config.port);
console.log('NODE_ENV:', config.nodeEnv);
console.log('SUPABASE_URL:', config.supabaseUrl ? 'ustawione' : 'brak');
console.log('USE_MOCKS:', config.useMocks ? 'true' : 'false');

module.exports = { app, server }; 