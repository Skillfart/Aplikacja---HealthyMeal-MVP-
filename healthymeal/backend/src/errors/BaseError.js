/**
 * Bazowa klasa błędu dla aplikacji
 * @extends Error
 */
class BaseError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Błąd autentykacji
 * @extends BaseError
 */
class AuthenticationError extends BaseError {
  constructor(message = 'Błąd autentykacji', statusCode = 401) {
    super(message, statusCode);
  }
}

/**
 * Błąd autoryzacji
 * @extends BaseError
 */
class AuthorizationError extends BaseError {
  constructor(message = 'Brak uprawnień', statusCode = 403) {
    super(message, statusCode);
  }
}

/**
 * Błąd walidacji
 * @extends BaseError
 */
class ValidationError extends BaseError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends BaseError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

class ConflictError extends BaseError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class ForbiddenError extends BaseError {
  constructor(message) {
    super(message, 403, 'FORBIDDEN_ERROR');
  }
}

class RateLimitError extends BaseError {
  constructor(message) {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class ExternalServiceError extends BaseError {
  constructor(message, service) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

module.exports = {
  BaseError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  RateLimitError,
  ExternalServiceError
}; 