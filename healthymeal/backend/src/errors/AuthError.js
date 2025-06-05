/**
 * Klasa reprezentująca błędy autoryzacji
 * @extends Error
 */
class AuthError extends Error {
  /**
   * Tworzy nowy błąd autoryzacji
   * @param {string} message - Wiadomość błędu
   * @param {number} statusCode - Kod statusu HTTP
   * @param {*} [details] - Dodatkowe szczegóły błędu
   */
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  AuthError
}; 