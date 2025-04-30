const app = require('./app');
const config = require('./config/env');

// Uruchom serwer HTTP
const port = config.PORT || 3030;
const server = app.listen(port, () => {
  console.log(`Serwer HealthyMeal działa na porcie ${port}`);
})
.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Błąd serwera: Port ${port} jest już używany.`);
    console.log(`Spróbuj zatrzymać wszystkie uruchomione serwery Node.js lub zmień port w .env`);
  } else {
    console.error('Błąd serwera:', error);
  }
});

// Obsługa zamknięcia serwera
process.on('SIGTERM', () => {
  console.log('Zamykanie serwera...');
  server.close(() => {
    console.log('Serwer zamknięty');
    process.exit(0);
  });
});

module.exports = server; 