const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree']
  }],
  favoriteRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  recentRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['pl', 'en'],
      default: 'pl'
    }
  },
  stats: {
    totalRecipes: {
      type: Number,
      default: 0
    },
    favoriteRecipes: {
      type: Number,
      default: 0
    },
    recentRecipes: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

const Preferences = mongoose.model('Preferences', preferencesSchema);

module.exports = Preferences; 