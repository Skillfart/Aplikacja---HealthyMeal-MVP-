/**
 * Walidator siły hasła
 */

const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true
};

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < passwordRules.minLength) {
    errors.push(`Hasło musi mieć co najmniej ${passwordRules.minLength} znaków`);
  }

  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać przynajmniej jedną wielką literę');
  }

  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać przynajmniej jedną małą literę');
  }

  if (passwordRules.requireNumbers && !/\d/.test(password)) {
    errors.push('Hasło musi zawierać przynajmniej jedną cyfrę');
  }

  if (passwordRules.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Hasło musi zawierać przynajmniej jeden znak specjalny');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= passwordRules.minLength) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  return {
    score: strength,
    label: ['Bardzo słabe', 'Słabe', 'Średnie', 'Silne', 'Bardzo silne'][strength]
  };
}; 