/**
 * Hierarchia klas błędów dla serwisu OpenRouter
 */

/**
 * Bazowa klasa błędów OpenRouter
 */
class OpenRouterError extends Error {
  constructor(message, code, httpStatus = null, originalError = null) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.originalError = originalError;
  }
}

/**
 * Błąd autoryzacji
 */
class AuthenticationError extends OpenRouterError {
  constructor(message, httpStatus, originalError) {
    super(message, 'AUTHENTICATION_ERROR', httpStatus, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Błąd limitów zapytań
 */
class RateLimitError extends OpenRouterError {
  constructor(message, httpStatus, originalError) {
    super(message, 'RATE_LIMIT_ERROR', httpStatus, originalError);
    this.name = 'RateLimitError';
  }
}

/**
 * Błąd modelu
 */
class ModelError extends OpenRouterError {
  constructor(message, httpStatus, originalError) {
    super(message, 'MODEL_ERROR', httpStatus, originalError);
    this.name = 'ModelError';
  }
}

/**
 * Błąd sieci
 */
class NetworkError extends OpenRouterError {
  constructor(message, originalError) {
    super(message, 'NETWORK_ERROR', null, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Błąd przetwarzania
 */
class ProcessingError extends OpenRouterError {
  constructor(message, originalError) {
    super(message, 'PROCESSING_ERROR', null, originalError);
    this.name = 'ProcessingError';
  }
}

module.exports = {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  ModelError,
  NetworkError,
  ProcessingError
}; 