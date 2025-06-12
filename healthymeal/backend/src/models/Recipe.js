import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  author: {
    type: String,
    required: true,
    index: true
  },
  ingredients: {
    type: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      quantity: {
        type: String,
        required: true,
        trim: true
      },
      unit: {
        type: String,
        required: true,
        trim: true,
        default: 'g'
      }
    }],
    required: true,
    default: []
  },
  instructions: {
    type: [String],
    required: true,
    default: []
  },
  preparationTime: {
    type: Number,
    required: true,
    min: 1,
    default: 30
  },
  servings: {
    type: Number,
    required: true,
    min: 1,
    default: 4
  },
  hashtags: {
    type: [String],
    default: [],
    set: function(tags) {
      // Konwertuj string z przecinkami na tablicę, jeśli potrzeba
      if (typeof tags === 'string') {
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return tags;
    }
  }
}, {
  timestamps: true // Automatycznie dodaje createdAt i updatedAt
});

// Indeksy
recipeSchema.index({ author: 1, createdAt: -1 });
recipeSchema.index({ hashtags: 1 });
recipeSchema.index({ title: 'text', description: 'text' }); // Indeks tekstowy dla wyszukiwania

// Middleware do walidacji hashtags
recipeSchema.pre('save', function(next) {
  if (this.isModified('hashtags')) {
    // Usuń puste tagi i duplikaty
    this.hashtags = [...new Set(this.hashtags.filter(tag => tag.trim().length > 0))];
  }
  next();
});

export const Recipe = mongoose.model('Recipe', recipeSchema); 