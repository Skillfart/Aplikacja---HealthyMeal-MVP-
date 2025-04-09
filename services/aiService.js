const axios = require('axios');
const config = require('../config/env');

/**
 * Buduje prompt dla AI na podstawie przepisu i preferencji użytkownika
 * @param {Object} recipe - Obiekt przepisu
 * @param {Object} userPreferences - Preferencje użytkownika
 * @returns {Object} - Obiekt z promptem
 */
function buildPrompt(recipe, userPreferences) {
  return {
    prompt: `
      Modify the following recipe to match these dietary preferences:
      Diet type: ${userPreferences.dietType}
      Maximum carbs per serving: ${userPreferences.maxCarbs}g
      Excluded products: ${userPreferences.excludedProducts.join(', ')}
      Allergens to avoid: ${userPreferences.allergens.join(', ')}

      Original recipe:
      Title: ${recipe.title}
      Ingredients:
      ${recipe.ingredients.map(i => `- ${i.quantity} ${i.unit} ${i.ingredient.name}`).join('\n')}
      
      Steps:
      ${recipe.steps.map(s => `${s.number}. ${s.description}`).join('\n')}
      
      Original nutritional values:
      Total carbs: ${recipe.nutritionalValues.totalCarbs}g
      Carbs per serving: ${recipe.nutritionalValues.carbsPerServing}g
      
      Please provide:
      1. Modified ingredients with quantities and units
      2. Modified steps if needed
      3. Estimated new nutritional values
      4. A brief description of changes made
      
      Format your response in JSON with these keys: title, ingredients, steps, nutritionalValues, changesDescription
    `
  };
}

/**
 * Wywołuje API AI z promptem
 * @param {Object} prompt - Obiekt z promptem
 * @returns {Promise<Object>} - Odpowiedź API AI
 */
async function callAI(prompt) {
  try {
    const response = await axios.post(config.AI_API_URL, {
      model: config.AI_MODEL,
      prompt: prompt.prompt,
      max_tokens: 1500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${config.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: config.AI_TIMEOUT
    });

    return response.data;
  } catch (error) {
    console.error('Error calling AI API:', error.message);
    
    // Dostarczamy bardziej szczegółowe informacje o błędzie
    if (error.response) {
      // Błąd odpowiedzi API
      throw new Error(`AI API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // Nie otrzymano odpowiedzi
      throw new Error('AI service did not respond. Please try again later.');
    } else {
      // Błąd podczas konfiguracji żądania
      throw new Error(`AI service error: ${error.message}`);
    }
  }
}

/**
 * Przetwarza odpowiedź z API AI
 * @param {Object} aiResponse - Odpowiedź API AI
 * @param {Object} originalRecipe - Oryginalny przepis
 * @returns {Object} - Przetworzona odpowiedź
 */
function processResponse(aiResponse, originalRecipe) {
  try {
    // Próba wyodrębnienia JSON z odpowiedzi tekstowej
    let response;
    try {
      const jsonMatch = aiResponse.completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        response = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Invalid response format from AI service');
    }

    // Obliczanie redukcji węglowodanów
    const originalCarbs = originalRecipe.nutritionalValues.totalCarbs;
    const newCarbs = response.nutritionalValues.totalCarbs;
    const carbsReduction = originalCarbs > 0 
      ? Math.round((originalCarbs - newCarbs) / originalCarbs * 100)
      : 0;

    // Przygotowanie finalnej odpowiedzi
    return {
      title: response.title || originalRecipe.title,
      ingredients: response.ingredients.map(ing => ({
        ingredient: {
          name: ing.name
        },
        quantity: ing.quantity,
        unit: ing.unit,
        isModified: ing.isModified || false,
        substitutionReason: ing.substitutionReason || null
      })),
      steps: response.steps.map(step => ({
        number: step.number,
        description: step.description,
        isModified: step.isModified || false,
        modificationReason: step.modificationReason || null
      })),
      nutritionalValues: {
        totalCarbs: response.nutritionalValues.totalCarbs,
        carbsReduction
      },
      changesDescription: response.changesDescription
    };
  } catch (error) {
    console.error('Error processing AI response:', error);
    throw new Error('Failed to process AI response');
  }
}

module.exports = {
  buildPrompt,
  callAI,
  processResponse
}; 