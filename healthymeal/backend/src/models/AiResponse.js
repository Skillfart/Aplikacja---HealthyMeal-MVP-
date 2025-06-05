const mongoose = require('mongoose');

const aiResponseSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    required: true
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  modifications: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    reason: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 // Automatyczne usuwanie po 7 dniach
  }
});

// Indeks dla wyszukiwania podobnych zapytań
aiResponseSchema.index({ query: 'text' });

// Indeks dla TTL (Time To Live)
aiResponseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Metoda do znajdowania podobnych zapytań
aiResponseSchema.statics.findSimilar = async function(query, userId) {
  return this.find({
    $text: { $search: query },
    userId
  }).sort({
    score: { $meta: 'textScore' }
  }).limit(1);
};

const AiResponse = mongoose.model('AiResponse', aiResponseSchema);

module.exports = AiResponse; 