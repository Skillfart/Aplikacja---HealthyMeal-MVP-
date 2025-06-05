const { DatabaseError, NotFoundError } = require('../repositories/BaseRepository');

const errorHandler = (error, req, res, next) => {
  console.error(`[Error] ${error.name}: ${error.message}`, {
    stack: error.stack,
    details: error.details
  });

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: error.message
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      status: 'error',
      message: 'Wystąpił błąd bazy danych',
      details: process.env.NODE_ENV === 'development' ? error.originalError : undefined
    });
  }

  // Walidacja
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Błąd walidacji danych',
      details: error.details
    });
  }

  // Autoryzacja
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Brak autoryzacji'
    });
  }

  // Domyślna obsługa błędów
  return res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Wystąpił nieoczekiwany błąd',
    details: process.env.NODE_ENV === 'development' ? error.details : undefined
  });
};

module.exports = errorHandler; 