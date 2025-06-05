const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sprawdź czy jesteśmy w środowisku deweloperskim/testowym
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'ml', 'szt', 'łyżka', 'łyżeczka', 'szklanka', 'do smaku']
  },
  category: {
    type: String,
    enum: ['warzywa', 'owoce', 'mięso', 'nabiał', 'zboża', 'przyprawy', 'inne'],
    required: true
  },
  notes: {
    type: String,
    maxlength: 200
  }
});

const nutritionSchema = new Schema({
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
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
    required: true,
    min: 0
  }
});

const recipeSchema = new Schema({
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
  timestamps: true,
  // Opcja pozwalająca na elastyczne pola (szczególnie przydatne dla danych z AI)
  strict: isDev ? false : true
});

// Indeksy
recipeSchema.index({ userId: 1, createdAt: -1 });
recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ isDeleted: 1 });
recipeSchema.index({ 'nutritionalValues.carbsPerServing': 1 });
recipeSchema.index({ difficulty: 1 });

// Middleware do obliczania wartości odżywczych na porcję
recipeSchema.pre('save', function(next) {
  if (this.isModified('nutritionalValues') || this.isModified('servings')) {
    this.nutritionalValues.carbsPerServing = this.nutritionalValues.carbs / this.servings;
  }
  next();
});

// Metoda do obliczania wartości odżywczych
recipeSchema.methods.calculateNutritionalValues = async function() {
  const Ingredient = mongoose.model('Ingredient');
  const totalValues = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };

  for (const item of this.ingredients) {
    const ingredient = await Ingredient.findById(item.ingredient);
    if (ingredient) {
      const factor = item.amount / 100; // wartości są na 100g
      totalValues.calories += ingredient.nutritionalValues.calories * factor;
      totalValues.protein += ingredient.nutritionalValues.protein * factor;
      totalValues.carbs += ingredient.nutritionalValues.carbs * factor;
      totalValues.fat += ingredient.nutritionalValues.fat * factor;
      totalValues.fiber += ingredient.nutritionalValues.fiber * factor;
    }
  }

  this.nutritionalValues = {
    ...totalValues,
    carbsPerServing: totalValues.carbs / this.servings
  };

  await this.save();
  return this.nutritionalValues;
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe; 