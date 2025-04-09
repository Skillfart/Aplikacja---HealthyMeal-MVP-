const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^.+@.+\..+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  preferences: {
    dietType: {
      type: String,
      enum: ['normal', 'keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree'],
      default: 'normal'
    },
    maxCarbs: {
      type: Number,
      min: 0,
      default: 0
    },
    excludedProducts: {
      type: [String],
      default: []
    },
    allergens: {
      type: [String],
      enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'],
      default: []
    }
  },
  aiUsage: {
    date: {
      type: Date,
      default: Date.now
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Metody dla modelu User
userSchema.pre('save', async function(next) {
  // Jeśli hasło zostało zmienione, hashujemy je
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Obsługa resetu licznika AI
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!this.aiUsage.date || this.aiUsage.date < today) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
  }
  
  next();
});

// Metoda do porównywania haseł
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Metoda sprawdzająca dostępne limity AI
userSchema.methods.hasRemainingAIModifications = function(dailyLimit) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!this.aiUsage.date || this.aiUsage.date < today) {
    return true;
  }
  
  return this.aiUsage.count < dailyLimit;
};

module.exports = mongoose.model('User', userSchema); 