/**
 * Mock dla aiService.js
 */
module.exports = {
  buildPrompt: (recipe, userPreferences) => {
    return {
      prompt: `Zmodyfikuj przepis: ${recipe.title} zgodnie z preferencjami: ${userPreferences.dietType}`
    };
  },
  
  callAI: async (promptData) => {
    return {
      completion: `{
        "title": "Zmodyfikowany Przepis",
        "ingredients": [
          {
            "name": "Mąka migdałowa",
            "quantity": 80,
            "unit": "g",
            "isModified": true,
            "substitutionReason": "Lower carb alternative"
          }
        ],
        "steps": [
          {
            "number": 1,
            "description": "Wymieszaj wszystkie składniki",
            "isModified": false
          }
        ],
        "nutritionalValues": {
          "totalCarbs": 10
        },
        "changesDescription": "Zastąpiono mąkę pszenną mąką migdałową"
      }`
    };
  },
  
  processResponse: (aiResponse, originalRecipe) => {
    try {
      const response = JSON.parse(aiResponse.completion);
      
      response.nutritionalValues.carbsReduction = originalRecipe.nutritionalValues && originalRecipe.nutritionalValues.totalCarbs 
        ? Math.round(((originalRecipe.nutritionalValues.totalCarbs - response.nutritionalValues.totalCarbs) / originalRecipe.nutritionalValues.totalCarbs) * 100) 
        : 0;
        
      return response;
    } catch (error) {
      throw new Error('Failed to process AI response');
    }
  }
}; 