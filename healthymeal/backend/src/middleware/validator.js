import { body, param, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const recipeValidationRules = [
  body('title').trim().notEmpty().withMessage('Tytuł jest wymagany'),
  body('ingredients').isArray().withMessage('Składniki muszą być tablicą'),
  body('ingredients.*.ingredient').notEmpty().withMessage('ID składnika jest wymagane'),
  body('ingredients.*.quantity').isFloat({ min: 0 }).withMessage('Ilość musi być liczbą dodatnią'),
  body('ingredients.*.unit').notEmpty().withMessage('Jednostka jest wymagana'),
  body('steps').isArray().withMessage('Kroki muszą być tablicą'),
  body('steps.*.description').trim().notEmpty().withMessage('Opis kroku jest wymagany'),
  body('steps.*.estimatedTime').isInt({ min: 1 }).withMessage('Szacowany czas musi być liczbą całkowitą większą od 0'),
  body('preparationTime').isInt({ min: 1 }).withMessage('Czas przygotowania musi być liczbą całkowitą większą od 0'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Nieprawidłowy poziom trudności'),
  body('servings').isInt({ min: 1 }).withMessage('Liczba porcji musi być liczbą całkowitą większą od 0')
];

export const userPreferencesValidationRules = [
  body('dietType')
    .isIn(['normal', 'keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree'])
    .withMessage('Nieprawidłowy typ diety'),
  body('maxCarbs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maksymalna ilość węglowodanów musi być liczbą nieujemną'),
  body('excludedProducts')
    .optional()
    .isArray()
    .withMessage('Wykluczone produkty muszą być tablicą'),
  body('allergens')
    .optional()
    .isArray()
    .custom((value) => {
      const validAllergens = ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'];
      return value.every(allergen => validAllergens.includes(allergen));
    })
    .withMessage('Nieprawidłowe alergeny')
];

export const idValidationRule = [
  param('id').isMongoId().withMessage('Nieprawidłowy format ID')
]; 