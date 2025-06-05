const mongoose = require('mongoose');
const { Schema } = mongoose;

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'dairy',
      'meat',
      'fish',
      'vegetables',
      'fruits',
      'grains',
      'nuts',
      'legumes',
      'spices',
      'oils',
      'other'
    ]
  },
  nutritionalValues: {
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
  },
  glycemicIndex: {
    type: Number,
    min: 0,
    max: 100
  },
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts']
  }],
  alternatives: [{
    ingredient: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient'
    },
    conversionFactor: {
      type: Number,
      min: 0,
      default: 1
    }
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
ingredientSchema.index({ name: 1 }, { unique: true });
ingredientSchema.index({ category: 1 });
ingredientSchema.index({ allergens: 1 });
ingredientSchema.index({ isDeleted: 1 });
ingredientSchema.index({ 'nutritionalValues.carbs': 1 });
ingredientSchema.index({ glycemicIndex: 1 });

// Metoda do znalezienia alternatyw z niższym indeksem glikemicznym
ingredientSchema.methods.findLowGIAlternatives = async function() {
  if (!this.glycemicIndex) return [];
  
  const alternatives = await this.model('Ingredient').find({
    _id: { $ne: this._id },
    category: this.category,
    glycemicIndex: { $lt: this.glycemicIndex },
    isDeleted: false
  }).sort({ glycemicIndex: 1 });
  
  return alternatives;
};

// Metoda do znalezienia alternatyw bez określonych alergenów
ingredientSchema.methods.findAllergenFreeAlternatives = async function(allergens) {
  const alternatives = await this.model('Ingredient').find({
    _id: { $ne: this._id },
    category: this.category,
    allergens: { $nin: allergens },
    isDeleted: false
  });
  
  return alternatives;
};

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient; 