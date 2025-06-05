const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthymeal';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info('Połączono z bazą MongoDB');

    mongoose.connection.on('error', (err) => {
      logger.error('Błąd połączenia MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Rozłączono z MongoDB');
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('Zamknięto połączenie z MongoDB z powodu zakończenia aplikacji');
        process.exit(0);
      } catch (err) {
        logger.error('Błąd podczas zamykania połączenia z MongoDB:', err);
        process.exit(1);
      }
    });

  } catch (err) {
    logger.error('Nie można połączyć się z MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB; 