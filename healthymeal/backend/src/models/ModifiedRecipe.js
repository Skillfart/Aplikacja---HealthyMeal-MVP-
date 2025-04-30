const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modifiedRecipeSchema = new mongoose.Schema({
  originalRecipe: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
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
    isModified: {
      type: Boolean,
      default: false
    },
    substitutionReason: {
      type: String,
      trim: true
    }
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
    },
    isModified: {
      type: Boolean,
      default: false
    },
    modificationReason: {
      type: String,
      trim: true
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
    },
    carbsReduction: {
      type: Number
    },
    caloriesReduction: {
      type: Number
    }
  },
  changesDescription: {
    type: String,
    required: true
  },
  aiPrompt: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indeksy
modifiedRecipeSchema.index({ "user._id": 1, "isDeleted": 1 });
modifiedRecipeSchema.index({ "originalRecipe._id": 1 });
modifiedRecipeSchema.index({ "title": "text" });
modifiedRecipeSchema.index({ "tags": 1 });
modifiedRecipeSchema.index({ "isDeleted": 1 });

const ModifiedRecipe = mongoose.model('ModifiedRecipe', modifiedRecipeSchema);

module.exports = ModifiedRecipe; 