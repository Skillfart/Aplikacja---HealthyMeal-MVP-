const Recipe = require('../models/Recipe');
const AICache = require('../models/AICache');
const crypto = require('crypto');
const axios = require('axios');

// Funkcja pomocnicza do generowania hasha
const generateInputHash = (recipeId, preferences) => {
  const input = JSON.stringify({
    recipeId,
    preferences
  });
  
  return crypto.createHash('md5').update(input).digest('hex');
};

// Modyfikacja przepisu za pomocą AI
exports.modifyRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;
    
    // Sprawdź czy przepis istnieje i należy do użytkownika
    const recipe = await Recipe.findOne({
      _id: recipeId,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // Pobierz preferencje użytkownika
    const userPreferences = req.user.preferences;
    
    // Generuj hash do cache'a
    const inputHash = generateInputHash(recipeId, userPreferences);
    
    // Sprawdź, czy wynik jest w cache'u
    let cachedResult = await AICache.findOne({ inputHash });
    
    if (cachedResult) {
      // Zwróć cache'owany wynik
      return res.status(200).json({
        message: 'Przepis zmodyfikowany pomyślnie (z cache)',
        modifiedRecipe: cachedResult.response,
        fromCache: true
      });
    }
    
    // Przygotuj dane dla AI
    const prompt = `
    Zmodyfikuj ten przepis zgodnie z następującymi preferencjami żywieniowymi:
    
    Preferencje:
    - Typ diety: ${userPreferences.dietType}
    - Maksymalna ilość węglowodanów: ${userPreferences.maxCarbs}g
    - Wykluczone produkty: ${userPreferences.excludedProducts.join(', ')}
    - Alergeny do unikania: ${userPreferences.allergens.join(', ')}
    
    Oryginalny przepis:
    - Nazwa: ${recipe.title}
    - Składniki: ${recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.ingredient.name}`).join(', ')}
    - Kroki: ${recipe.steps.map(s => s.description).join(' ')}
    
    Zmodyfikuj ten przepis, aby zawierał mniej węglowodanów, unikał wymienionych produktów i alergenów,
    a jednocześnie zachował podobny smak i charakter. Wyjaśnij powody swoich zmian.
    
    Zwróć zmodyfikowany przepis w następującym formacie JSON:
    {
      "title": "Zmodyfikowana nazwa przepisu",
      "ingredients": [
        {
          "ingredient": { "name": "nazwa składnika" },
          "quantity": liczba,
          "unit": "jednostka",
          "isModified": true/false,
          "substitutionReason": "powód zamiany (jeśli zamieniono)"
        }
      ],
      "steps": [
        {
          "number": 1,
          "description": "opis kroku",
          "isModified": true/false,
          "modificationReason": "powód modyfikacji (jeśli zmodyfikowano)"
        }
      ],
      "nutritionalValues": {
        "totalCarbs": liczba,
        "carbsReduction": liczba procentowa (0-100)
      },
      "changesDescription": "Ogólny opis wprowadzonych zmian"
    }
    `;
    
    // Wybierz API (Claude lub OpenAI) w zależności od konfiguracji
    let aiResponse;
    
    if (process.env.AI_PROVIDER === 'claude') {
      // Wywołanie API Claude (Anthropic)
      aiResponse = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: "claude-3-sonnet-20240229",
          max_tokens: 4000,
          messages: [
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AI_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      // Parsuj odpowiedź z Claude
      const responseContent = aiResponse.data.content[0].text;
      aiResponseData = JSON.parse(responseContent);
      
    } else {
      // Domyślnie: Wywołanie API OpenAI
      aiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: "Jesteś ekspertem od modyfikacji przepisów kulinarnych dla osób na dietach niskowęglowodanowych." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_API_KEY}`
          }
        }
      );
      
      // Parsuj odpowiedź z OpenAI
      aiResponseData = JSON.parse(aiResponse.data.choices[0].message.content);
    }
    
    // Zapisz wynik do cache'a
    const cacheEntry = new AICache({
      inputHash,
      recipeId,
      userPreferences,
      response: aiResponseData
    });
    
    await cacheEntry.save();
    
    // Zwiększ licznik użycia AI
    req.user.aiUsage.count += 1;
    await req.user.save();
    
    res.status(200).json({
      message: 'Przepis zmodyfikowany pomyślnie',
      modifiedRecipe: aiResponseData,
      fromCache: false
    });
    
  } catch (error) {
    console.error('Błąd modyfikacji przepisu przez AI:', error);
    res.status(500).json({ message: 'Błąd serwera podczas komunikacji z AI' });
  }
};

// Sprawdź dzienny limit użycia AI
exports.checkAIUsageLimit = async (req, res) => {
  try {
    const user = req.user;
    
    const hasRemainingModifications = user.hasRemainingAIModifications();
    const dailyLimit = 5; // Dzienny limit
    
    res.status(200).json({
      aiUsage: user.aiUsage,
      hasRemainingModifications,
      dailyLimit,
      remainingModifications: dailyLimit - user.aiUsage.count
    });
  } catch (error) {
    console.error('Błąd sprawdzania limitu AI:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
}; 