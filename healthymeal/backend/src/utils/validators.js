// Email validation
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim();
  
  // Basic regex check
  if (!emailRegex.test(trimmedEmail)) return false;
  
  // Additional checks for edge cases
  // No consecutive dots
  if (trimmedEmail.includes('..')) return false;
  
  // No starting or ending dots
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false;
  
  // Domain part should not start or end with dots
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) return false;
  
  const domain = parts[1];
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  
  return true;
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Recipe validation
export const validateRecipe = (recipe) => {
  if (!recipe || typeof recipe !== 'object') return false;
  
  // Title is required and not empty
  if (!recipe.title || recipe.title.trim().length === 0) return false;
  
  // Ingredients are required and not empty
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return false;
  
  // Instructions are required
  if (!recipe.instructions || recipe.instructions.trim().length === 0) return false;
  
  // Preparation time should be positive
  if (recipe.preparationTime && (typeof recipe.preparationTime !== 'number' || recipe.preparationTime < 0)) return false;
  
  // Difficulty should be valid
  if (recipe.difficulty) {
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(recipe.difficulty)) return false;
  }
  
  // Servings should be positive
  if (recipe.servings !== undefined && (typeof recipe.servings !== 'number' || recipe.servings <= 0)) return false;
  
  return true;
};

// MongoDB ObjectId validation
export const validateRecipeId = (id) => {
  if (!id || typeof id !== 'string') return false;
  
  // MongoDB ObjectId is 24 hex characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (!input) return '';
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}; 