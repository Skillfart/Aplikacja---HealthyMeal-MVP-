import axios from 'axios';

const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.OPENROUTER_REFERRER,
    'Content-Type': 'application/json'
  }
});

export const modifyRecipe = async (recipe, preferences) => {
  try {
    const prompt = generatePrompt(recipe, preferences);
    
    const response = await openRouterClient.post('/chat/completions', {
      model: process.env.OPENROUTER_DEFAULT_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Jesteś ekspertem kulinarnym specjalizującym się w modyfikacji przepisów zgodnie z preferencjami dietetycznymi.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return parseAIResponse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Błąd podczas komunikacji z OpenRouter:', error);
    throw new Error('Nie udało się zmodyfikować przepisu');
  }
};

const generatePrompt = (recipe, preferences) => {
  return `Zmodyfikuj następujący przepis zgodnie z preferencjami:

Przepis: ${recipe.title}

Obecne składniki:
${recipe.ingredients.map(i => `- ${i.quantity}${i.unit} ${i.ingredient.name}`).join('\n')}

Preferencje dietetyczne:
- Typ diety: ${preferences.dietType}
- Maksymalna ilość węglowodanów: ${preferences.maxCarbs}g
- Wykluczone produkty: ${preferences.excludedProducts.join(', ')}
- Alergeny: ${preferences.allergens.join(', ')}

Proszę o modyfikację przepisu z zachowaniem podobnego smaku i tekstury, ale zgodnie z powyższymi preferencjami.`;
};

const parseAIResponse = (response) => {
  // TODO: Zaimplementować parser odpowiedzi AI
  // Powinien zwrócić obiekt z zmodyfikowanymi składnikami i krokami
  return {
    ingredients: [],
    steps: [],
    nutritionalValues: {}
  };
}; 