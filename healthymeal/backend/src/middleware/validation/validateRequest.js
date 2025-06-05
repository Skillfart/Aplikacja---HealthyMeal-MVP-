const { ValidationError } = require('../../errors/BaseError');

const validateRequest = (schema, req) => {
  if (!schema) {
    throw new Error('Schema is required for validation');
  }

  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (error) {
    const details = error.details.reduce((acc, detail) => {
      const path = detail.path.join('.');
      acc[path] = detail.message;
      return acc;
    }, {});

    throw new ValidationError('Błąd walidacji danych', details);
  }

  return true;
};

module.exports = {
  validateRequest
}; 