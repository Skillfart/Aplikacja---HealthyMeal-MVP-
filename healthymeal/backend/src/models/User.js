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
      enum: ['normal', 'vegetarian', 'vegan', 'lowCarb', 'keto'],
      default: 'normal'
    },
    maxCarbs: {
      type: Number,
      default: 0
    },
    excludedProducts: {
      type: [String],
      default: []
    },
    allergens: {
      type: [String],
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
      default: 0
    }
  }
}, {
  timestamps: true
});

// Metoda do resetowania licznika AI jeśli to nowy dzień
userSchema.methods.resetAiUsageIfNewDay = function() {
  const today = new Date();
  const usageDate = this.aiUsage.date;
  
  if (today.getDate() !== usageDate.getDate() ||
      today.getMonth() !== usageDate.getMonth() ||
      today.getFullYear() !== usageDate.getFullYear()) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
  }
};

// Metoda do inkrementacji licznika użycia AI
userSchema.methods.incrementAiUsage = function() {
  this.resetAiUsageIfNewDay();
  if (this.aiUsage.count >= 5) {
    throw new Error('Przekroczono dzienny limit użyć AI');
  }
  this.aiUsage.count += 1;
};

export const User = mongoose.model('User', userSchema);
