/**
 * Script testujący scenariusze aktualizacji przepisu
 * 
 * Uruchomienie: node test-recipe-update.js
 */

const axios = require('axios');

// Konfiguracja
const API_URL = 'http://localhost:3030/api';
const TEST_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci1pZCIsImVtYWlsIjoiZGV2QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
const TEST_RECIPE_ID = 'test'; // Używamy testowego przepisu z kontrolera

// Konfiguracja Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
  }
});

// Testy modyfikacji przepisu
const runTests = async () => {
  console.log('Uruchamianie testów modyfikacji przepisu...');
  
  try {
    // Test 1: Aktualizacja podstawowych danych przepisu
    await testBasicUpdate();
    
    // Test 2: Aktualizacja ze składnikami jako prostymi ciągami tekstowymi
    await testSimpleIngredients();
    
    // Test 3: Aktualizacja ze złożonymi obiektami składników
    await testComplexIngredients();
    
    // Test 4: Aktualizacja z nieprawidłowymi składnikami
    await testInvalidIngredients();
    
    console.log('\n✅ Wszystkie testy zakończone!');
  } catch (error) {
    console.error('\n❌ Testy zakończone z błędami.');
    process.exit(1);
  }
};

// Test 1: Aktualizacja podstawowych danych przepisu
const testBasicUpdate = async () => {
  console.log('\n🔍 Test 1: Aktualizacja podstawowych danych przepisu');
  
  try {
    const response = await api.put(`/recipes/${TEST_RECIPE_ID}`, {
      title: 'Zaktualizowany przepis testowy',
      preparationTime: 30,
      difficulty: 'easy',
      servings: 4,
      tags: ['test', 'simple']
    });
    
    console.log('✅ Test 1 zakończony sukcesem:', response.data);
    return response.data;
  } catch (error) {
    handleTestError('Test 1', error);
    throw error;
  }
};

// Test 2: Aktualizacja ze składnikami jako prostymi ciągami tekstowymi
const testSimpleIngredients = async () => {
  console.log('\n🔍 Test 2: Aktualizacja ze składnikami jako prostymi ciągami tekstowymi');
  
  try {
    const response = await api.put(`/recipes/${TEST_RECIPE_ID}`, {
      title: 'Przepis z prostymi składnikami',
      ingredients: ['jajko', 'mleko', 'mąka', 'cukier'],
      steps: ['Wymieszaj składniki', 'Piecz 20 minut'],
      preparationTime: 15,
      difficulty: 'easy',
      servings: 2
    });
    
    console.log('✅ Test 2 zakończony sukcesem:', response.data);
    return response.data;
  } catch (error) {
    handleTestError('Test 2', error);
    throw error;
  }
};

// Test 3: Aktualizacja ze złożonymi obiektami składników
const testComplexIngredients = async () => {
  console.log('\n🔍 Test 3: Aktualizacja ze złożonymi obiektami składników');
  
  try {
    const response = await api.put(`/recipes/${TEST_RECIPE_ID}`, {
      title: 'Przepis ze złożonymi składnikami',
      ingredients: [
        { name: 'jajko', quantity: 2, unit: 'szt.' },
        { name: 'mleko', quantity: 200, unit: 'ml' },
        { 
          ingredient: { 
            name: 'mąka pszenna'
          }, 
          quantity: 300, 
          unit: 'g' 
        }
      ],
      steps: ['Wymieszaj składniki', 'Piecz 30 minut'],
      preparationTime: 15,
      difficulty: 'medium',
      servings: 4
    });
    
    console.log('✅ Test 3 zakończony sukcesem:', response.data);
    return response.data;
  } catch (error) {
    handleTestError('Test 3', error);
    throw error;
  }
};

// Test 4: Aktualizacja z nieprawidłowymi składnikami
const testInvalidIngredients = async () => {
  console.log('\n🔍 Test 4: Aktualizacja z nieprawidłowymi składnikami');
  
  try {
    const response = await api.put(`/recipes/${TEST_RECIPE_ID}`, {
      title: 'Przepis z nieprawidłowymi składnikami',
      ingredients: [
        { }, // Pusty obiekt
        { name: '' }, // Pusta nazwa
        { name: '<script>alert("XSS")</script>' }, // Potencjalne XSS
        null, // Null
        { ingredient: { _id: 'nieprawidłowe-id' } }, // Nieprawidłowe ID
        { name: 123 }, // Nazwa jako liczba
        { name: true } // Nazwa jako boolean
      ],
      steps: ['Wymieszaj składniki'],
      preparationTime: 10,
      difficulty: 'easy',
      servings: 2
    });
    
    console.log('✅ Test 4 zakończony sukcesem:', response.data);
    return response.data;
  } catch (error) {
    // W tym przypadku oczekujemy błędu 400, więc jeśli wystąpi, to test jest udany
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 4 zakończony sukcesem (oczekiwany błąd 400):', error.response.data);
      return error.response.data;
    }
    
    handleTestError('Test 4', error);
    throw error;
  }
};

// Obsługa błędów testu
const handleTestError = (testName, error) => {
  console.error(`❌ ${testName} zakończony błędem:`);
  
  if (error.response) {
    // Serwer odpowiedział kodem błędu
    console.error('Status:', error.response.status);
    console.error('Dane odpowiedzi:', error.response.data);
    console.error('Nagłówki:', error.response.headers);
  } else if (error.request) {
    // Żądanie zostało wysłane, ale nie otrzymano odpowiedzi
    console.error('Brak odpowiedzi:', error.request);
  } else {
    // Coś poszło nie tak podczas konfiguracji żądania
    console.error('Błąd:', error.message);
  }
};

// Uruchomienie testów
runTests()
  .catch(error => {
    console.error('Nieprzewidziany błąd podczas testów:', error);
    process.exit(1);
  }); 