const Joi = require('joi');

const dietTypes = ['keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'normal'];
const allergens = ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'];

const preferencesSchema = Joi.object({
  dietType: Joi.string()
    .valid(...dietTypes)
    .required()
    .messages({
      'any.required': 'Diet type is required',
      'any.only': `Diet type must be one of: ${dietTypes.join(', ')}`
    }),

  maxCarbs: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Maximum carbs value is required',
      'number.min': 'Maximum carbs value cannot be negative'
    }),

  excludedProducts: Joi.array()
    .items(Joi.string().trim().min(1))
    .unique()
    .default([])
    .messages({
      'array.unique': 'Excluded products must be unique',
      'string.min': 'Product name cannot be empty'
    }),

  allergens: Joi.array()
    .items(Joi.string().valid(...allergens))
    .unique()
    .default([])
    .messages({
      'array.unique': 'Allergens must be unique',
      'any.only': `Allergen must be one of: ${allergens.join(', ')}`
    })
});

const validatePreferences = (preferences) => {
  return preferencesSchema.validate(preferences, { abortEarly: false });
};

module.exports = {
  validatePreferences,
  dietTypes,
  allergens
}; 