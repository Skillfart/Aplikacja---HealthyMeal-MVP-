const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Podaj prawidłowy adres email']
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
      default: 0,
      min: 0
    },
    excludedProducts: [{
      type: String,
      trim: true
    }],
    allergens: [{
      type: String,
      enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts']
    }]
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
    type: Date
  }
}, {
  timestamps: true
});

// Middleware do hashowania hasła przed zapisem
userSchema.pre('save', async function(next) {
  // Jeśli hasło nie zostało zmodyfikowane, przejdź dalej
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Wygeneruj salt
    const salt = await bcrypt.genSalt(10);
    
    // Hashuj hasło z wygenerowanym saltem
    this.password = await bcrypt.hash(this.password, salt);
    
    // Resetowanie licznika AI jeśli data jest starsza niż dzisiaj
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!this.aiUsage.date || this.aiUsage.date < today) {
      this.aiUsage.date = today;
      this.aiUsage.count = 0;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Metoda do porównywania hasła
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Metoda sprawdzająca, czy użytkownik ma jeszcze dostępne modyfikacje AI
userSchema.methods.hasRemainingAIModifications = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Resetowanie licznika jeśli data jest starsza niż dzisiaj
  if (!this.aiUsage.date || this.aiUsage.date < today) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
    return true;
  }
  
  // Sprawdź, czy użytkownik nie przekroczył limitu (5 modyfikacji dziennie)
  return this.aiUsage.count < 5;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 