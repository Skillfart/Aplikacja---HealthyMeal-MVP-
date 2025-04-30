const axios = require('axios');
const { expect } = require('chai');
const { v4: uuidv4 } = require('uuid');

describe('HealthyMeal Testy Autentykacji E2E', function() {
  this.timeout(10000);
  
  const API_URL = 'http://localhost:3030/api';
  const testEmail = `test-${uuidv4()}@example.com`;
  
  const TEST_USER = {
    email: testEmail,
    password: 'Tester123!',
    name: 'Użytkownik Testowy'
  };
  
  let authToken;
  let userId;
  
  describe('Rejestracja', function() {
    it('Powinien zarejestrować nowego użytkownika', async function() {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
        
        expect(response.status).to.equal(201);
        expect(response.data).to.have.property('token');
        expect(response.data).to.have.property('userId');
        
        // Zapisz token do kolejnych testów
        authToken = response.data.token;
        userId = response.data.userId;
      } catch (error) {
        console.error('Błąd podczas rejestracji:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
    
    it('Powinien odrzucić rejestrację z już istniejącym emailem', async function() {
      try {
        await axios.post(`${API_URL}/auth/register`, TEST_USER);
        // Jeśli dotarliśmy tutaj, to błąd - powinien być rzucony wyjątek
        throw new Error('Test powinien się nie powieść - email powinien być już zajęty');
      } catch (error) {
        expect(error.response).to.exist;
        expect(error.response.status).to.equal(400);
        expect(error.response.data).to.have.property('message');
        expect(error.response.data.message).to.include('Email jest już zajęty');
      }
    });
  });
  
  describe('Logowanie', function() {
    it('Powinien zalogować istniejącego użytkownika', async function() {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('token');
        expect(response.data).to.have.property('userId');
        
        // Zaktualizuj token
        authToken = response.data.token;
      } catch (error) {
        console.error('Błąd podczas logowania:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
    
    it('Powinien odrzucić logowanie z nieprawidłowym hasłem', async function() {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: TEST_USER.email,
          password: 'złe_hasło'
        });
        // Jeśli dotarliśmy tutaj, to błąd - powinien być rzucony wyjątek
        throw new Error('Test powinien się nie powieść - hasło jest nieprawidłowe');
      } catch (error) {
        expect(error.response).to.exist;
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('message');
        expect(error.response.data.message).to.include('Nieprawidłowe hasło');
      }
    });
  });
  
  describe('Autoryzacja', function() {
    it('Powinien zezwolić na dostęp do chronionych zasobów z tokenem', async function() {
      try {
        const response = await axios.get(
          `${API_URL}/users/profile`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('email', TEST_USER.email);
      } catch (error) {
        console.error('Błąd podczas pobierania profilu użytkownika:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
    
    it('Powinien odrzucić dostęp do chronionych zasobów bez tokenu', async function() {
      try {
        await axios.get(`${API_URL}/users/profile`);
        // Jeśli dotarliśmy tutaj, to błąd - powinien być rzucony wyjątek
        throw new Error('Test powinien się nie powieść - brak tokenu autoryzacji');
      } catch (error) {
        expect(error.response).to.exist;
        expect(error.response.status).to.equal(401);
      }
    });
  });
  
  // Sprzątanie po testach
  after(async function() {
    if (userId && authToken) {
      try {
        // Usuń testowego użytkownika jeśli test przeszedł pomyślnie
        await axios.delete(
          `${API_URL}/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        console.log('Użytkownik testowy został usunięty');
      } catch (error) {
        console.error('Błąd podczas usuwania testowego użytkownika:', 
          error.response ? error.response.data : error.message);
      }
    }
  });
}); 