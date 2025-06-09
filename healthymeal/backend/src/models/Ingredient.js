import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['dairy', 'meat', 'vegetables', 'fruits', 'grains', 'spices', 'other']
  },
  nutritionalValues: {
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fat: {
      type: Number,
      required: true
    },
    fiber: {
      type: Number,
      default: 0
    }
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'ml', 'szt', 'łyżka', 'łyżeczka', 'szklanka']
  },
  isAllergen: {
    type: Boolean,
    default: false
  },
  allergenCategory: {
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', null],
    default: null
  }
}, {
  timestamps: true
});

export const Ingredient = mongoose.model('Ingredient', ingredientSchema); 