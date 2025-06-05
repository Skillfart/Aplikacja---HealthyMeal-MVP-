const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // W trybie testowym z włączonymi mockami pomijamy połączenie z bazą danych
    if (config.nodeEnv === 'test' && config.useMocks === true) {
      console.log('Tryb testowy z mockami - pomijam połączenie z bazą danych');
      return true;
    }

    // Sprawdź czy URI jest ustawione
    if (!config.mongoUri) {
      console.warn('Brak URI bazy danych MongoDB - używam bazy w pamięci dla testów');
      
      if (config.nodeEnv === 'test') {
        // W trybie testowym kontynuujemy bez bazy danych
        return true;
      } else {
        throw new Error('Brak URI bazy danych MongoDB');
      }
    }

    // Połącz z bazą danych
    const conn = await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB połączone: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('Błąd połączenia z MongoDB:', error);
    
    // W trybie testowym nie kończymy procesu przy błędzie połączenia
    if (config.nodeEnv === 'test') {
      console.warn('Kontynuuję w trybie testowym mimo braku połączenia z bazą danych');
      return false;
    } else {
      // W trybie produkcyjnym/rozwojowym kończymy proces
      process.exit(1);
    }
  }
};

module.exports = connectDB; 