#!/usr/bin/env node

/**
 * Skrypt testowy dla OpenRouterService
 * 
 * Ten skrypt przeprowadza testy funkcjonalności serwisu OpenRouter:
 * 1. Sprawdzenie statusu API
 * 2. Modyfikacja receptury na podstawie preferencji
 * 3. Sugerowanie alternatywnych składników
 * 
 * Aby użyć: node src/scripts/test-openrouter.js
 */

require('dotenv').config();
const { OpenRouterService } = require('../services/openRouterService');
const colors = require('colors/safe');

// Konfiguracja kolorów
colors.setTheme({
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  mock: 'magenta',
  title: ['cyan', 'bold']
});

// Przykładowy przepis do testów
const sampleRecipe = {
  _id: 'test-recipe-id',
  title: 'Spaghetti Bolognese',
  description: 'Klasyczne włoskie danie z makaronem i sosem mięsnym',
  preparationTime: 45,
  difficulty: 'średni',
  servings: 4,
  ingredients: [
    { name: 'makaron spaghetti', quantity: 400, unit: 'g' },
    { name: 'mięso mielone wołowe', quantity: 500, unit: 'g' },
    { name: 'cebula', quantity: 1, unit: 'sztuka' },
    { name: 'czosnek', quantity: 2, unit: 'ząbki' },
    { name: 'pomidory w puszce', quantity: 400, unit: 'g' },
    { name: 'koncentrat pomidorowy', quantity: 2, unit: 'łyżki' },
    { name: 'marchewka', quantity: 1, unit: 'sztuka' },
    { name: 'oliwa z oliwek', quantity: 2, unit: 'łyżki' },
    { name: 'bazylia', quantity: 1, unit: 'łyżka' },
    { name: 'oregano', quantity: 1, unit: 'łyżeczka' },
    { name: 'sól', quantity: 1, unit: 'łyżeczka' },
    { name: 'pieprz', quantity: 0.5, unit: 'łyżeczki' },
    { name: 'parmezan', quantity: 50, unit: 'g' }
  ],
  steps: [
    'Ugotuj makaron zgodnie z instrukcją na opakowaniu.',
    'Na patelni rozgrzej oliwę i zeszklij posiekaną cebulę.',
    'Dodaj czosnek i chwilę smaż.',
    'Dodaj mięso mielone i smaż, aż zbrązowieje.',
    'Dodaj startą marchewkę, pomidory i koncentrat.',
    'Dopraw solą, pieprzem, bazylią i oregano.',
    'Duś na małym ogniu przez 20 minut.',
    'Podawaj makaron z sosem i posyp parmezanem.'
  ],
  tags: ['włoskie', 'obiad', 'mięsne'],
  nutritionalValues: {
    calories: 550,
    protein: 30,
    carbohydrates: 70,
    fat: 15,
    fiber: 5,
    sugar: 8
  }
};

// Przykładowe preferencje dietetyczne do testów
const dietaryPreferences = {
  dietType: 'wegetariańska',
  maxCarbs: 50,
  excludedProducts: ['gluten', 'mleko'],
  allergens: ['orzechy']
};

/**
 * Pomocnicza funkcja do wyświetlania wyników testu
 * @param {string} testName - Nazwa testu
 * @param {any} result - Wynik testu
 */
function displayResult(testName, result) {
  console.log('\n' + colors.title(`=== ${testName} ===`));
  console.log(colors.info(JSON.stringify(result, null, 2)));
}

/**
 * Test statusu API
 * @param {OpenRouterService} service - Instancja serwisu OpenRouter
 * @returns {Promise<Object>} - Wynik testu
 */
async function testApiStatus(service) {
  try {
    const apiStatus = await service.checkAPIStatus();
    console.log(colors.success('Status API sprawdzony pomyślnie!'));
    
    if (service.simulationMode) {
      console.log(colors.mock('UWAGA: Test wykonany w trybie symulacji'));
    }
    
    return apiStatus;
  } catch (error) {
    console.error(colors.error(`Błąd podczas sprawdzania statusu API: ${error.message}`));
    throw error;
  }
}

/**
 * Test modyfikacji przepisu
 * @param {OpenRouterService} service - Instancja serwisu OpenRouter
 * @returns {Promise<Object>} - Zmodyfikowany przepis
 */
async function testRecipeModification(service) {
  try {
    const modifiedRecipe = await service.modifyRecipe(sampleRecipe, dietaryPreferences);
    console.log(colors.success('Przepis zmodyfikowany pomyślnie!'));
    
    if (service.simulationMode) {
      console.log(colors.mock('UWAGA: Test wykonany w trybie symulacji'));
    }
    
    return {
      title: modifiedRecipe.title,
      ingredients: modifiedRecipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`),
      nutritionalValues: modifiedRecipe.nutritionalValues
    };
  } catch (error) {
    console.error(colors.error(`Błąd podczas modyfikacji przepisu: ${error.message}`));
    throw error;
  }
}

/**
 * Test sugerowania alternatywnych składników
 * @param {OpenRouterService} service - Instancja serwisu OpenRouter
 * @returns {Promise<Array>} - Lista alternatyw
 */
async function testIngredientAlternatives(service) {
  try {
    const ingredientAlternatives = await service.suggestIngredientAlternatives(
      "mięso mielone wołowe", 
      dietaryPreferences
    );
    console.log(colors.success('Alternatywne składniki wygenerowane pomyślnie!'));
    
    if (service.simulationMode) {
      console.log(colors.mock('UWAGA: Test wykonany w trybie symulacji'));
    }
    
    return ingredientAlternatives;
  } catch (error) {
    console.error(colors.error(`Błąd podczas generowania alternatyw: ${error.message}`));
    throw error;
  }
}

/**
 * Główna funkcja uruchamiająca testy
 */
async function runTests() {
  const results = {
    success: 0,
    failure: 0,
    tests: []
  };
  
  console.log(colors.title('\n=== TEST INTEGRACJI Z OPENROUTER API ===\n'));
  
  // Utwórz instancję serwisu z kluczem API z zmiennych środowiskowych
  const openRouterService = new OpenRouterService({
    apiKey: process.env.OPENROUTER_API_KEY,
    timeout: 30000 // krótszy timeout dla testów
  });
  
  console.log(`Tryb pracy: ${openRouterService.simulationMode ? colors.mock('SYMULACJA') : colors.success('RZECZYWISTE API')}`);
  console.log(`Wybrany model: ${colors.info(openRouterService.defaultModel)}`);
  
  try {
    // Test 1: Sprawdzenie statusu API
    console.log(colors.title("\nTest 1: Sprawdzanie statusu API..."));
    const apiStatus = await testApiStatus(openRouterService);
    displayResult("Sprawdzenie statusu API", apiStatus);
    results.success++;
    results.tests.push({name: "Sprawdzenie statusu API", status: "success"});
    
    // Test 2: Modyfikacja receptury
    console.log(colors.title("\nTest 2: Modyfikacja receptury..."));
    const modifiedRecipe = await testRecipeModification(openRouterService);
    displayResult("Modyfikacja receptury", modifiedRecipe);
    results.success++;
    results.tests.push({name: "Modyfikacja receptury", status: "success"});
    
    // Test 3: Sugerowanie alternatywnych składników
    console.log(colors.title("\nTest 3: Sugerowanie alternatywnych składników..."));
    const ingredientAlternatives = await testIngredientAlternatives(openRouterService);
    displayResult("Sugerowanie alternatywnych składników", ingredientAlternatives);
    results.success++;
    results.tests.push({name: "Sugerowanie alternatywnych składników", status: "success"});
    
  } catch (error) {
    console.error(colors.error(`\nBłąd podczas testów: ${error.message}`));
    results.failure++;
    results.tests.push({
      name: error.code || "Nieznany test", 
      status: "failure", 
      message: error.message,
      stack: error.stack
    });
  }
  
  // Podsumowanie
  console.log(colors.title('\n=== PODSUMOWANIE TESTÓW ==='));
  console.log(`Wykonane testy: ${results.success + results.failure}`);
  console.log(colors.success(`Udane: ${results.success}`));
  console.log(colors.error(`Nieudane: ${results.failure}`));
  
  if (openRouterService.simulationMode) {
    console.log(colors.mock('\nUWAGA: Testy były uruchomione w trybie symulacji.'));
    console.log(colors.mock('Aby użyć rzeczywistego API, dodaj poprawny OPENROUTER_API_KEY do pliku .env'));
  }
  
  return results;
}

// Uruchom testy tylko jeśli ten plik jest uruchamiany bezpośrednio
if (require.main === module) {
  runTests().catch(error => {
    console.error(colors.error(`Nieobsługiwany błąd: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { runTests }; 