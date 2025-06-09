import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredients: [{
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  steps: [{
    number: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    estimatedTime: {
      type: Number, // w minutach
      required: true
    }
  }],
  preparationTime: {
    type: Number, // całkowity czas w minutach
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  tags: [{
    type: String
  }],
  nutritionalValues: {
    totalCalories: Number,
    totalCarbs: Number,
    totalProtein: Number,
    totalFat: Number,
    totalFiber: Number,
    caloriesPerServing: Number,
    carbsPerServing: Number
  },
  isModified: {
    type: Boolean,
    default: false
  },
  originalRecipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null
  }
}, {
  timestamps: true
});

// Middleware do automatycznego obliczania wartości odżywczych
recipeSchema.pre('save', async function(next) {
  if (this.isModified('ingredients')) {
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;

    // Pobierz wszystkie składniki
    const populatedRecipe = await this.populate('ingredients.ingredient');
    
    for (const item of populatedRecipe.ingredients) {
      const { nutritionalValues } = item.ingredient;
      const ratio = item.quantity / 100; // przelicznik na 100g/ml

      totalCalories += nutritionalValues.calories * ratio;
      totalCarbs += nutritionalValues.carbs * ratio;
      totalProtein += nutritionalValues.protein * ratio;
      totalFat += nutritionalValues.fat * ratio;
      totalFiber += (nutritionalValues.fiber || 0) * ratio;
    }

    this.nutritionalValues = {
      totalCalories: Math.round(totalCalories),
      totalCarbs: Math.round(totalCarbs),
      totalProtein: Math.round(totalProtein),
      totalFat: Math.round(totalFat),
      totalFiber: Math.round(totalFiber),
      caloriesPerServing: Math.round(totalCalories / this.servings),
      carbsPerServing: Math.round(totalCarbs / this.servings)
    };
  }
  next();
});

export const Recipe = mongoose.model('Recipe', recipeSchema); 