const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { validatePassword, validateEmail, sanitizeInput } = require('../utils/security');
const crypto = require('crypto');

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minut

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^.+@.+\..+$/, 'Please enter a valid email']
  },
  supabaseId: {
    type: String,
    required: true,
    unique: true
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
      default: 100
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
    minuteCount: {
      type: Number,
      default: 0
    },
    hourCount: {
      type: Number,
      default: 0
    },
    dayCount: {
      type: Number,
      default: 0
    },
    lastMinute: {
      type: Date,
      default: Date.now
    },
    lastHour: {
      type: Date,
      default: Date.now
    },
    lastDay: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
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
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security;
      return ret;
    }
  }
});

// Indeksy
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ supabaseId: 1 }, { unique: true });
userSchema.index({ 'security.passwordResetToken': 1 });
userSchema.index({ 'aiUsage.lastReset': 1 });
userSchema.index({ role: 1 });

// Middleware do resetowania licznika AI o północy
userSchema.pre('save', function(next) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!this.aiUsage.date || this.aiUsage.date < today) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
  }
  
  next();
});

// Hash hasła przed zapisem
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.lastPasswordChange = new Date();
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Metody instancji
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };
  
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || '7d'
  });
};

userSchema.methods.canMakeAiRequest = function() {
  const now = new Date();
  const lastReset = this.aiUsage.lastReset;
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.aiUsage.requestsToday = 0;
    this.aiUsage.lastReset = now;
    return true;
  }

  return this.aiUsage.requestsToday < 5;
};

userSchema.methods.incrementAiRequests = async function() {
  if (!this.canMakeAiRequest()) {
    throw new Error('Przekroczono dzienny limit zapytań AI');
  }

  this.aiUsage.requestsToday += 1;
  this.aiUsage.lastRequest = new Date();
  await this.save();
};

userSchema.methods.isLocked = function() {
  if (!this.security.accountLocked) return false;
  
  const now = new Date();
  if (now > this.security.lockUntil) {
    this.security.accountLocked = false;
    this.security.failedLoginAttempts = 0;
    this.security.lockUntil = undefined;
    this.save();
    return false;
  }
  
  return true;
};

userSchema.methods.incrementLoginAttempts = async function() {
  this.security.failedLoginAttempts += 1;
  
  if (this.security.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.security.accountLocked = true;
    this.security.lockUntil = new Date(Date.now() + LOCK_TIME);
  }
  
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
  this.security.failedLoginAttempts = 0;
  this.security.accountLocked = false;
  this.security.lockUntil = undefined;
  await this.save();
};

userSchema.methods.generatePasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.security.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.security.passwordResetExpires = Date.now() + 3600000; // 1 godzina
  
  await this.save();
  return resetToken;
};

// Metoda sprawdzająca dostępność dziennych modyfikacji AI
userSchema.methods.hasRemainingAIModifications = function() {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const hour = Math.floor(now / 3600000);
  const day = Math.floor(now / 86400000);

  // Reset liczników jeśli minął odpowiedni czas
  if (Math.floor(this.aiUsage.lastMinute / 60000) < minute) {
    this.aiUsage.minuteCount = 0;
    this.aiUsage.lastMinute = now;
  }
  if (Math.floor(this.aiUsage.lastHour / 3600000) < hour) {
    this.aiUsage.hourCount = 0;
    this.aiUsage.lastHour = now;
  }
  if (Math.floor(this.aiUsage.lastDay / 86400000) < day) {
    this.aiUsage.dayCount = 0;
    this.aiUsage.lastDay = now;
  }

  return this.aiUsage.dayCount < 5 && 
         this.aiUsage.hourCount < 3 && 
         this.aiUsage.minuteCount < 1;
};

// Metoda inkrementująca licznik użycia AI
userSchema.methods.incrementAIUsage = async function() {
  if (!this.hasRemainingAIModifications()) {
    throw new Error('Osiągnięto dzienny limit modyfikacji AI');
  }
  
  this.aiUsage.count += 1;
  await this.save();
  
  return {
    count: this.aiUsage.count,
    remaining: 5 - this.aiUsage.count,
    resetAt: new Date(this.aiUsage.lastReset).setHours(24, 0, 0, 0)
  };
};

// Metoda aktualizująca preferencje
userSchema.methods.updatePreferences = async function(newPreferences) {
  this.preferences = {
    ...this.preferences,
    ...newPreferences
  };
  
  await this.save();
  return this.preferences;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 