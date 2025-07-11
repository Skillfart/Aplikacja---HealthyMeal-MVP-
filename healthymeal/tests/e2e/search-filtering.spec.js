import { test, expect } from '@playwright/test';

// Dane testowe
const testUser = {
  email: 'test-search@example.com',
  password: 'TestPassword123!',
  name: 'Test User Search'
};

const testRecipes = [
  {
    title: 'Keto Kotlet Schabowy',
    ingredients: ['schab', 'jajko', 'mąka migdałowa'],
    hashtags: ['keto', 'obiad', 'mięso'],
    preparationTime: 30
  },
  {
    title: 'Vegan Sałatka Grecka',
    ingredients: ['ogórek', 'pomidor', 'oliwki', 'ser vegan'],
    hashtags: ['vegan', 'sałatka', 'zdrowe'],
    preparationTime: 15
  },
  {
    title: 'Low-Carb Zupa Pomidorowa',
    ingredients: ['pomidory', 'bulion', 'śmietana'],
    hashtags: ['low-carb', 'zupa', 'obiad'],
    preparationTime: 45
  },
  {
    title: 'Paleo Kurczak z Warzywami',
    ingredients: ['kurczak', 'brokuły', 'marchew'],
    hashtags: ['paleo', 'kurczak', 'warzywa'],
    preparationTime: 25
  }
];

test.describe('🔍 E2E Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Przejdź na stronę logowania
    await page.goto('/auth/login');
    
    // Zaloguj się jako testowy użytkownik
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Sprawdź czy logowanie się powiodło
    await expect(page).toHaveURL('/dashboard');
    
    // Przejdź do listy przepisów
    await page.click('[data-testid="recipes-link"]');
    await expect(page).toHaveURL('/recipes');
  });

  test('powinien wyświetlić pole wyszukiwania i filtry', async ({ page }) => {
    // Sprawdź czy główne elementy są widoczne
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="hashtags-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="preparation-time-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="difficulty-filter"]')).toBeVisible();
  });

  test('powinien wyszukiwać przepisy po tytule', async ({ page }) => {
    // Wyszukaj przepisy z "keto"
    await page.fill('[data-testid="search-input"]', 'keto');
    await page.keyboard.press('Enter');
    
    // Sprawdź wyniki
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="recipe-title"]')).toContainText('Keto');
    
    // Wyszukaj przepisy z "sałatka"
    await page.fill('[data-testid="search-input"]', 'sałatka');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="recipe-title"]')).toContainText('Sałatka');
  });

  test('powinien wyszukiwać przepisy po składnikach', async ({ page }) => {
    // Wyszukaj przepisy ze składnikiem "kurczak"
    await page.fill('[data-testid="search-input"]', 'kurczak');
    await page.keyboard.press('Enter');
    
    // Sprawdź wyniki
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="recipe-title"]')).toContainText('Kurczak');
    
    // Wyszukaj przepisy ze składnikiem "pomidor"
    await page.fill('[data-testid="search-input"]', 'pomidor');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(2);
  });

  test('powinien filtrować przepisy po hashtagu', async ({ page }) => {
    // Kliknij filtr keto
    await page.click('[data-testid="hashtag-filter-keto"]');
    
    // Sprawdź wyniki
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="recipe-hashtag"]')).toContainText('#keto');
    
    // Dodaj filtr vegan
    await page.click('[data-testid="hashtag-filter-vegan"]');
    
    // Sprawdź że są 2 przepisy (keto + vegan)
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(2);
  });

  test('powinien filtrować przepisy po czasie przygotowania', async ({ page }) => {
    // Ustaw maksymalny czas na 20 minut
    await page.fill('[data-testid="max-time-input"]', '20');
    await page.click('[data-testid="apply-time-filter"]');
    
    // Sprawdź że pokazuje tylko przepisy ≤ 20 min
    const recipes = page.locator('[data-testid="recipe-card"]');
    const count = await recipes.count();
    
    for (let i = 0; i < count; i++) {
      const timeText = await recipes.nth(i).locator('[data-testid="preparation-time"]').textContent();
      const time = parseInt(timeText.replace(' min', ''));
      expect(time).toBeLessThanOrEqual(20);
    }
  });

  test('powinien kombinować wyszukiwanie z filtrami', async ({ page }) => {
    // Wyszukaj "obiad"
    await page.fill('[data-testid="search-input"]', 'obiad');
    await page.keyboard.press('Enter');
    
    // Dodaj filtr keto
    await page.click('[data-testid="hashtag-filter-keto"]');
    
    // Sprawdź że pokazuje tylko "Keto Kotlet" (obiad + keto)
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="recipe-title"]')).toContainText('Keto Kotlet');
  });

  test('powinien wyczyścić filtry', async ({ page }) => {
    // Zastosuj kilka filtrów
    await page.fill('[data-testid="search-input"]', 'keto');
    await page.keyboard.press('Enter');
    await page.click('[data-testid="hashtag-filter-keto"]');
    await page.fill('[data-testid="max-time-input"]', '30');
    
    // Sprawdź że filtry są aktywne
    await expect(page.locator('[data-testid="active-filters"]')).toBeVisible();
    
    // Wyczyść wszystkie filtry
    await page.click('[data-testid="clear-all-filters"]');
    
    // Sprawdź że wszystkie przepisy są widoczne
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(4);
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
  });

  test('powinien sortować wyniki wyszukiwania', async ({ page }) => {
    // Wyszukaj wszystkie przepisy
    await page.fill('[data-testid="search-input"]', '');
    
    // Sortuj po czasie przygotowania (rosnąco)
    await page.selectOption('[data-testid="sort-select"]', 'preparation-time-asc');
    
    // Sprawdź kolejność
    const firstRecipe = page.locator('[data-testid="recipe-card"]').first();
    await expect(firstRecipe.locator('[data-testid="recipe-title"]')).toContainText('Vegan Sałatka'); // 15 min
    
    // Sortuj po czasie przygotowania (malejąco)
    await page.selectOption('[data-testid="sort-select"]', 'preparation-time-desc');
    
    const firstRecipeDesc = page.locator('[data-testid="recipe-card"]').first();
    await expect(firstRecipeDesc.locator('[data-testid="recipe-title"]')).toContainText('Low-Carb Zupa'); // 45 min
  });

  test('powinien wyświetlić komunikat "brak wyników"', async ({ page }) => {
    // Wyszukaj nieistniejący przepis
    await page.fill('[data-testid="search-input"]', 'nieistniejący przepis xyz');
    await page.keyboard.press('Enter');
    
    // Sprawdź komunikat
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results"]')).toContainText('Nie znaleziono przepisów');
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(0);
  });

  test('powinien obsługiwać paginację wyników', async ({ page }) => {
    // Jeśli jest więcej niż 10 przepisów, sprawdź paginację
    const recipeCount = await page.locator('[data-testid="recipe-card"]').count();
    
    if (recipeCount > 10) {
      // Sprawdź czy paginacja jest widoczna
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      
      // Przejdź na drugą stronę
      await page.click('[data-testid="page-2"]');
      
      // Sprawdź czy URL się zmienił
      await expect(page).toHaveURL(/.*page=2/);
    }
  });

  test('powinien zachować filtry w URL', async ({ page }) => {
    // Zastosuj filtry
    await page.fill('[data-testid="search-input"]', 'keto');
    await page.keyboard.press('Enter');
    await page.click('[data-testid="hashtag-filter-keto"]');
    
    // Sprawdź URL
    await expect(page).toHaveURL(/.*search=keto/);
    await expect(page).toHaveURL(/.*hashtags=keto/);
    
    // Odśwież stronę
    await page.reload();
    
    // Sprawdź czy filtry zostały zachowane
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('keto');
    await expect(page.locator('[data-testid="hashtag-filter-keto"]')).toBeChecked();
  });

  test('powinien wyświetlić liczbę znalezionych wyników', async ({ page }) => {
    // Wyszukaj "keto"
    await page.fill('[data-testid="search-input"]', 'keto');
    await page.keyboard.press('Enter');
    
    // Sprawdź licznik wyników
    await expect(page.locator('[data-testid="results-count"]')).toContainText('Znaleziono 1 przepis');
    
    // Wyszukaj "pomidor"
    await page.fill('[data-testid="search-input"]', 'pomidor');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="results-count"]')).toContainText('Znaleziono 2 przepisy');
  });
}); 