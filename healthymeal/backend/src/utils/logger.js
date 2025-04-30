/**
 * Prosty logger dla aplikacji, obsługujący różne poziomy logowania
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Domyślny poziom logowania na podstawie środowiska
const currentLevel = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.WARN 
  : LOG_LEVELS.DEBUG;

/**
 * Formatuje wiadomość do logowania
 * @param {string} level - Poziom logowania
 * @param {string} message - Wiadomość
 * @returns {string} - Sformatowana wiadomość
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Loguje wiadomość na poziomie DEBUG
 * @param {string} message - Wiadomość do zalogowania
 */
const debug = (message) => {
  if (currentLevel >= LOG_LEVELS.DEBUG) {
    console.log(formatMessage('DEBUG', message));
  }
};

/**
 * Loguje wiadomość na poziomie INFO
 * @param {string} message - Wiadomość do zalogowania
 */
const info = (message) => {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(formatMessage('INFO', message));
  }
};

/**
 * Loguje wiadomość na poziomie WARN
 * @param {string} message - Wiadomość do zalogowania
 */
const warn = (message) => {
  if (currentLevel >= LOG_LEVELS.WARN) {
    console.warn(formatMessage('WARN', message));
  }
};

/**
 * Loguje wiadomość na poziomie ERROR
 * @param {string} message - Wiadomość do zalogowania
 * @param {Error} [error] - Opcjonalny obiekt błędu
 */
const error = (message, error) => {
  if (currentLevel >= LOG_LEVELS.ERROR) {
    console.error(formatMessage('ERROR', message));
    
    if (error && error instanceof Error) {
      console.error(error.stack || error.message);
    }
  }
};

module.exports = {
  debug,
  info,
  warn,
  error
}; 