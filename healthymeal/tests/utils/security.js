// Narzędzia pomocnicze do testowania bezpieczeństwa
import { vi } from 'vitest';

/**
 * Waliduje hasło użytkownika
 */
export const validatePassword = (password) => {
  // Minimum 8 znaków, co najmniej 1 litera, 1 cyfra i 1 znak specjalny
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
};

/**
 * Waliduje email użytkownika
 */
export const validateEmail = (email) => {
  // Prosty regex do walidacji emaila
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Waliduje token JWT
 */
export const validateToken = (token) => {
  // Sprawdza czy token ma prawidłowy format JWT
  const regex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
  return regex.test(token);
};

/**
 * Sprawdza siłę hasła
 */
export const checkPasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Długość
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Złożoność
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*#?&]/.test(password)) score += 1;
  
  // Maksymalny wynik to 6
  return score;
};

export default {
  validatePassword,
  validateEmail,
  validateToken,
  checkPasswordStrength
}; 