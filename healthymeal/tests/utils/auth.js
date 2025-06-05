// Narzędzia pomocnicze do testowania autoryzacji
import jwt from 'jsonwebtoken';

/**
 * Generuje token JWT do testów
 * @param {Object} payload - Dane do zakodowania w tokenie
 * @param {string} secret - Sekret do podpisania tokenu
 * @param {Object} options - Opcje tokenu
 * @returns {string} - Token JWT
 */
export const generateToken = (payload = {}, secret = 'test-secret', options = {}) => {
  const defaultPayload = {
    sub: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    ...payload
  };

  const defaultOptions = {
    expiresIn: '1h',
    ...options
  };

  return jwt.sign(defaultPayload, secret, defaultOptions);
};

/**
 * Weryfikuje token JWT
 * @param {string} token - Token JWT do weryfikacji
 * @param {string} secret - Sekret do weryfikacji tokenu
 * @returns {Object} - Zdekodowany payload
 */
export const verifyToken = (token, secret = 'test-secret') => {
  return jwt.verify(token, secret);
};

/**
 * Generuje nagłówek Authorization
 * @param {string} token - Token do użycia
 * @returns {Object} - Nagłówek HTTP
 */
export const createAuthHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`
  };
};

export default {
  generateToken,
  verifyToken,
  createAuthHeader
}; 