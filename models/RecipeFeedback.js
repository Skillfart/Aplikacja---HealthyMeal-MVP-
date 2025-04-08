const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeFeedbackSchema = new mongoose.Schema({
  user: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  recipeType: {
    type: String,
    enum: ['original', 'modified'],
    required: true
  },
  recipe: {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      // Dynamiczna referencja - może wskazywać na Recipe lub ModifiedRecipe w zależności od recipeType
      refPath: 'recipeType',
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: props => `${props.value} nie jest poprawnym ObjectId!`
      }
    },
    title: {
      type: String,
      required: true
    }
  },
  feedbackType: {
    type: String,
    enum: ['error', 'suggestion', 'improvement'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indeksy
recipeFeedbackSchema.index({ "user._id": 1 });
recipeFeedbackSchema.index({ "recipeType": 1, "recipe._id": 1 });
recipeFeedbackSchema.index({ "status": 1 });

const RecipeFeedback = mongoose.model('RecipeFeedback', recipeFeedbackSchema);

module.exports = RecipeFeedback; 