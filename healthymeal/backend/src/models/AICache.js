const mongoose = require('mongoose');
const config = require('../config/env');

const aiCacheSchema = new mongoose.Schema({
  inputHash: {
    type: String,
    required: true,
    unique: true
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  userPreferences: {
    dietType: {
      type: String,
      enum: ['normal', 'keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree'],
      required: true
    },
    maxCarbs: {
      type: Number,
      min: 0,
      required: true
    },
    excludedProducts: {
      type: [String],
      default: []
    },
    allergens: {
      type: [String],
      enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'],
      default: []
    }
  },
  response: {
    title: String,
    ingredients: [{
      ingredient: {
        name: String
      },
      quantity: Number,
      unit: String,
      isModified: Boolean,
      substitutionReason: String
    }],
    steps: [{
      number: Number,
      description: String,
      isModified: Boolean,
      modificationReason: String
    }],
    nutritionalValues: {
      totalCarbs: Number,
      carbsReduction: Number
    },
    changesDescription: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setHours(date.getHours() + config.CACHE_TTL_HOURS);
      return date;
    }
  }
});

// Indeks TTL dla automatycznego usuwania wpisów
aiCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Unikalny indeks dla inputHash
aiCacheSchema.index({ inputHash: 1 }, { unique: true });

module.exports = mongoose.model('AICache', aiCacheSchema); 