const Ingredient = require('../../models/Ingredient');

// Buduje zapytanie dla filtrowania przepisów użytkownika
exports.buildUserQuery = (user) => {
  const query = { isDeleted: false };
  
  if (user.supabaseId) {
    query['$or'] = [
      { 'user._id': user._id },
      { 'user.supabaseId': user.supabaseId }
    ];
  } else {
    query['user._id'] = user._id;
  }
  
  return query;
};

// Sanityzacja i normalizacja składników
exports.sanitizeIngredients = async (ingredients) => {
  const sanitizedIngredients = [];
  
  for (const item of ingredients) {
    if (!item || !item.ingredient) continue;
    
    const sanitizedName = item.ingredient.name.trim().toLowerCase();
    let ingredientDoc = await Ingredient.findOne({ 
      $or: [
        { name: sanitizedName },
        { alternativeNames: sanitizedName }
      ]
    });
    
    if (!ingredientDoc) {
      ingredientDoc = await Ingredient.create({
        name: sanitizedName,
        nutritionalValues: item.ingredient.nutritionalValues || {}
      });
    }
    
    sanitizedIngredients.push({
      ingredient: {
        _id: ingredientDoc._id,
        name: ingredientDoc.name
      },
      quantity: parseFloat(item.quantity) || 0,
      unit: item.unit.trim().toLowerCase(),
      isOptional: !!item.isOptional
    });
  }
  
  return sanitizedIngredients;
};

// Obliczanie wartości odżywczych
exports.calculateNutritionalValues = async (ingredients, servings) => {
  const totalValues = {
    totalCalories: 0,
    totalCarbs: 0,
    totalProtein: 0,
    totalFat: 0,
    totalFiber: 0
  };
  
  for (const item of ingredients) {
    const ingredient = await Ingredient.findById(item.ingredient._id);
    if (!ingredient || !ingredient.nutritionalValues) continue;
    
    const factor = item.quantity / 100; // wartości są na 100g
    totalValues.totalCalories += (ingredient.nutritionalValues.calories || 0) * factor;
    totalValues.totalCarbs += (ingredient.nutritionalValues.carbs || 0) * factor;
    totalValues.totalProtein += (ingredient.nutritionalValues.protein || 0) * factor;
    totalValues.totalFat += (ingredient.nutritionalValues.fat || 0) * factor;
    totalValues.totalFiber += (ingredient.nutritionalValues.fiber || 0) * factor;
  }
  
  // Dodaj wartości na porcję
  return {
    ...totalValues,
    caloriesPerServing: totalValues.totalCalories / servings,
    carbsPerServing: totalValues.totalCarbs / servings
  };
};

// Konwersja jednostek miary
exports.convertUnit = (value, fromUnit, toUnit) => {
  const conversions = {
    g: {
      kg: (v) => v / 1000,
      mg: (v) => v * 1000
    },
    ml: {
      l: (v) => v / 1000,
      cl: (v) => v / 10
    }
  };
  
  if (fromUnit === toUnit) return value;
  if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
    return conversions[fromUnit][toUnit](value);
  }
  
  return value; // jeśli nie znaleziono konwersji, zwróć oryginalną wartość
}; 