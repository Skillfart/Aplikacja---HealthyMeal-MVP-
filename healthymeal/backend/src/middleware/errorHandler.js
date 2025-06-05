const logger = require('../utils/logger');
const { BaseError, ValidationError, AuthError, NotFoundError } = require('../errors/BaseError');

/**
 * Middleware do obsługi błędów
 * @param {Error} err - Obiekt błędu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Loguj błąd
  logger.error('Błąd aplikacji:', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.user?.id
    }
  });

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        message: err.message,
        details: err.details
      }
    });
  }

  if (err instanceof AuthError) {
    return res.status(401).json({
      error: {
        message: err.message
      }
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: {
        message: err.message
      }
    });
  }

  if (err instanceof BaseError) {
    return res.status(err.statusCode || 500).json({
      error: {
        message: err.message,
        code: err.code
      }
    });
  }

  // Obsługa błędów Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Błąd walidacji danych',
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        message: 'Nieprawidłowy format danych',
        field: err.path
      }
    });
  }

  // Obsługa błędów JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        message: 'Nieprawidłowy token autoryzacji'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token autoryzacji wygasł'
      }
    });
  }

  // Obsługa błędów Supabase
  if (err.status === 400) {
    return res.status(400).json({
      error: {
        message: err.message || 'Błąd zapytania do Supabase'
      }
    });
  }

  if (err.status === 401) {
    return res.status(401).json({
      error: {
        message: err.message || 'Brak autoryzacji w Supabase'
      }
    });
  }

  // Obsługa błędów MongoDB
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Konflikt danych - podana wartość już istnieje'
      });
    }
    return res.status(500).json({
      message: 'Błąd bazy danych'
    });
  }

  // Domyślna obsługa błędów
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Wystąpił błąd serwera'
      : err.message
  });
};

module.exports = errorHandler; 