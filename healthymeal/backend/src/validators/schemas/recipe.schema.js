const Joi = require('joi');

const ingredientSchema = Joi.object({
  ingredient: Joi.string().required().messages({
    'string.empty': 'ID składnika jest wymagane',
    'any.required': 'ID składnika jest wymagane'
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Ilość musi być liczbą',
    'number.min': 'Ilość nie może być ujemna',
    'any.required': 'Ilość jest wymagana'
  }),
  unit: Joi.string().max(20).required().messages({
    'string.empty': 'Jednostka jest wymagana',
    'string.max': 'Jednostka nie może być dłuższa niż 20 znaków',
    'any.required': 'Jednostka jest wymagana'
  }),
  notes: Joi.string().max(200).allow('').optional().messages({
    'string.max': 'Notatki nie mogą być dłuższe niż 200 znaków'
  })
});

const nutritionalValuesSchema = Joi.object({
  calories: Joi.number().min(0).required().messages({
    'number.base': 'Kalorie muszą być liczbą',
    'number.min': 'Kalorie nie mogą być ujemne',
    'any.required': 'Kalorie są wymagane'
  }),
  protein: Joi.number().min(0).required().messages({
    'number.base': 'Białko musi być liczbą',
    'number.min': 'Białko nie może być ujemne',
    'any.required': 'Białko jest wymagane'
  }),
  carbs: Joi.number().min(0).required().messages({
    'number.base': 'Węglowodany muszą być liczbą',
    'number.min': 'Węglowodany nie mogą być ujemne',
    'any.required': 'Węglowodany są wymagane'
  }),
  fat: Joi.number().min(0).required().messages({
    'number.base': 'Tłuszcz musi być liczbą',
    'number.min': 'Tłuszcz nie może być ujemny',
    'any.required': 'Tłuszcz jest wymagany'
  }),
  fiber: Joi.number().min(0).required().messages({
    'number.base': 'Błonnik musi być liczbą',
    'number.min': 'Błonnik nie może być ujemny',
    'any.required': 'Błonnik jest wymagany'
  })
});

const createRecipeSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Tytuł jest wymagany',
    'string.min': 'Tytuł musi mieć co najmniej 3 znaki',
    'string.max': 'Tytuł nie może być dłuższy niż 200 znaków',
    'any.required': 'Tytuł jest wymagany'
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Opis jest wymagany',
    'string.min': 'Opis musi mieć co najmniej 10 znaków',
    'string.max': 'Opis nie może być dłuższy niż 2000 znaków',
    'any.required': 'Opis jest wymagany'
  }),
  ingredients: Joi.array().items(ingredientSchema).min(1).required().messages({
    'array.min': 'Przepis musi mieć co najmniej jeden składnik',
    'any.required': 'Lista składników jest wymagana'
  }),
  instructions: Joi.array().items(
    Joi.string().min(10).max(1000).required().messages({
      'string.empty': 'Instrukcja jest wymagana',
      'string.min': 'Instrukcja musi mieć co najmniej 10 znaków',
      'string.max': 'Instrukcja nie może być dłuższa niż 1000 znaków'
    })
  ).min(1).required().messages({
    'array.min': 'Przepis musi mieć co najmniej jedną instrukcję',
    'any.required': 'Lista instrukcji jest wymagana'
  }),
  preparationTime: Joi.number().min(1).required().messages({
    'number.base': 'Czas przygotowania musi być liczbą',
    'number.min': 'Czas przygotowania musi być większy niż 0',
    'any.required': 'Czas przygotowania jest wymagany'
  }),
  servings: Joi.number().min(1).required().messages({
    'number.base': 'Liczba porcji musi być liczbą',
    'number.min': 'Liczba porcji musi być większa niż 0',
    'any.required': 'Liczba porcji jest wymagana'
  }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required().messages({
    'any.only': 'Poziom trudności musi być jednym z: easy, medium, hard',
    'any.required': 'Poziom trudności jest wymagany'
  }),
  nutritionalValues: nutritionalValuesSchema.required().messages({
    'any.required': 'Wartości odżywcze są wymagane'
  }),
  tags: Joi.array().items(
    Joi.string().max(30).messages({
      'string.max': 'Tag nie może być dłuższy niż 30 znaków'
    })
  ).optional()
});

const updateRecipeSchema = createRecipeSchema.fork(
  ['title', 'description', 'ingredients', 'instructions', 'preparationTime', 'servings', 'difficulty', 'nutritionalValues'],
  (field) => field.optional()
);

const getRecipeSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'ID przepisu jest wymagane',
    'any.required': 'ID przepisu jest wymagane'
  })
});

const deleteRecipeSchema = getRecipeSchema;

const listRecipesSchema = Joi.object({
  page: Joi.number().min(1).default(1).messages({
    'number.base': 'Numer strony musi być liczbą',
    'number.min': 'Numer strony musi być większy niż 0'
  }),
  limit: Joi.number().min(1).max(100).default(10).messages({
    'number.base': 'Limit musi być liczbą',
    'number.min': 'Limit musi być większy niż 0',
    'number.max': 'Limit nie może być większy niż 100'
  }),
  sort: Joi.string().valid('createdAt', 'title', 'difficulty').default('createdAt').messages({
    'any.only': 'Sortowanie musi być jednym z: createdAt, title, difficulty'
  }),
  order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Kolejność musi być jednym z: asc, desc'
  }),
  search: Joi.string().max(100).allow('').optional().messages({
    'string.max': 'Fraza wyszukiwania nie może być dłuższa niż 100 znaków'
  }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional().messages({
    'any.only': 'Poziom trudności musi być jednym z: easy, medium, hard'
  }),
  maxCarbs: Joi.number().min(0).optional().messages({
    'number.base': 'Maksymalna ilość węglowodanów musi być liczbą',
    'number.min': 'Maksymalna ilość węglowodanów nie może być ujemna'
  }),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional()
});

module.exports = {
  createRecipeSchema,
  updateRecipeSchema,
  getRecipeSchema,
  deleteRecipeSchema,
  listRecipesSchema
}; 