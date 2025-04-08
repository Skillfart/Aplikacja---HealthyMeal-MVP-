const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const aiCacheSchema = new mongoose.Schema({
  inputHash: {
    type: String,
    required: true,
    unique: true
  },
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  userPreferences: {
    dietType: {
      type: String
    },
    maxCarbs: {
      type: Number
    },
    excludedProducts: [{
      type: String
    }],
    allergens: [{
      type: String
    }]
  },
  response: {
    ingredients: {
      type: Array
    },
    steps: {
      type: Array
    },
    nutritionalValues: {
      type: Object
    },
    changesDescription: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Domyślnie wpis wygasa po 24 godzinach od utworzenia
      const date = new Date();
      date.setHours(date.getHours() + 24);
      return date;
    },
    index: { expires: 0 } // TTL indeks
  }
});

// Indeks dla szybkiego wyszukiwania
aiCacheSchema.index({ "inputHash": 1 }, { unique: true });

const AICache = mongoose.model('AICache', aiCacheSchema);

module.exports = AICache; 