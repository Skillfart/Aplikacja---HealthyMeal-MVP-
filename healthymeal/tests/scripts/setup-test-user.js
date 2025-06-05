/**
 * Skrypt do tworzenia testowego użytkownika w Supabase dla testów E2E
 * 
 * Użycie:
 * 1. Ustaw zmienne środowiskowe (lub użyj .env):
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_KEY (wymaga klucza serwisowego z uprawnieniami administratora)
 *    - TEST_USER_EMAIL
 *    - TEST_USER_PASSWORD
 * 
 * 2. Uruchom skrypt: node setup-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Wczytywanie zmiennych środowiskowych
require('dotenv').config({ path: path.resolve(__dirname, '../.env.e2e') });

// Dane do połączenia Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Dane testowego użytkownika
const testUserEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
const testUserPassword = process.env.TEST_USER_PASSWORD || 'test123password';

// Sprawdzanie, czy mamy wszystkie potrzebne zmienne
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Błąd: Brak wymaganych zmiennych środowiskowych SUPABASE_URL lub SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function createTestUser() {
  try {
    // Inicjalizacja klienta Supabase z kluczem serwisowym (admin)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Tworzenie testowego użytkownika: ${testUserEmail}`);
    
    // Sprawdzenie czy użytkownik już istnieje
    const { data: existingUser, error: getUserError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', testUserEmail)
      .single();
    
    if (existingUser) {
      console.log(`Użytkownik ${testUserEmail} już istnieje w bazie danych.`);
      return {
        id: existingUser.id,
        email: existingUser.email
      };
    }
    
    // Utworzenie nowego użytkownika
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true // Automatycznie potwierdź email
    });
    
    if (error) {
      console.error('Błąd podczas tworzenia użytkownika:', error.message);
      return null;
    }
    
    console.log(`Utworzono testowego użytkownika: ${newUser.user.email} (ID: ${newUser.user.id})`);
    
    // Utworzenie profilu użytkownika (jeśli potrzebne)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: newUser.user.id,
          name: 'Test User',
          email: newUser.user.email
        }
      ]);
    
    if (profileError) {
      console.error('Błąd podczas tworzenia profilu użytkownika:', profileError.message);
    } else {
      console.log('Utworzono profil testowego użytkownika');
    }
    
    return {
      id: newUser.user.id,
      email: newUser.user.email
    };
    
  } catch (error) {
    console.error('Nieoczekiwany błąd:', error);
    return null;
  }
}

async function setupTestData(userId) {
  try {
    // Inicjalizacja klienta Supabase z kluczem serwisowym
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Tworzenie testowych danych dla użytkownika...');
    
    // Przykładowy przepis
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: userId,
          title: 'Testowy Przepis E2E',
          ingredients: [
            { name: 'Składnik 1', quantity: 100, unit: 'g' },
            { name: 'Składnik 2', quantity: 2, unit: 'szt.' }
          ],
          steps: [
            { description: 'Krok 1: Przygotuj składniki' },
            { description: 'Krok 2: Wymieszaj wszystko' }
          ],
          preparation_time: 30,
          difficulty: 'medium',
          servings: 2,
          tags: ['test', 'e2e', 'demo'],
          nutritional_values: {
            calories: 300,
            protein: 15,
            carbs: 25,
            fat: 10
          }
        }
      ])
      .select();
    
    if (error) {
      console.error('Błąd podczas tworzenia testowego przepisu:', error.message);
    } else {
      console.log(`Utworzono testowy przepis: ${recipe[0].title} (ID: ${recipe[0].id})`);
      
      // Zapisz ID przepisu do użycia w testach
      const testData = {
        recipeId: recipe[0].id
      };
      
      fs.writeFileSync(
        path.resolve(__dirname, '../cypress/fixtures/test-data.json'),
        JSON.stringify(testData, null, 2)
      );
      
      console.log('Zapisano ID przepisu do pliku testowych danych');
    }
    
  } catch (error) {
    console.error('Nieoczekiwany błąd podczas tworzenia danych testowych:', error);
  }
}

// Główna funkcja
async function main() {
  console.log('Rozpoczynam konfigurację testowego użytkownika i danych dla testów E2E...');
  
  const user = await createTestUser();
  
  if (user) {
    await setupTestData(user.id);
    console.log('Zakończono konfigurację środowiska testowego');
  } else {
    console.error('Nie udało się utworzyć testowego użytkownika. Konfiguracja przerwana.');
    process.exit(1);
  }
}

// Uruchomienie skryptu
main(); 