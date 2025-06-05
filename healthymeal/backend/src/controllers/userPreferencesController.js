const User = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getUserPreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId).select('preferences');
  
  if (!user) {
    throw new AppError('Użytkownik nie został znaleziony', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.preferences
    }
  });
});

exports.updateUserPreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { dietType, maxCarbs, excludedProducts, allergens } = req.body;
  
  const user = await User.findByIdAndUpdate(
    userId,
    {
      preferences: {
        dietType,
        maxCarbs,
        excludedProducts,
        allergens
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).select('preferences');
  
  if (!user) {
    throw new AppError('Użytkownik nie został znaleziony', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.preferences
    }
  });
}); 