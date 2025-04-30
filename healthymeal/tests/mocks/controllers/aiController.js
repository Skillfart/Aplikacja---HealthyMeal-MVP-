/**
 * Mock dla aiController.js
 */
module.exports = {
  modifyRecipe: async (req, res) => {
    const { recipeId } = req.params;
    const userPreferences = req.body.preferences;
    
    // Symulacja odpowiedzi
    const modifiedRecipe = {
      title: "Zmodyfikowany Przepis Testowy",
      ingredients: [
        {
          name: "Mąka migdałowa",
          quantity: 80,
          unit: "g",
          isModified: true,
          substitutionReason: "Niższa zawartość węglowodanów"
        }
      ],
      steps: [
        {
          number: 1,
          description: "Wymieszaj wszystkie składniki",
          isModified: false
        }
      ],
      nutritionalValues: {
        totalCarbs: 10,
        carbsReduction: 80
      },
      changesDescription: "Zastąpiono mąkę pszenną mąką migdałową"
    };
    
    // Symulacja opóźnienia
    await new Promise(resolve => setTimeout(resolve, 100));
    
    res.status(200).json({
      success: true,
      modifiedRecipe,
      aiUsage: {
        used: 1,
        limit: 5,
        remaining: 4
      }
    });
  },
  
  checkUsageLimit: async (req, res) => {
    res.status(200).json({
      usage: {
        used: 1,
        limit: 5,
        remaining: 4
      },
      canUse: true
    });
  }
}; 