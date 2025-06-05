const axios = require('axios');
const { expect } = require('chai');

describe('HealthyMeal Testy Generowania Planu Diety E2E', function() {
  const API_URL = 'http://localhost:3030/api';
  let authToken;
  let testUserId;
  
  const TEST_USER = {
    email: 'test-diet@example.com',
    password: 'Test123456',
    name: 'Test Diet User'
  };
  
  const TEST_PREFERENCES = {
    dietType: 'lowCarb',
    maxCalories: 2000,
    maxCarbs: 50,
    excludedProducts: ['mleko', 'jajka'],
    allergens: ['gluten']
  };
  
  before(async function() {
    try {
      // Rejestracja testowego użytkownika lub logowanie jeśli już istnieje
      try {
        const registerResponse = await axios.post(`${API_URL}/auth/register`, TEST_USER);
        authToken = registerResponse.data.token;
        testUserId = registerResponse.data.userId;
      } catch (error) {
        if (error.response && error.response.status === 400 && 
            error.response.data.message.includes('Email jest już zajęty')) {
          // Logowanie jeśli użytkownik już istnieje
          const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
          });
          
          authToken = loginResponse.data.token;
          testUserId = loginResponse.data.userId;
        } else {
          throw error;
        }
      }
      
      // Ustawienie preferencji użytkownika
      await axios.put(
        `${API_URL}/users/preferences`,
        TEST_PREFERENCES,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    } catch (error) {
      console.error('Błąd podczas przygotowania testów diety:', 
        error.response ? error.response.data : error.message);
      throw error;
    }
  });
  
  describe('Generowanie planu diety', function() {
    it('Powinien wygenerować plan diety zgodny z preferencjami', async function() {
      try {
        const response = await axios.post(
          `${API_URL}/ai/diet-plan`,
          {
            days: 3,
            mealsPerDay: 3,
            preferences: TEST_PREFERENCES
          },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('plan');
        expect(response.data.plan).to.be.an('array');
        expect(response.data.plan.length).to.equal(3); // 3 dni
        
        // Sprawdź, czy plan zawiera odpowiednią liczbę posiłków
        response.data.plan.forEach(day => {
          expect(day).to.have.property('meals');
          expect(day.meals).to.be.an('array');
          expect(day.meals.length).to.equal(3); // 3 posiłki dziennie
          
          // Sprawdź, czy każdy posiłek ma wymagane pola
          day.meals.forEach(meal => {
            expect(meal).to.have.property('name');
            expect(meal).to.have.property('nutritionalValues');
            expect(meal.nutritionalValues).to.have.property('totalCalories');
            expect(meal.nutritionalValues).to.have.property('totalCarbs');
            
            // Sprawdź czy posiłek jest zgodny z preferencjami - niskie węglowodany
            expect(meal.nutritionalValues.totalCarbs).to.be.at.most(TEST_PREFERENCES.maxCarbs);
          });
        });
      } catch (error) {
        console.error('Błąd podczas generowania planu diety:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
    
    it('Powinien uwzględnić wykluczenia produktów', async function() {
      try {
        const response = await axios.post(
          `${API_URL}/ai/diet-plan`,
          {
            days: 1,
            mealsPerDay: 2,
            preferences: {
              ...TEST_PREFERENCES,
              excludedProducts: ['kurczak', 'ryż']
            }
          },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('plan');
        
        // Sprawdź, czy plan nie zawiera wykluczonych produktów
        const plan = JSON.stringify(response.data.plan).toLowerCase();
        expect(plan).to.not.include('kurczak');
        expect(plan).to.not.include('ryż');
      } catch (error) {
        console.error('Błąd podczas generowania planu diety z wykluczeniami:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
  });
  
  after(async function() {
    // Opcjonalne czyszczenie - możesz zachować użytkownika do przyszłych testów
    if (process.env.CLEANUP_TEST_USERS && testUserId) {
      try {
        await axios.delete(
          `${API_URL}/users/${testUserId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        console.log('Użytkownik testowy do diety został usunięty');
      } catch (error) {
        console.error('Błąd podczas usuwania testowego użytkownika:', 
          error.response ? error.response.data : error.message);
      }
    }
  });
}); 