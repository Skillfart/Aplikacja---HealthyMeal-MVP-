const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/user');

const app = express();

// Konfiguracja CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Endpoint zdrowia
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Routy
app.use('/api/users', userRoutes);

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Wystąpił błąd serwera' });
});

// Obsługa nieznalezionych endpointów
app.use((req, res) => {
  res.status(404).json({ message: 'Nie znaleziono endpointu' });
});

module.exports = app;
