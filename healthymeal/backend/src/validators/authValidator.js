const Joi = require('joi');

/**
 * Schemat walidacji dla rejestracji
 */
const registrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Nieprawidłowy format adresu email',
      'any.required': 'Adres email jest wymagany'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Hasło musi mieć co najmniej 8 znaków',
      'string.pattern.base': 'Hasło musi zawierać co najmniej jedną wielką literę i jedną cyfrę',
      'any.required': 'Hasło jest wymagane'
    })
});

/**
 * Schemat walidacji dla logowania
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Nieprawidłowy format adresu email',
      'any.required': 'Adres email jest wymagany'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Hasło jest wymagane'
    })
});

/**
 * Walidacja danych rejestracji
 * @param {Object} data - Dane do walidacji
 * @returns {Object} Wynik walidacji
 */
const validateRegistration = (data) => {
  return registrationSchema.validate(data, { abortEarly: false });
};

/**
 * Walidacja danych logowania
 * @param {Object} data - Dane do walidacji
 * @returns {Object} Wynik walidacji
 */
const validateLogin = (data) => {
  return loginSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRegistration,
  validateLogin
}; 