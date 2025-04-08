const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  alternativeNames: [{
    type: String,
    trim: true
  }],
  nutritionalValues: {
    calories: {
      type: Number,
      required: true,
      min: 0
    },
    carbs: {
      type: Number,
      required: true,
      min: 0
    },
    protein: {
      type: Number,
      required: true,
      min: 0
    },
    fat: {
      type: Number,
      required: true,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0,
      default: 0
    },
    sugar: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  glycemicIndex: {
    type: Number,
    min: 0,
    max: 100
  },
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts']
  }],
  category: {
    type: String,
    required: true,
    enum: ['dairy', 'meat', 'vegetable', 'fruit', 'grain', 'legume', 'fat', 'sweetener', 'spice', 'other']
  }
}, {
  timestamps: true
});

// Indeks tekstowy dla wyszukiwania
ingredientSchema.index({ name: 'text', alternativeNames: 'text' });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient; 