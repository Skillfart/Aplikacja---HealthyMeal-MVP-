const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  ingredients: [{
    ingredient: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    alternatives: [{
      ingredient: {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Ingredient'
        },
        name: {
          type: String
        }
      },
      quantity: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        trim: true
      }
    }]
  }],
  steps: [{
    number: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      required: true
    },
    estimatedTime: {
      type: Number,
      min: 0
    }
  }],
  preparationTime: {
    type: Number,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  nutritionalValues: {
    totalCalories: {
      type: Number,
      min: 0
    },
    totalCarbs: {
      type: Number,
      min: 0
    },
    totalProtein: {
      type: Number,
      min: 0
    },
    totalFat: {
      type: Number,
      min: 0
    },
    totalFiber: {
      type: Number,
      min: 0
    },
    caloriesPerServing: {
      type: Number,
      min: 0
    },
    carbsPerServing: {
      type: Number,
      min: 0
    }
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indeksy
recipeSchema.index({ "user._id": 1, "isDeleted": 1 });
recipeSchema.index({ "title": "text" });
recipeSchema.index({ "tags": 1 });
recipeSchema.index({ "isDeleted": 1 });

// Middleware do aktualizacji wartości odżywczych
recipeSchema.pre('save', async function(next) {
  if (this.isModified('ingredients') || this.isModified('servings')) {
    try {
      // Tutaj implementacja przeliczania wartości odżywczych
      // Wymaga faktycznego pobierania danych składników
      // W pełnej implementacji
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe; 