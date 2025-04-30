const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  preferences: {
    dietType: {
      type: String,
      enum: ['normal', 'vegetarian', 'vegan', 'lowCarb', 'keto', 'paleo', 'glutenFree', 'dairyFree'],
      default: 'normal'
    },
    maxCarbs: {
      type: Number,
      default: 0
    },
    excludedProducts: [String],
    allergens: [String]
  },
  aiUsage: {
    date: {
      type: Date,
      default: Date.now
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Hash hasła przed zapisem
userSchema.pre('save', async function(next) {
  // Tylko jeśli hasło zostało zmodyfikowane lub jest nowe
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metoda do porównywania hasła
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Metoda sprawdzająca, czy użytkownik może wykonać modyfikację AI
userSchema.methods.hasRemainingAIModifications = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const usageDate = new Date(this.aiUsage.date);
  usageDate.setHours(0, 0, 0, 0);
  
  const isToday = today.getTime() === usageDate.getTime();
  
  // Resetuj licznik jeśli to nie dzisiaj
  if (!isToday) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
    return true;
  }
  
  // Sprawdź limit dzienny
  const dailyLimit = parseInt(process.env.AI_DAILY_LIMIT || 5);
  return this.aiUsage.count < dailyLimit;
};

// Indeksy
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 