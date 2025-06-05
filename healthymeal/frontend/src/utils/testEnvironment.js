/**
 * Narzędzia do zarządzania środowiskiem testowym aplikacji
 * Plik zawiera funkcje pomocnicze do wykrywania i konfigurowania 
 * środowiska testowego w aplikacji frontend.
 */

/**
 * Sprawdza, czy aplikacja działa w środowisku testowym
 * @returns {boolean} Informacja, czy jesteśmy w środowisku testowym
 */
export const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || 
         localStorage.getItem('test_mode') === 'true' ||
         process.env.REACT_APP_TEST_MODE === 'true';
};

/**
 * Sprawdza, czy aplikacja działa w trybie symulacji (mocki)
 * @returns {boolean} Informacja, czy używamy mocków
 */
export const isMockMode = () => {
  return process.env.REACT_APP_USE_MOCKS === 'true' || 
         localStorage.getItem('use_mocks') === 'true';
};

/**
 * Sprawdza, czy aktualny użytkownik jest testowy
 * @returns {boolean} Informacja, czy użytkownik jest testowy
 */
export const isTestUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email?.includes('test') || 
           user.email?.includes('example') || 
           localStorage.getItem('test_user') === 'true' ||
           false;
  } catch (error) {
    console.error('Błąd podczas sprawdzania czy użytkownik jest testowy:', error);
    return false;
  }
};

/**
 * Włącza tryb testowy w aplikacji
 * @param {Object} options - Opcje konfiguracyjne
 * @param {boolean} options.useMocks - Czy używać mocków
 * @param {boolean} options.testUser - Czy ustawić użytkownika jako testowego
 */
export const enableTestMode = (options = {}) => {
  localStorage.setItem('test_mode', 'true');
  
  if (options.useMocks) {
    localStorage.setItem('use_mocks', 'true');
  }
  
  if (options.testUser) {
    localStorage.setItem('test_user', 'true');
  }
  
  // Odśwież stronę, aby zastosować nowe ustawienia
  if (options.reload !== false) {
    window.location.reload();
  }
};

/**
 * Wyłącza tryb testowy w aplikacji
 * @param {Object} options - Opcje konfiguracyjne
 * @param {boolean} options.reload - Czy odświeżyć stronę po wyłączeniu
 */
export const disableTestMode = (options = {}) => {
  localStorage.removeItem('test_mode');
  localStorage.removeItem('use_mocks');
  localStorage.removeItem('test_user');
  
  // Odśwież stronę, aby zastosować nowe ustawienia
  if (options.reload !== false) {
    window.location.reload();
  }
};

/**
 * Generuje testowe dane dla różnych części aplikacji
 * @param {string} dataType - Typ danych do wygenerowania (recipes, preferences, etc.)
 * @returns {any} Wygenerowane dane testowe
 */
export const generateTestData = (dataType) => {
  switch(dataType) {
    case 'recipes':
      return [
        {
          _id: 'test-recipe-1',
          title: 'Testowy przepis 1',
          preparationTime: 30,
          difficulty: 'Łatwy',
          tags: ['test', 'śniadanie']
        },
        {
          _id: 'test-recipe-2',
          title: 'Testowy przepis 2',
          preparationTime: 45,
          difficulty: 'Średni',
          tags: ['test', 'obiad']
        }
      ];
      
    case 'recipeOfDay':
      return {
        _id: 'test-recipe-day',
        title: 'Testowy przepis dnia',
        preparationTime: 20,
        difficulty: 'Łatwy',
        tags: ['test', 'kolacja']
      };
      
    case 'preferences':
      return {
        dietType: 'wegetariańska',
        maxCarbs: 50,
        excludedProducts: ['mleko', 'jajka'],
        allergens: ['orzechy']
      };
      
    case 'aiUsage':
      return {
        count: 2,
        limit: 10,
        remaining: 8
      };
      
    default:
      console.warn(`Nieznany typ danych testowych: ${dataType}`);
      return null;
  }
}; 