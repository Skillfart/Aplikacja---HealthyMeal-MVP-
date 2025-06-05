// Narzędzia do walidacji i bezpieczeństwa
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Waliduje hasło użytkownika
 * @param {string} password - Hasło do zwalidowania
 * @returns {Object} Obiekt z wynikiem walidacji
 */
function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Hasło musi mieć minimum 8 znaków');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać wielką literę');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Hasło musi zawierać cyfrę');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Hasło musi zawierać znak specjalny');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Waliduje email użytkownika
 * @param {string} email - Email do zwalidowania
 * @returns {Object} Obiekt z wynikiem walidacji
 */
function validateEmail(email) {
  const errors = [];
  
  // Prosty regex do walidacji emaila
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !regex.test(email)) {
    errors.push('Niepoprawny format adresu email');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Waliduje token JWT
 * @param {string} token - Token do zwalidowania
 * @returns {Object} Obiekt z wynikiem walidacji
 */
function validateToken(token) {
  const errors = [];
  
  if (!token) {
    errors.push('Brak tokenu');
    return { isValid: false, errors };
  }
  
  // Sprawdź czy token ma format JWT
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
  if (!jwtRegex.test(token)) {
    errors.push('Niepoprawny token');
    return { isValid: false, errors };
  }
  
  try {
    // Dekoduj token bez weryfikacji podpisu, żeby sprawdzić czy jest wygasły
    const decodedToken = jwt.decode(token);
    
    if (!decodedToken) {
      errors.push('Niepoprawny token');
      return { isValid: false, errors };
    }
    
    // Sprawdź datę wygaśnięcia
    if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
      errors.push('Token wygasł');
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  } catch (error) {
    errors.push('Niepoprawny token');
    return { isValid: false, errors };
  }
}

/**
 * Implementacja ochrony przed zbyt częstym logowaniem
 */
const loginAttempts = new Map();

/**
 * Sprawdza czy użytkownik może się zalogować
 * @param {string} email - Email użytkownika
 * @returns {boolean} Czy użytkownik może się zalogować
 */
function canAttemptLogin(email) {
  const now = Date.now();
  const maxAttempts = 3; // Maksymalna liczba prób logowania
  const lockTime = 15 * 60 * 1000; // Czas blokady w milisekundach (15 minut)
  
  if (!loginAttempts.has(email)) {
    loginAttempts.set(email, { attempts: 1, lastAttempt: now });
    return true;
  }
  
  const userData = loginAttempts.get(email);
  
  // Jeśli czas blokady minął, resetujemy licznik
  if (now - userData.lastAttempt > lockTime) {
    loginAttempts.set(email, { attempts: 1, lastAttempt: now });
    return true;
  }
  
  // Jeśli przekroczono limit prób, blokujemy
  if (userData.attempts >= maxAttempts) {
    return false;
  }
  
  // Zwiększamy licznik prób
  userData.attempts += 1;
  userData.lastAttempt = now;
  loginAttempts.set(email, userData);
  
  return true;
}

/**
 * Sanityzacja danych wejściowych, chroniąca przed atakiem XSS
 * @param {string} input - Dane wejściowe do sanityzacji
 * @returns {string} Sanityzowane dane
 */
function sanitizeInput(input) {
  if (!input) return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sprawdza czy dane wejściowe zawierają atak SQL Injection
 * @param {string} input - Dane wejściowe do sprawdzenia
 * @returns {boolean} Czy dane zawierają atak SQL Injection
 */
function containsSqlInjection(input) {
  if (!input) return false;
  
  // Proste wykrywanie SQL Injection
  const sqlPatterns = [
    /'\s*OR\s*'1'='1/i,
    /'\s*OR\s*1=1/i,
    /'\s*OR\s*1\s*--/i,
    /'\s*OR\s*'a'='a/i,
    /'\s*DROP\s+TABLE/i,
    /'\s*DELETE\s+FROM/i,
    /'\s*INSERT\s+INTO/i,
    /'\s*UPDATE\s+.+\s+SET/i,
    /'\s*SELECT\s+.+\s+FROM/i,
    /'\s*UNION\s+SELECT/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Funkcja sprawdzająca siłę hasła
 * @param {string} password - Hasło do sprawdzenia
 * @returns {number} Ocena siły hasła od 0 do 6
 */
function checkPasswordStrength(password) {
  if (!password) return 0;
  
  let score = 0;
  
  // Długość
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Złożoność
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  return score;
}

module.exports = {
  validatePassword,
  validateEmail,
  validateToken,
  canAttemptLogin,
  sanitizeInput,
  containsSqlInjection,
  checkPasswordStrength
}; 