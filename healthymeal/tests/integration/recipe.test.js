const { expect } = require('chai');
const axios = require('axios');
const { describe, it, before, after } = require('mocha');

// Konfiguracja
const API_URL = 'http://localhost:3030/api';
let authToken;
let createdRecipeIds = [];

// Dane testowe dla różnych przepisów
const testRecipes = [
  {
    title: 'Sałatka grecka',
    ingredients: [
      { 
        ingredient: { name: 'ogórek' }, 
        quantity: 1, 
        unit: 'szt' 
      },
      { 
        ingredient: { name: 'pomidor' }, 
        quantity: 2, 
        unit: 'szt' 
      },
      { 
        ingredient: { name: 'ser feta' }, 
        quantity: 100, 
        unit: 'g' 
      },
      { 
        ingredient: { name: 'oliwki' }, 
        quantity: 50, 
        unit: 'g' 
      },
      { 
        ingredient: { name: 'oliwa z oliwek' }, 
        quantity: 2, 
        unit: 'łyżki' 
      }
    ],
    steps: [
      { number: 1, description: 'Pokrój warzywa w kostkę.' },
      { number: 2, description: 'Dodaj ser feta i oliwki.' },
      { number: 3, description: 'Skrop oliwą i dopraw solą i pieprzem.' }
    ],
    preparationTime: 15,
    difficulty: 'easy',
    servings: 2,
    tags: ['sałatka', 'wegetariański', 'grecka']
  },
  {
    title: 'Omlet z warzywami',
    ingredients: [
      { 
        ingredient: { name: 'jajka' }, 
        quantity: 3, 
        unit: 'szt' 
      },
      { 
        ingredient: { name: 'papryka' }, 
        quantity: 1, 
        unit: 'szt' 
      },
      { 
        ingredient: { name: 'cebula' }, 
        quantity: 1, 
        unit: 'szt' 
      },
      { 
        ingredient: { name: 'ser żółty' }, 
        quantity: 30, 
        unit: 'g' 
      },
      { 
        ingredient: { name: 'olej' }, 
        quantity: 1, 
        unit: 'łyżka' 
      }
    ],
    steps: [
      { number: 1, description: 'Rozbij jajka i roztrzep w misce.' },
      { number: 2, description: 'Pokrój warzywa w drobną kostkę.' },
      { number: 3, description: 'Rozgrzej olej na patelni, wlej jajka i dodaj warzywa.' },
      { number: 4, description: 'Posyp startym serem i smaż do ścięcia jajek.' }
    ],
    preparationTime: 10,
    difficulty: 'easy',
    servings: 1,
    tags: ['śniadanie', 'wegetariański', 'szybki']
  },
  {
    title: 'Zupa pomidorowa',
    ingredients: [
      { ingredient: { name: 'pomidory' }, quantity: 500, unit: 'g' },
      { ingredient: { name: 'cebula' }, quantity: 1, unit: 'szt' },
      { ingredient: { name: 'czosnek' }, quantity: 2, unit: 'ząbki' },
      { ingredient: { name: 'bulion warzywny' }, quantity: 500, unit: 'ml' },
      { ingredient: { name: 'śmietana' }, quantity: 100, unit: 'ml' },
      { ingredient: { name: 'bazylia' }, quantity: 1, unit: 'garść' }
    ],
    steps: [
      { number: 1, description: 'Podsmaż cebulę i czosnek na oliwie.' },
      { number: 2, description: 'Dodaj pokrojone pomidory i smaż przez 5 minut.' },
      { number: 3, description: 'Wlej bulion i gotuj przez 15 minut.' },
      { number: 4, description: 'Zmiksuj zupę na gładki krem.' },
      { number: 5, description: 'Dodaj śmietanę i bazylię przed podaniem.' }
    ],
    preparationTime: 30,
    difficulty: 'medium',
    servings: 4,
    tags: ['zupa', 'wegetariański', 'obiad']
  },
  {
    title: 'Kurczak curry z ryżem',
    ingredients: [
      { ingredient: { name: 'pierś z kurczaka' }, quantity: 300, unit: 'g' },
      { ingredient: { name: 'ryż basmati' }, quantity: 200, unit: 'g' },
      { ingredient: { name: 'pasta curry' }, quantity: 2, unit: 'łyżki' },
      { ingredient: { name: 'mleko kokosowe' }, quantity: 200, unit: 'ml' },
      { ingredient: { name: 'cebula' }, quantity: 1, unit: 'szt' },
      { ingredient: { name: 'czosnek' }, quantity: 2, unit: 'ząbki' },
      { ingredient: { name: 'imbir' }, quantity: 1, unit: 'łyżeczka' }
    ],
    steps: [
      { number: 1, description: 'Pokrój kurczaka w kostkę.' },
      { number: 2, description: 'Podsmaż cebulę, czosnek i imbir.' },
      { number: 3, description: 'Dodaj kurczaka i smaż do zrumienienia.' },
      { number: 4, description: 'Dodaj pastę curry i mleko kokosowe.' },
      { number: 5, description: 'Gotuj ryż zgodnie z instrukcją na opakowaniu.' },
      { number: 6, description: 'Podawaj curry z ryżem.' }
    ],
    preparationTime: 40,
    difficulty: 'medium',
    servings: 2,
    tags: ['curry', 'obiad', 'azjatycki']
  },
  {
    title: 'Tiramisu',
    ingredients: [
      { ingredient: { name: 'mascarpone' }, quantity: 250, unit: 'g' },
      { ingredient: { name: 'jajka' }, quantity: 3, unit: 'szt' },
      { ingredient: { name: 'cukier' }, quantity: 100, unit: 'g' },
      { ingredient: { name: 'biszkopty' }, quantity: 200, unit: 'g' },
      { ingredient: { name: 'kawa espresso' }, quantity: 200, unit: 'ml' },
      { ingredient: { name: 'kakao' }, quantity: 2, unit: 'łyżki' }
    ],
    steps: [
      { number: 1, description: 'Oddziel żółtka od białek.' },
      { number: 2, description: 'Ubij żółtka z połową cukru, a białka z drugą połową.' },
      { number: 3, description: 'Wymieszaj mascarpone z żółtkami, a następnie delikatnie dodaj białka.' },
      { number: 4, description: 'Zamocz biszkopty w kawie i ułóż pierwszą warstwę.' },
      { number: 5, description: 'Nałóż połowę kremu, powtórz z biszkoptami i kremem.' },
      { number: 6, description: 'Posyp kakao i wstaw do lodówki na 4 godziny.' }
    ],
    preparationTime: 30,
    difficulty: 'medium',
    servings: 6,
    tags: ['deser', 'włoski', 'słodki']
  },
  {
    title: 'Spaghetti Bolognese',
    ingredients: [
      { ingredient: { name: 'makaron spaghetti' }, quantity: 200, unit: 'g' },
      { ingredient: { name: 'mięso mielone wołowe' }, quantity: 300, unit: 'g' },
      { ingredient: { name: 'passata pomidorowa' }, quantity: 400, unit: 'ml' },
      { ingredient: { name: 'cebula' }, quantity: 1, unit: 'szt' },
      { ingredient: { name: 'czosnek' }, quantity: 2, unit: 'ząbki' },
      { ingredient: { name: 'marchew' }, quantity: 1, unit: 'szt' },
      { ingredient: { name: 'seler naciowy' }, quantity: 1, unit: 'łodyga' },
      { ingredient: { name: 'parmezan' }, quantity: 50, unit: 'g' }
    ],
    steps: [
      { number: 1, description: 'Podsmaż cebulę, czosnek, marchew i seler.' },
      { number: 2, description: 'Dodaj mięso i smaż do zrumienienia.' },
      { number: 3, description: 'Dodaj passatę i gotuj na wolnym ogniu przez 30 minut.' },
      { number: 4, description: 'Ugotuj makaron al dente.' },
      { number: 5, description: 'Podawaj sos na makaronie posypany parmezanem.' }
    ],
    preparationTime: 45,
    difficulty: 'medium',
    servings: 4,
    tags: ['makaron', 'włoski', 'obiad']
  },
  {
    title: 'Smoothie jagodowe',
    ingredients: [
      { ingredient: { name: 'jagody' }, quantity: 150, unit: 'g' },
      { ingredient: { name: 'banan' }, quantity: 1, unit: 'szt' },
      { ingredient: { name: 'jogurt naturalny' }, quantity: 150, unit: 'g' },
      { ingredient: { name: 'miód' }, quantity: 1, unit: 'łyżka' },
      { ingredient: { name: 'siemię lniane' }, quantity: 1, unit: 'łyżka' }
    ],
    steps: [
      { number: 1, description: 'Obierz banana i pokrój na kawałki.' },
      { number: 2, description: 'Wrzuć wszystkie składniki do blendera.' },
      { number: 3, description: 'Miksuj do uzyskania jednolitej konsystencji.' }
    ],
    preparationTime: 5,
    difficulty: 'easy',
    servings: 1,
    tags: ['napój', 'śniadanie', 'zdrowy']
  },
  {
    title: 'Pieczone ziemniaki z rozmarynem',
    ingredients: [
      { ingredient: { name: 'ziemniaki' }, quantity: 500, unit: 'g' },
      { ingredient: { name: 'rozmaryn' }, quantity: 2, unit: 'gałązki' },
      { ingredient: { name: 'czosnek' }, quantity: 3, unit: 'ząbki' },
      { ingredient: { name: 'oliwa z oliwek' }, quantity: 3, unit: 'łyżki' },
      { ingredient: { name: 'sól' }, quantity: 1, unit: 'łyżeczka' },
      { ingredient: { name: 'pieprz' }, quantity: 0.5, unit: 'łyżeczki' }
    ],
    steps: [
      { number: 1, description: 'Rozgrzej piekarnik do 200 stopni C.' },
      { number: 2, description: 'Pokrój ziemniaki w ćwiartki.' },
      { number: 3, description: 'Wymieszaj z oliwą, rozmarynem, czosnkiem, solą i pieprzem.' },
      { number: 4, description: 'Piecz przez 30-35 minut, aż będą chrupiące.' }
    ],
    preparationTime: 45,
    difficulty: 'easy',
    servings: 4,
    tags: ['przystawka', 'wegetariański', 'dodatek']
  },
  {
    title: 'Domowe brownie',
    ingredients: [
      { ingredient: { name: 'masło' }, quantity: 200, unit: 'g' },
      { ingredient: { name: 'czekolada gorzka' }, quantity: 200, unit: 'g' },
      { ingredient: { name: 'cukier' }, quantity: 150, unit: 'g' },
      { ingredient: { name: 'jajka' }, quantity: 3, unit: 'szt' },
      { ingredient: { name: 'mąka pszenna' }, quantity: 100, unit: 'g' },
      { ingredient: { name: 'kakao' }, quantity: 2, unit: 'łyżki' },
      { ingredient: { name: 'orzechy włoskie' }, quantity: 50, unit: 'g' }
    ],
    steps: [
      { number: 1, description: 'Rozgrzej piekarnik do 180 stopni C.' },
      { number: 2, description: 'Rozpuść masło z czekoladą w kąpieli wodnej.' },
      { number: 3, description: 'Wymieszaj cukier z jajkami, dodaj mieszankę czekoladową.' },
      { number: 4, description: 'Dodaj przesianą mąkę, kakao i orzechy.' },
      { number: 5, description: 'Piecz w keksówce przez 25-30 minut.' }
    ],
    preparationTime: 45,
    difficulty: 'medium',
    servings: 8,
    tags: ['deser', 'słodki', 'czekoladowy']
  },
  {
    title: 'Hummus klasyczny',
    ingredients: [
      { ingredient: { name: 'ciecierzyca z puszki' }, quantity: 400, unit: 'g' },
      { ingredient: { name: 'tahini' }, quantity: 2, unit: 'łyżki' },
      { ingredient: { name: 'czosnek' }, quantity: 2, unit: 'ząbki' },
      { ingredient: { name: 'sok z cytryny' }, quantity: 2, unit: 'łyżki' },
      { ingredient: { name: 'oliwa z oliwek' }, quantity: 3, unit: 'łyżki' },
      { ingredient: { name: 'kminek' }, quantity: 0.5, unit: 'łyżeczki' }
    ],
    steps: [
      { number: 1, description: 'Odcedź i przepłucz ciecierzycę.' },
      { number: 2, description: 'Zmiksuj wszystkie składniki oprócz oliwy.' },
      { number: 3, description: 'Dodawaj powoli oliwę podczas miksowania.' },
      { number: 4, description: 'Dopraw solą i pieprzem do smaku.' }
    ],
    preparationTime: 10,
    difficulty: 'easy',
    servings: 4,
    tags: ['pasta', 'wegetariański', 'przystawka']
  }
];

describe('Testy integracyjne przepisów', function() {
  this.timeout(10000); // Zwiększenie limitu czasu dla testów

  // Logowanie i przygotowanie
  before(async function() {
    try {
      // Logowanie do systemu
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'Test123456'
      });
      
      authToken = loginResponse.data.token;
      console.log('Zalogowano pomyślnie');
    } catch (error) {
      console.error('Błąd logowania:', error.response ? error.response.data : error.message);
      throw error;
    }
  });

  // Sprzątanie po testach
  after(async function() {
    try {
      // Usuwanie utworzonych przepisów
      for (const id of createdRecipeIds) {
        try {
          await axios.delete(`${API_URL}/recipes/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log(`Usunięto przepis o ID: ${id}`);
        } catch (err) {
          console.error(`Błąd usuwania przepisu ${id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('Błąd podczas czyszczenia danych testowych:', error.message);
    }
  });

  // Test dodawania przepisów
  describe('Dodawanie przepisów', function() {
    testRecipes.forEach((recipe, index) => {
      it(`Powinien dodać przepis "${recipe.title}"`, async function() {
        try {
          const response = await axios.post(`${API_URL}/recipes`, recipe, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          
          expect(response.status).to.equal(201);
          expect(response.data).to.have.property('recipeId');
          expect(response.data.message).to.equal('Przepis dodany pomyślnie');
          
          createdRecipeIds.push(response.data.recipeId);
          console.log(`Dodano przepis "${recipe.title}" z ID: ${response.data.recipeId}`);
        } catch (error) {
          console.error(`Błąd dodawania przepisu "${recipe.title}":`, 
            error.response ? error.response.data : error.message);
          throw error;
        }
      });
    });
  });

  // Test pobierania listy przepisów
  describe('Pobieranie listy przepisów', function() {
    it('Powinien zwrócić listę przepisów użytkownika', async function() {
      try {
        const response = await axios.get(`${API_URL}/recipes`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('recipes');
        expect(response.data.recipes).to.be.an('array');
        expect(response.data.total).to.be.at.least(createdRecipeIds.length);
        
        console.log(`Pobrano ${response.data.recipes.length} przepisów`);
      } catch (error) {
        console.error('Błąd pobierania listy przepisów:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
  });

  // Test szczegółów przepisu
  describe('Pobieranie szczegółów przepisu', function() {
    it('Powinien zwrócić szczegóły przepisu', async function() {
      // Testujemy tylko pierwszy przepis dla uproszczenia
      if (createdRecipeIds.length > 0) {
        try {
          const recipeId = createdRecipeIds[0];
          const response = await axios.get(`${API_URL}/recipes/${recipeId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('title');
          expect(response.data).to.have.property('ingredients');
          expect(response.data).to.have.property('steps');
          
          console.log(`Pobrano szczegóły przepisu "${response.data.title}"`);
        } catch (error) {
          console.error('Błąd pobierania szczegółów przepisu:', 
            error.response ? error.response.data : error.message);
          throw error;
        }
      } else {
        this.skip();
      }
    });
  });

  // Test aktualizacji przepisu
  describe('Aktualizacja przepisu', function() {
    it('Powinien zaktualizować istniejący przepis', async function() {
      if (createdRecipeIds.length > 0) {
        try {
          const recipeId = createdRecipeIds[0];
          const updateData = {
            title: 'Zaktualizowany przepis',
            preparationTime: 25,
            difficulty: 'hard'
          };
          
          const response = await axios.put(`${API_URL}/recipes/${recipeId}`, updateData, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          
          expect(response.status).to.equal(200);
          expect(response.data.message).to.equal('Przepis zaktualizowany pomyślnie');
          
          // Sprawdźmy, czy zmiany zostały zapisane
          const getResponse = await axios.get(`${API_URL}/recipes/${recipeId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          
          expect(getResponse.data.title).to.equal(updateData.title);
          expect(getResponse.data.preparationTime).to.equal(updateData.preparationTime);
          expect(getResponse.data.difficulty).to.equal(updateData.difficulty);
          
          console.log(`Zaktualizowano przepis z ID: ${recipeId}`);
        } catch (error) {
          console.error('Błąd aktualizacji przepisu:', 
            error.response ? error.response.data : error.message);
          throw error;
        }
      } else {
        this.skip();
      }
    });
  });

  // Test filtrowania przepisów
  describe('Filtrowanie przepisów', function() {
    it('Powinien filtrować przepisy po tagach', async function() {
      try {
        const response = await axios.get(`${API_URL}/recipes?tags=wegetariański`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        expect(response.status).to.equal(200);
        expect(response.data.recipes).to.be.an('array');
        
        // Sprawdźmy, czy wszystkie przepisy mają tag "wegetariański"
        if (response.data.recipes.length > 0) {
          response.data.recipes.forEach(recipe => {
            expect(recipe.tags).to.include('wegetariański');
          });
        }
        
        console.log(`Znaleziono ${response.data.recipes.length} przepisów wegetariańskich`);
      } catch (error) {
        console.error('Błąd filtrowania przepisów:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });

    it('Powinien filtrować przepisy po poziomie trudności', async function() {
      try {
        const response = await axios.get(`${API_URL}/recipes?difficulty=easy`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        expect(response.status).to.equal(200);
        expect(response.data.recipes).to.be.an('array');
        
        // Sprawdźmy, czy wszystkie przepisy mają trudność "easy"
        if (response.data.recipes.length > 0) {
          response.data.recipes.forEach(recipe => {
            expect(recipe.difficulty).to.equal('easy');
          });
        }
        
        console.log(`Znaleziono ${response.data.recipes.length} przepisów łatwych`);
      } catch (error) {
        console.error('Błąd filtrowania przepisów po trudności:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
  });

  // Test wyszukiwania przepisów
  describe('Wyszukiwanie przepisów', function() {
    it('Powinien wyszukiwać przepisy po tekście', async function() {
      try {
        const searchText = 'sałatka';
        const response = await axios.get(`${API_URL}/recipes?search=${searchText}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        expect(response.status).to.equal(200);
        expect(response.data.recipes).to.be.an('array');
        
        console.log(`Znaleziono ${response.data.recipes.length} przepisów zawierających "${searchText}"`);
      } catch (error) {
        console.error('Błąd wyszukiwania przepisów:', 
          error.response ? error.response.data : error.message);
        throw error;
      }
    });
  });
}); 