const axios = require('axios');
const logger = require('../utils/logger');

const verifyRecaptcha = async (req, res, next) => {
  const captchaToken = req.body.captchaToken;

  // Jeśli jesteśmy w trybie testowym lub deweloperskim, pomijamy weryfikację
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (!captchaToken) {
    return res.status(400).json({ error: 'Token reCAPTCHA jest wymagany' });
  }

  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: captchaToken
      }
    });

    if (!response.data.success) {
      logger.warn('Nieudana weryfikacja reCAPTCHA', {
        ip: req.ip,
        email: req.body.email,
        errors: response.data['error-codes']
      });

      return res.status(400).json({ error: 'Weryfikacja reCAPTCHA nie powiodła się' });
    }

    // Weryfikacja udana
    next();
  } catch (error) {
    logger.error('Błąd weryfikacji reCAPTCHA:', error);
    return res.status(500).json({ error: 'Błąd weryfikacji reCAPTCHA' });
  }
};

module.exports = verifyRecaptcha; 