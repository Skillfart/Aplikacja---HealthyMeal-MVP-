const mongoose = require('mongoose');
const { Schema } = mongoose;

const modifiedRecipeSchema = new Schema({
  originalRecipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  ingredients: [{
    ingredient: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      maxlength: 20
    },
    notes: {
      type: String,
      maxlength: 200
    }
  }],
  instructions: [{
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  }],
  preparationTime: {
    type: Number,
    required: true,
    min: 1
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  nutritionalValues: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    },
    carbsPerServing: {
      type: Number,
      min: 0
    }
  },
  modifications: {
    ingredientsAdded: [{
      type: Schema.Types.ObjectId,
      ref: 'Ingredient'
    }],
    ingredientsRemoved: [{
      type: Schema.Types.ObjectId,
      ref: 'Ingredient'
    }],
    nutritionalChanges: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number
    }
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indeksy
modifiedRecipeSchema.index({ userId: 1, createdAt: -1 });
modifiedRecipeSchema.index({ originalRecipe: 1 });
modifiedRecipeSchema.index({ tags: 1 });
modifiedRecipeSchema.index({ isDeleted: 1 });

const ModifiedRecipe = mongoose.model('ModifiedRecipe', modifiedRecipeSchema);

module.exports = ModifiedRecipe; 