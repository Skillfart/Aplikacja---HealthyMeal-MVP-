/**
 * Hierarchia klas błędów dla serwisu OpenRouter
 * Pliki te definiują różne typy błędów, które mogą wystąpić podczas korzystania
 * z serwisu OpenRouter i komunikacji z AI.
 */

/**
 * Bazowa klasa błędów OpenRouter
 */
class OpenRouterError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Błąd autentykacji - problem z kluczem API lub dostępem
 */
class AuthenticationError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('AUTH_ERROR', message, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Błąd limitu zapytań - przekroczenie przydziału lub brak kredytów
 */
class RateLimitError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('RATE_LIMIT', message, originalError);
    this.name = 'RateLimitError';
  }
}

/**
 * Błąd modelu - problem z używanym modelem AI
 */
class ModelError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('MODEL_ERROR', message, originalError);
    this.name = 'ModelError';
  }
}

/**
 * Błąd sieci - problem z połączeniem
 */
class NetworkError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('NETWORK_ERROR', message, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Błąd przetwarzania - problem z przetwarzaniem żądania lub odpowiedzi
 */
class ProcessingError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('PROCESSING_ERROR', message, originalError);
    this.name = 'ProcessingError';
  }
}

/**
 * Błąd timeout - przekroczenie czasu oczekiwania na odpowiedź
 */
class TimeoutError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('TIMEOUT', message, originalError);
    this.name = 'TimeoutError';
  }
}

/**
 * Błąd konfiguracji - problem z konfiguracją serwisu
 */
class ConfigurationError extends OpenRouterError {
  constructor(message, originalError = null) {
    super('CONFIG_ERROR', message, originalError);
    this.name = 'ConfigurationError';
  }
}

module.exports = {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  ModelError,
  NetworkError,
  ProcessingError,
  TimeoutError,
  ConfigurationError
}; 