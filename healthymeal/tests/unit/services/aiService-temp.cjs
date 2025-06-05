/**
 * Serwis AI do komunikacji z API OpenRouter
 */

const config = require('../config/config');
const logger = require('../utils/logger');

// Importuj OpenAI tylko gdy nie używamy mocków
let OpenAI;
let openai = null;

// Inicjalizacja klienta OpenAI (tylko gdy USE_MOCKS=false)
function initializeOpenAIClient() {
  try {
    // Załaduj moduł OpenAI tylko gdy jest potrzebny
    OpenAI = require('openai');
    logger.info('Moduł OpenAI został załadowany pomyślnie');
    
    if (!config.openrouter.apiKey) {
      logger.warn('UWAGA: Brak klucza API OpenRouter. Testy z rzeczywistym API nie będą działać!');
      logger.warn('Dodaj klucz API w pliku env.config.json lub zmiennych środowiskowych OPENROUTER_API_KEY');
      logger.warn('Przełączam na tryb symulacji.');
      return null;
    }

    // Konfiguracja klienta OpenAI dla OpenRouter
    const client = new OpenAI({
      apiKey: config.openrouter.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": config.openrouter.referer || "https://healthymeal.app",
      },
      dangerouslyAllowBrowser: true
    });

    logger.info(`Klient OpenRouter został skonfigurowany pomyślnie. Model: ${config.openrouter.defaultModel}`);
    return client;
  } catch (error) {
    logger.error('Błąd podczas inicjalizacji klienta OpenAI:', error);
    return null;
  }
}

// Inicjalizacja klienta tylko gdy nie używamy mocków
if (!config.useMocks) {
  openai = initializeOpenAIClient();
  if (openai) {
    logger.info('Klient OpenRouter został zainicjalizowany w trybie rzeczywistym');
  } else {
    logger.warn('Nie udało się zainicjalizować klienta OpenRouter. Przełączam na tryb symulacji.');
  }
} else {
  logger.info('Używanie mocków dla serwisu AI (useMocks=true)');
}

/**
 * Modyfikuje przepis według preferencji użytkownika
 * @param {Object} recipe - przepis do modyfikacji
 * @param {Object} preferences - preferencje użytkownika
 * @returns {Promise<Object>} - zmodyfikowany przepis
 */
async function modifyRecipe(recipe, preferences) {
  try {
    logger.info(`Rozpoczynam modyfikację przepisu: ${recipe.title}`);
    
    // Jeśli useMocks=true lub klient nie został zainicjalizowany, użyj symulacji
    if (config.useMocks || !openai) {
      logger.info('Używanie danych testowych (mock) dla modyfikacji przepisu');
      return getMockModifiedRecipe(recipe, preferences);
    }

    // Przygotuj prompt dla AI
    const prompt = buildAIPrompt(recipe, preferences);
    
    // Wywołaj API OpenRouter
    const response = await openai.chat.completions.create({
      model: config.openrouter.defaultModel,
      messages: [
        { role: "system", content: "Jesteś ekspertem kulinarnym specjalizującym się w dostosowywaniu przepisów do potrzeb dietetycznych." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Przetwórz odpowiedź
    const aiResponse = response.choices[0].message.content;
    logger.info(`Otrzymano odpowiedź od OpenRouter dla przepisu: ${recipe.title}`);
    
    // Parsuj odpowiedź AI
    const modifiedRecipe = parseAIResponse(aiResponse, recipe);
    
    return modifiedRecipe;
  } catch (error) {
    logger.error(`Błąd podczas modyfikacji przepisu: ${error.message}`);
    if (error.response) {
      logger.error(`Odpowiedź API: ${JSON.stringify(error.response.data)}`);
    }
    // W przypadku błędu, zwróć symulowany wynik
    logger.info('Przełączam na dane testowe (mock) z powodu błędu API');
    return getMockModifiedRecipe(recipe, preferences);
  }
}

/**
 * Buduje prompt dla modelu AI
 * @param {Object} recipe - przepis do modyfikacji
 * @param {Object} preferences - preferencje użytkownika
 * @returns {string} - prompt dla modelu AI
 */
function buildAIPrompt(recipe, preferences) {
  // Przygotuj informacje o preferencjach
  const dietType = preferences.dietType || 'normal';
  const maxCarbs = preferences.maxCarbs || 'bez ograniczeń';
  const excludedProducts = preferences.excludedProducts || [];
  const allergens = preferences.allergens || [];
  
  // Składniki jako lista
  const ingredientsList = recipe.ingredients.map(ing => 
    `- ${ing.quantity} ${ing.unit || ''} ${ing.ingredient.name}`
  ).join('\n');
  
  // Kroki przygotowania
  const stepsList = recipe.steps.map(step => 
    `${step.number}. ${step.description}`
  ).join('\n');
  
  // Budowanie promptu
  return `Zmodyfikuj następujący przepis zgodnie z preferencjami żywieniowymi.

PRZEPIS: "${recipe.title}"

SKŁADNIKI:
${ingredientsList}

PRZYGOTOWANIE:
${stepsList}

PREFERENCJE ŻYWIENIOWE:
- Typ diety: ${dietType}
- Maksymalna ilość węglowodanów: ${maxCarbs} g na porcję
- Wykluczone produkty: ${excludedProducts.join(', ') || 'brak'}
- Alergeny do wykluczenia: ${allergens.join(', ') || 'brak'}

Proszę o:
1. Zmodyfikowaną listę składników (zamień składniki niezgodne z preferencjami)
2. Zmodyfikowane kroki przygotowania
3. Krótki opis wprowadzonych zmian i ich wpływ na wartości odżywcze

ODPOWIEDŹ SFORMATUJ JAKO JSON:
{
  "title": "Zmodyfikowany tytuł przepisu",
  "ingredients": [
    {"name": "nazwa składnika", "quantity": wartość, "unit": "jednostka"}
  ],
  "steps": [
    {"number": 1, "description": "opis kroku"}
  ],
  "nutritionalValues": {
    "carbsPerServing": szacowana wartość,
    "caloriesPerServing": szacowana wartość
  },
  "changesDescription": "Opis wprowadzonych zmian"
}`;
}

/**
 * Parsuje odpowiedź AI i konwertuje na obiekt przepisu
 * @param {string} aiResponse - odpowiedź od modelu AI
 * @param {Object} originalRecipe - oryginalny przepis
 * @returns {Object} - zmodyfikowany przepis
 */
function parseAIResponse(aiResponse, originalRecipe) {
  try {
    // Próba wyciągnięcia obiektu JSON z tekstu odpowiedzi
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      aiResponse.match(/```\n([\s\S]*?)\n```/) || 
                      aiResponse.match(/{[\s\S]*?}/);
    
    let parsedResponse;
      if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
      } else {
      // Jeśli nie znaleziono prawidłowego JSON, próbujemy sparsować całą treść
      parsedResponse = JSON.parse(aiResponse);
    }
    
    // Mapowanie odpowiedzi do struktury przepisu
    return {
      originalRecipe: {
        _id: originalRecipe._id,
        title: originalRecipe.title
      },
      title: parsedResponse.title || `Zmodyfikowany: ${originalRecipe.title}`,
      ingredients: parsedResponse.ingredients.map(ing => ({
        ingredient: {
          name: ing.name
        },
        quantity: ing.quantity,
        unit: ing.unit,
        isModified: true
      })),
      steps: parsedResponse.steps.map(step => ({
        number: step.number,
        description: step.description,
        isModified: true
      })),
      preparationTime: originalRecipe.preparationTime,
      difficulty: originalRecipe.difficulty,
      servings: originalRecipe.servings,
      tags: [...(originalRecipe.tags || []), 'zmodyfikowany'],
      nutritionalValues: {
        carbsPerServing: parsedResponse.nutritionalValues?.carbsPerServing || 0,
        caloriesPerServing: parsedResponse.nutritionalValues?.caloriesPerServing || 0,
        carbsReduction: 0, // To zostanie obliczone na poziomie kontrolera
        caloriesReduction: 0
      },
      changesDescription: parsedResponse.changesDescription,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    logger.error(`Błąd podczas parsowania odpowiedzi AI: ${error.message}`);
    logger.error(`Surowa odpowiedź AI: ${aiResponse}`);
    
    // Zwróć podstawową modyfikację w przypadku błędu
    return {
      originalRecipe: {
        _id: originalRecipe._id,
        title: originalRecipe.title
      },
      title: `Zmodyfikowany: ${originalRecipe.title}`,
      ingredients: originalRecipe.ingredients.map(ing => ({
        ingredient: {
          name: ing.ingredient.name
        },
        quantity: ing.quantity,
        unit: ing.unit,
        isModified: false
      })),
      steps: originalRecipe.steps.map(step => ({
        number: step.number,
        description: step.description,
        isModified: false
      })),
      preparationTime: originalRecipe.preparationTime,
      difficulty: originalRecipe.difficulty,
      servings: originalRecipe.servings,
      tags: [...(originalRecipe.tags || []), 'zmodyfikowany'],
      nutritionalValues: {
        carbsPerServing: originalRecipe.nutritionalValues?.carbsPerServing || 0,
        caloriesPerServing: originalRecipe.nutritionalValues?.caloriesPerServing || 0,
        carbsReduction: 0,
        caloriesReduction: 0
      },
      changesDescription: "Nie udało się zmodyfikować przepisu automatycznie.",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

/**
 * Generuje mock zmodyfikowanego przepisu (na potrzeby testów)
 * @param {Object} recipe - przepis do modyfikacji
 * @param {Object} preferences - preferencje użytkownika
 * @returns {Object} - zmodyfikowany przepis (mock)
 */
function getMockModifiedRecipe(recipe, preferences) {
  logger.info(`Generowanie mocka zmodyfikowanego przepisu: ${recipe.title}`);
  
  // Przykładowe modyfikacje dla różnych typów diet
  const dietType = preferences.dietType || 'normal';
  let modifiedIngredients = [...recipe.ingredients];
  let changesDescription = "Przepis zmodyfikowany automatycznie (tryb symulacji).";
  
  // Modyfikacje zależne od typu diety
  if (dietType === 'keto' || dietType === 'lowCarb') {
    // Przykładowa zamiana składników wysokowęglowodanowych
    modifiedIngredients = recipe.ingredients.map(ing => {
      const name = ing.ingredient.name.toLowerCase();
      if (name.includes('mąka')) {
        return {
          ingredient: { name: 'mąka migdałowa' },
          quantity: ing.quantity * 0.8,
          unit: ing.unit,
          isModified: true
        };
      } else if (name.includes('cukier')) {
        return {
          ingredient: { name: 'erytrytol' },
          quantity: ing.quantity * 0.7,
          unit: ing.unit,
          isModified: true
        };
      } else if (name.includes('ziemniak')) {
        return {
          ingredient: { name: 'kalafior' },
          quantity: ing.quantity,
          unit: ing.unit,
          isModified: true
        };
      }
      return {
        ingredient: { name: ing.ingredient.name },
        quantity: ing.quantity,
        unit: ing.unit,
        isModified: false
      };
    });
    
    changesDescription = "Zamieniono składniki wysokowęglowodanowe na niskowęglowodanowe alternatywy. Obniżono zawartość węglowodanów o około 70%.";
  } else if (dietType === 'vegetarian' || dietType === 'vegan') {
    // Przykładowa zamiana składników pochodzenia zwierzęcego
    modifiedIngredients = recipe.ingredients.map(ing => {
      const name = ing.ingredient.name.toLowerCase();
      if (name.includes('mięso') || name.includes('kurczak') || name.includes('wołowina')) {
        return {
          ingredient: { name: 'tofu' },
          quantity: ing.quantity,
          unit: ing.unit,
          isModified: true
        };
      } else if (name.includes('śmietana')) {
        return {
          ingredient: { name: 'śmietana kokosowa' },
          quantity: ing.quantity,
          unit: ing.unit,
          isModified: true
        };
      } else if (name.includes('ser') && dietType === 'vegan') {
        return {
          ingredient: { name: 'wegański zamiennik sera' },
          quantity: ing.quantity,
          unit: ing.unit,
          isModified: true
        };
      }
      return {
        ingredient: { name: ing.ingredient.name },
        quantity: ing.quantity,
        unit: ing.unit,
        isModified: false
      };
    });
    
    changesDescription = dietType === 'vegan' 
      ? "Zamieniono wszystkie składniki pochodzenia zwierzęcego na alternatywy roślinne."
      : "Zamieniono mięso i ryby na alternatywne źródła białka roślinnego.";
  }
  
  // Przygotowanie zmodyfikowanych kroków
  const modifiedSteps = recipe.steps.map(step => {
    // Proste modyfikacje opisów kroków na podstawie zmienionych składników
    let modifiedDescription = step.description;
    modifiedIngredients.forEach(ing => {
      if (ing.isModified) {
        const originalName = recipe.ingredients.find(
          i => i.ingredient.name === ing.ingredient.name
        )?.ingredient.name;
        
        if (originalName) {
          modifiedDescription = modifiedDescription.replace(
            new RegExp(originalName, 'gi'), 
            ing.ingredient.name
          );
        }
      }
    });
    
    return {
      number: step.number,
      description: modifiedDescription,
      isModified: modifiedDescription !== step.description
    };
  });
  
  // Obliczenie przybliżonych wartości odżywczych
  const originalCarbs = recipe.nutritionalValues?.carbsPerServing || 30;
  const originalCalories = recipe.nutritionalValues?.caloriesPerServing || 300;
  
  let carbsReduction = 0;
  let caloriesReduction = 0;
  
  if (dietType === 'keto' || dietType === 'lowCarb') {
    carbsReduction = 70; // 70% redukcji węglowodanów
    caloriesReduction = 15; // 15% redukcji kalorii
  } else if (dietType === 'vegetarian' || dietType === 'vegan') {
    carbsReduction = 10; // 10% wzrostu węglowodanów
    caloriesReduction = 25; // 25% redukcji kalorii
  }
  
  const modifiedCarbs = Math.max(1, originalCarbs * (1 - carbsReduction / 100));
  const modifiedCalories = Math.max(50, originalCalories * (1 - caloriesReduction / 100));
  
  return {
    originalRecipe: {
      _id: recipe._id,
      title: recipe.title
    },
    title: `${recipe.title} (${dietType})`,
    ingredients: modifiedIngredients,
    steps: modifiedSteps,
    preparationTime: recipe.preparationTime,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    tags: [...(recipe.tags || []), 'zmodyfikowany', dietType],
    nutritionalValues: {
      carbsPerServing: modifiedCarbs,
      caloriesPerServing: modifiedCalories,
      carbsReduction: carbsReduction,
      caloriesReduction: caloriesReduction
    },
    changesDescription: changesDescription,
    aiPrompt: "Mock prompt dla testów",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

module.exports = {
  modifyRecipe,
  buildAIPrompt,
  parseAIResponse,
  getMockModifiedRecipe
}; 