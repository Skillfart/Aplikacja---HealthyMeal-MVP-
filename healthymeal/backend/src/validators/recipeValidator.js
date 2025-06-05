const Joi = require('joi');

const recipeSchema = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),

  ingredients: Joi.array()
    .items(Joi.object({
      ingredient: Joi.object({
        _id: Joi.string()
          .required()
          .messages({
            'string.empty': 'Ingredient ID is required'
          }),
        name: Joi.string()
          .required()
          .messages({
            'string.empty': 'Ingredient name is required'
          })
      }),
      quantity: Joi.number()
        .required()
        .min(0)
        .messages({
          'number.base': 'Quantity must be a number',
          'number.min': 'Quantity cannot be negative'
        }),
      unit: Joi.string()
        .required()
        .messages({
          'string.empty': 'Unit is required'
        }),
      isOptional: Joi.boolean()
        .default(false),
      alternatives: Joi.array()
        .items(Joi.object({
          ingredient: Joi.object({
            _id: Joi.string()
              .required(),
            name: Joi.string()
              .required()
          }),
          quantity: Joi.number()
            .required()
            .min(0),
          unit: Joi.string()
            .required()
        }))
        .default([])
    }))
    .min(1)
    .required()
    .messages({
      'array.min': 'Recipe must have at least one ingredient',
      'array.base': 'Ingredients must be an array'
    }),

  steps: Joi.array()
    .items(Joi.object({
      number: Joi.number()
        .required()
        .min(1)
        .messages({
          'number.base': 'Step number must be a number',
          'number.min': 'Step number must be positive'
        }),
      description: Joi.string()
        .required()
        .trim()
        .min(10)
        .max(500)
        .messages({
          'string.empty': 'Step description is required',
          'string.min': 'Step description must be at least 10 characters long',
          'string.max': 'Step description cannot exceed 500 characters'
        }),
      estimatedTime: Joi.number()
        .min(0)
        .messages({
          'number.min': 'Estimated time cannot be negative'
        })
    }))
    .min(1)
    .required()
    .messages({
      'array.min': 'Recipe must have at least one step',
      'array.base': 'Steps must be an array'
    }),

  preparationTime: Joi.number()
    .required()
    .min(1)
    .messages({
      'number.base': 'Preparation time must be a number',
      'number.min': 'Preparation time must be at least 1 minute'
    }),

  difficulty: Joi.string()
    .required()
    .valid('easy', 'medium', 'hard')
    .messages({
      'any.only': 'Difficulty must be one of: easy, medium, hard'
    }),

  servings: Joi.number()
    .required()
    .min(1)
    .max(50)
    .messages({
      'number.base': 'Servings must be a number',
      'number.min': 'Servings must be at least 1',
      'number.max': 'Servings cannot exceed 50'
    }),

  tags: Joi.array()
    .items(Joi.string().trim())
    .default([])
    .messages({
      'array.base': 'Tags must be an array'
    })
});

const validateRecipe = (recipe) => {
  return recipeSchema.validate(recipe, { abortEarly: false });
};

module.exports = {
  validateRecipe
}; 