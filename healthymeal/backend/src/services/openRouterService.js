import axios from 'axios';
import { config } from '../config.js';

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
${recipe.ingredients.map(i => `- ${i.quantity}${i.unit} ${i.name}`).join('\n')}

Kroki:
${recipe.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

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
    instructions: [],
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
      currentSection = 'instructions';
    } else if (line.toLowerCase().includes('czas przygotowania:')) {
      const timeMatch = line.match(/\d+/);
      if (timeMatch) {
        result.preparationTime = parseInt(timeMatch[0]);
      }
    } else if (line.toLowerCase().includes('poziom trudności:')) {
      const difficulty = line.toLowerCase();
      if (difficulty.includes('łatwy')) result.difficulty = 'easy';
      else if (difficulty.includes('trudny')) result.difficulty = 'hard';
      else result.difficulty = 'medium';
    } else if (line.toLowerCase().includes('porcji:')) {
      const servingsMatch = line.match(/\d+/);
      if (servingsMatch) {
        result.servings = parseInt(servingsMatch[0]);
      }
    } else if (line.trim().startsWith('-') && currentSection === 'ingredients') {
      const ingredient = line.trim().substring(1).trim();
      const match = ingredient.match(/(\d+)\s*([a-zA-Z]+)\s+(.+)/);
      if (match) {
        result.ingredients.push({
          quantity: match[1],
          unit: match[2],
          name: match[3]
        });
      }
    } else if (line.trim().match(/^\d+\./) && currentSection === 'instructions') {
      const instruction = line.trim().split('. ')[1];
      if (instruction) {
        result.instructions.push(instruction);
      }
    }
  }

  return result;
};

export const modifyRecipeWithAI = async (recipe, preferences) => {
  try {
    console.log('🔍 OpenRouter - Starting AI modification');
    console.log('🔍 OpenRouter - Recipe:', recipe.title);
    console.log('🔍 OpenRouter - Preferences:', preferences);
    
    const prompt = generatePrompt(recipe, preferences);
    console.log('🔍 OpenRouter - Generated prompt length:', prompt.length);
    
    console.log('🔍 OpenRouter - API Key length:', config.OPENROUTER_API_KEY ? config.OPENROUTER_API_KEY.length : 'Missing');
    console.log('🔍 OpenRouter - API Key preview:', config.OPENROUTER_API_KEY ? `${config.OPENROUTER_API_KEY.substring(0, 20)}...${config.OPENROUTER_API_KEY.substring(-10)}` : 'Missing');
    
    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'openai/gpt-4o-mini',
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
        'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
        'HTTP-Referer': config.OPENROUTER_REFERER || 'https://healthymeal.app',
        'X-Title': 'HealthyMeal App'
      }
    });

    console.log('✅ OpenRouter - AI response received');
    console.log('🔍 OpenRouter - Response status:', response.status);
    
    const aiContent = response.data.choices[0].message.content;
    console.log('🔍 OpenRouter - AI content length:', aiContent.length);
    
    const modifiedRecipe = parseAIResponse(aiContent);
    console.log('✅ OpenRouter - Recipe parsed:', modifiedRecipe.title);
    
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
    console.error('❌ OpenRouter - Error:', error);
    console.error('❌ OpenRouter - Error response:', error.response?.data);
    console.error('❌ OpenRouter - Error status:', error.response?.status);
    
    // Dodatkowe informacje o błędzie autoryzacji
    if (error.response?.status === 401) {
      console.error('❌ OpenRouter - Authorization failed. Check your API key!');
      console.error('❌ OpenRouter - Current key length:', config.OPENROUTER_API_KEY ? config.OPENROUTER_API_KEY.length : 0);
    }
    
    throw new Error('Nie udało się zmodyfikować przepisu przez AI');
  }
}; 