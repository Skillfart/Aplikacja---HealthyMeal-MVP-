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
const OpenRouterService = require('../services/openRouterService');
const logger = require('../utils/logger');

// Inicjalizacja serwisu OpenRouter
// Użyj klucza API z zmiennych środowiskowych lub trybu symulacji
const openRouterService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY || 'test_key',
  simulationMode: !process.env.OPENROUTER_API_KEY
});

// Przykładowa receptura do testów
const sampleRecipe = {
  title: "Klasyczne spaghetti bolognese",
  description: "Tradycyjne włoskie danie z mięsem mielonym i sosem pomidorowym",
  ingredients: [
    {
      name: "mięso mielone wołowe",
      quantity: 500,
      unit: "g"
    },
    {
      name: "cebula",
      quantity: 1,
      unit: "szt."
    },
    {
      name: "czosnek",
      quantity: 3,
      unit: "ząbki"
    },
    {
      name: "marchewka",
      quantity: 1,
      unit: "szt."
    },
    {
      name: "seler naciowy",
      quantity: 2,
      unit: "łodygi"
    },
    {
      name: "pomidory krojone z puszki",
      quantity: 400,
      unit: "g"
    },
    {
      name: "koncentrat pomidorowy",
      quantity: 2,
      unit: "łyżki"
    },
    {
      name: "makaron spaghetti",
      quantity: 400,
      unit: "g"
    },
    {
      name: "parmezan",
      quantity: 50,
      unit: "g"
    },
    {
      name: "oliwa z oliwek",
      quantity: 2,
      unit: "łyżki"
    },
    {
      name: "zioła włoskie",
      quantity: 1,
      unit: "łyżeczka"
    },
    {
      name: "sól",
      quantity: 1,
      unit: "szczypta"
    },
    {
      name: "pieprz",
      quantity: 1,
      unit: "szczypta"
    }
  ],
  steps: [
    "Na patelni rozgrzej oliwę i zeszkli posiekaną cebulę.",
    "Dodaj czosnek i smaż przez 30 sekund.",
    "Dodaj mięso mielone i smaż, aż będzie brązowe, rozdrabniając je widelcem.",
    "Dodaj pokrojoną w kostkę marchewkę i seler, smaż przez 5 minut.",
    "Wlej pomidory z puszki, dodaj koncentrat pomidorowy i zioła.",
    "Gotuj na małym ogniu przez około 30 minut, mieszając od czasu do czasu.",
    "W międzyczasie ugotuj makaron według instrukcji na opakowaniu.",
    "Podawaj sos na makaronie, posypany startym parmezanem."
  ],
  preparationTime: 45,
  difficulty: "średni",
  servings: 4,
  tags: ["włoskie", "obiad", "mięso", "makaron"],
  nutritionalValues: {
    calories: 550,
    protein: 35,
    carbohydrates: 45,
    fat: 25,
    fiber: 5
  }
};

// Przykładowe preferencje dietetyczne do testów
const dietaryPreferences = {
  diet: "wegetariańska",
  allergies: ["orzechy"],
  healthGoals: ["redukcja tłuszczu"],
  dislikedIngredients: ["czosnek"]
};

/**
 * Formatuje i wyświetla wynik testu
 * @param {string} testName - Nazwa testu
 * @param {any} result - Wynik testu
 */
function displayResult(testName, result) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(80));
  
  if (typeof result === 'object') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
  
  console.log('='.repeat(80) + '\n');
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
  
  try {
    // Test 1: Sprawdzenie statusu API
    console.log("Rozpoczynam test sprawdzania statusu API...");
    const apiStatus = await openRouterService.checkAPIStatus();
    displayResult("Sprawdzenie statusu API", apiStatus);
    results.success++;
    results.tests.push({name: "Sprawdzenie statusu API", status: "success"});
    
    // Test 2: Modyfikacja receptury
    console.log("Rozpoczynam test modyfikacji receptury...");
    const modifiedRecipe = await openRouterService.modifyRecipe(sampleRecipe, dietaryPreferences);
    displayResult("Modyfikacja receptury", {
      title: modifiedRecipe.title,
      ingredients: modifiedRecipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`),
      nutritionalValues: modifiedRecipe.nutritionalValues,
      modificationNotes: modifiedRecipe.modificationNotes
    });
    results.success++;
    results.tests.push({name: "Modyfikacja receptury", status: "success"});
    
    // Test 3: Sugerowanie alternatywnych składników
    console.log("Rozpoczynam test sugerowania alternatywnych składników...");
    const ingredientAlternatives = await openRouterService.suggestIngredientAlternatives("mięso mielone wołowe", dietaryPreferences);
    displayResult("Sugerowanie alternatywnych składników", ingredientAlternatives);
    results.success++;
    results.tests.push({name: "Sugerowanie alternatywnych składników", status: "success"});
    
  } catch (error) {
    console.error("Błąd podczas testów:", error.message);
    results.failure++;
    results.tests.push({name: error.code || "Nieznany test", status: "failure", message: error.message});
  }
  
  // Podsumowanie
  console.log(`\nPodsumowanie testów: ${results.success} udanych, ${results.failure} nieudanych.`);
  if (openRouterService.simulationMode) {
    console.log("\nUWAGA: Testy były uruchomione w trybie symulacji. Aby użyć rzeczywistego API, dodaj OPENROUTER_API_KEY do pliku .env");
  }
}

// Uruchomienie testów
runTests().catch(error => {
  logger.error("Błąd krytyczny podczas testów:", error);
}); 