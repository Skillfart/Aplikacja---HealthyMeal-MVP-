/**
 * @typedef {Object} UserPreferences
 * @property {string} dietType - Typ diety użytkownika
 * @property {number} maxCarbs - Maksymalna ilość węglowodanów
 * @property {string[]} excludedProducts - Lista wykluczonych produktów
 * @property {string[]} allergens - Lista alergenów
 */

/**
 * @typedef {Object} User
 * @property {string} id - ID użytkownika
 * @property {string} email - Email użytkownika
 * @property {string} [name] - Imię użytkownika (opcjonalne)
 * @property {UserPreferences} preferences - Preferencje użytkownika
 */

/**
 * @typedef {Object} Session
 * @property {string} access_token - Token dostępu
 * @property {string} refresh_token - Token odświeżania
 * @property {User} user - Dane użytkownika
 */

/**
 * @typedef {Object} AuthError
 * @property {string} message - Komunikat błędu
 * @property {string} status - Status błędu
 */

/**
 * @typedef {Object} AuthResponse
 * @property {Session} [data] - Dane sesji (jeśli sukces)
 * @property {AuthError} [error] - Błąd (jeśli wystąpił)
 */

export {}; 