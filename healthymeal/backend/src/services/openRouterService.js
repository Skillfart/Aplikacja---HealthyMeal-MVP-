import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const generatePrompt = (recipe, preferences) => {
  const prompt = `Zmodyfikuj ten przepis zgodnie z następującymi preferencjami żywieniowymi:
Typ diety: ${preferences.dietType}
Maksymalna ilość węglowodanów: ${preferences.maxCarbs}g
Wykluczone produkty: ${preferences.excludedProducts.join(', ')}
Alergeny do unikania: ${preferences.allergens.join(', ')}

Oryginalny przepis:
Tytuł: ${recipe.title}
Składniki:
${recipe.ingredients.map(i => `- ${i.quantity}${i.unit} ${i.ingredient.name}`).join('\n')}

Kroki:
${recipe.steps.map(s => `${s.number}. ${s.description}`).join('\n')}

Proszę o zmodyfikowanie przepisu tak, aby:
1. Był zgodny z podanym typem diety
2. Nie przekraczał limitu węglowodanów
3. Nie zawierał wykluczonych produktów i alergenów
4. Zachował podobny smak i teksturę
5. Był równie sycący i odżywczy

Odpowiedź powinna zawierać:
1. Nowy tytuł
2. Listę składników z ilościami
3. Kroki przygotowania
4. Szacowany czas przygotowania
5. Poziom trudności
6. Ilość porcji`;

  return prompt;
};

const parseAIResponse = (response) => {
  // Tutaj dodamy parsowanie odpowiedzi od AI
  // i konwersję jej na format zgodny z modelem Recipe
  // To jest uproszczona wersja, w rzeczywistości potrzebny będzie
  // bardziej zaawansowany parser
  
  const lines = response.split('\n');
  let currentSection = '';
  const result = {
    title: '',
    ingredients: [],
    steps: [],
    preparationTime: 0,
    difficulty: 'medium',
    servings: 4
  };

  for (const line of lines) {
    if (line.toLowerCase().includes('tytuł:')) {
      result.title = line.split(':')[1].trim();
    } else if (line.toLowerCase().includes('składniki:')) {
      currentSection = 'ingredients';
    } else if (line.toLowerCase().includes('kroki:') || line.toLowerCase().includes('przygotowanie:')) {
      currentSection = 'steps';
    } else if (line.toLowerCase().includes('czas przygotowania:')) {
      result.preparationTime = parseInt(line.match(/\d+/)[0]);
    } else if (line.toLowerCase().includes('poziom trudności:')) {
      const difficulty = line.toLowerCase();
      if (difficulty.includes('łatwy')) result.difficulty = 'easy';
      else if (difficulty.includes('trudny')) result.difficulty = 'hard';
      else result.difficulty = 'medium';
    } else if (line.toLowerCase().includes('porcji:')) {
      result.servings = parseInt(line.match(/\d+/)[0]);
    } else if (line.trim().startsWith('-') && currentSection === 'ingredients') {
      const ingredient = line.trim().substring(1).trim();
      const match = ingredient.match(/(\d+)\s*([a-zA-Z]+)\s+(.+)/);
      if (match) {
        result.ingredients.push({
          quantity: parseInt(match[1]),
          unit: match[2],
          ingredient: match[3],
          isOptional: false
        });
      }
    } else if (line.trim().match(/^\d+\./) && currentSection === 'steps') {
      const step = line.trim().split('. ')[1];
      result.steps.push({
        number: result.steps.length + 1,
        description: step,
        estimatedTime: Math.round(result.preparationTime / 4) // Przybliżony czas na krok
      });
    }
  }

  return result;
};

export const modifyRecipeWithAI = async (recipe, preferences) => {
  try {
    const prompt = generatePrompt(recipe, preferences);
    
    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'openai/gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Jesteś ekspertem od modyfikacji przepisów kulinarnych, który specjalizuje się w dostosowywaniu przepisów do różnych diet i preferencji żywieniowych.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://healthymeal.app',
        'X-Title': 'HealthyMeal App'
      }
    });

    const modifiedRecipe = parseAIResponse(response.data.choices[0].message.content);
    
    return {
      ...recipe.toObject(),
      ...modifiedRecipe,
      nutritionalValues: {
        ...recipe.nutritionalValues,
        // Tutaj możemy dodać przeliczanie wartości odżywczych
        // na podstawie nowych składników
      }
    };
  } catch (error) {
    console.error('Błąd podczas komunikacji z OpenRouter:', error);
    throw new Error('Nie udało się zmodyfikować przepisu przez AI');
  }
}; 