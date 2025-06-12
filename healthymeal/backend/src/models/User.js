import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: ''
  },
  preferences: {
    dietType: {
      type: String,
      enum: ['normal', 'keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree'],
      default: 'normal'
    },
    maxCarbs: {
      type: Number,
      default: 0,
      min: 0
    },
    excludedProducts: {
      type: [String],
      default: []
    },
    allergens: {
      type: [String],
      enum: {
        values: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'],
        message: 'Nieprawidłowy alergen'
      },
      default: []
    }
  },
  aiUsage: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  recipes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Aktualizuj updatedAt przed zapisem
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Metoda do resetowania licznika AI jeśli minął dzień
userSchema.methods.resetAIUsageIfNeeded = function() {
  const now = new Date();
  const lastReset = new Date(this.aiUsage.lastReset);
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.aiUsage.count = 0;
    this.aiUsage.lastReset = now;
  }
};

// Metoda do inkrementacji licznika użycia AI
userSchema.methods.incrementAiUsage = function() {
  this.resetAIUsageIfNeeded();
  
  const dailyLimit = process.env.DAILY_LIMIT || 10;
  
  if (this.aiUsage.count >= dailyLimit) {
    throw new Error('Przekroczono dzienny limit użycia AI');
  }
  
  this.aiUsage.count += 1;
};

// Sprawdź czy model już istnieje przed jego utworzeniem
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
