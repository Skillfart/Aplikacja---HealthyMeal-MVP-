/**
 * Serwis AI do komunikacji z API OpenRouter
 */

const { createOpenRouter } = require('@openrouter/ai-sdk-provider');
const logger = require('../utils/logger');
const Ingredient = require('../models/Ingredient');

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  extraBody: {
    reasoning: {
      max_tokens: 1000,
    },
  },
});

/**
 * Modyfikuj przepis zgodnie z preferencjami
 * @param {Object} recipe - Oryginalny przepis
 * @param {Object} preferences - Preferencje użytkownika
 * @returns {Promise<Object>} Zmodyfikowany przepis
 */
const modifyRecipe = async (recipe, preferences) => {
  try {
    const prompt = `Zmodyfikuj ten przepis zgodnie z następującymi preferencjami:
Preferencje: ${JSON.stringify(preferences)}

Oryginalny przepis:
${JSON.stringify(recipe)}

Zachowaj oryginalną strukturę JSON, ale dostosuj składniki i instrukcje do podanych preferencji.`;

    const response = await openrouter('anthropic/claude-3-sonnet').generate({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const modifiedRecipe = JSON.parse(response.text);
    return modifiedRecipe;
  } catch (error) {
    logger.error('Błąd podczas modyfikacji przepisu:', error);
    throw new Error('Nie udało się zmodyfikować przepisu');
  }
};

/**
 * Generuj sugestie przepisów na podstawie preferencji
 * @param {Object} preferences - Preferencje użytkownika
 * @returns {Promise<Array>} Lista sugestii przepisów
 */
const suggestRecipes = async (preferences) => {
  try {
    const prompt = `Zaproponuj 3 przepisy zgodne z następującymi preferencjami:
${JSON.stringify(preferences)}

Zwróć odpowiedź w formacie JSON jako tablicę obiektów z polami:
- name: nazwa przepisu
- description: krótki opis
- ingredients: lista składników
- instructions: lista kroków przygotowania
- nutritionalInfo: informacje o wartościach odżywczych`;

    const response = await openrouter('anthropic/claude-3-sonnet').generate({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const suggestions = JSON.parse(response.text);
    return suggestions;
  } catch (error) {
    logger.error('Błąd podczas generowania sugestii przepisów:', error);
    throw new Error('Nie udało się wygenerować sugestii przepisów');
  }
};

module.exports = {
  modifyRecipe,
  suggestRecipes
}; 