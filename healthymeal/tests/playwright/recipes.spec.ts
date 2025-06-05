import { test, expect } from '@playwright/test';
import * as path from 'path';

// Testowe dane przepisu
const TEST_RECIPE = {
  title: 'Test Recipe Playwright',
  ingredients: [
    { name: 'Mąka pszenna', quantity: 200, unit: 'g' },
    { name: 'Cukier', quantity: 100, unit: 'g' }
  ],
  steps: [
    'Wymieszać wszystkie składniki',
    'Piec w 180°C przez 30 minut'
  ],
  preparationTime: 30,
  difficulty: 'easy',
  servings: 4,
  tags: ['deser', 'ciasto']
};

// Stały adres aplikacji
const BASE_URL = 'http://localhost:3000';

test.describe('Zarządzanie przepisami', () => {
  // Stan do współdzielenia między testami
  let recipeId;

  // Przed każdym testem zaloguj się
  test.beforeEach(async ({ page }) => {
    // Logowanie
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD || 'test123password');
    await page.locator('button[type="submit"]').click();
    
    // Sprawdź, czy logowanie się powiodło
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Dodawanie nowego przepisu', async ({ page }) => {
    // Przejdź do strony dodawania przepisu
    await page.locator('button:has-text("Dodaj przepis")').click();
    
    // Wypełnij formularz przepisu
    await page.locator('input[name="title"]').fill(TEST_RECIPE.title);
    
    // Dodaj składniki
    for (const ingredient of TEST_RECIPE.ingredients) {
      await page.locator('input[placeholder*="Nazwa składnika"]').fill(ingredient.name);
      await page.locator('input[placeholder*="Ilość"]').fill(String(ingredient.quantity));
      await page.locator('input[placeholder*="Jednostka"]').fill(ingredient.unit);
      await page.locator('button:has-text("Dodaj składnik")').click();
    }
    
    // Dodaj kroki
    for (const step of TEST_RECIPE.steps) {
      await page.locator('textarea[placeholder*="Krok"]').fill(step);
      await page.locator('button:has-text("Dodaj krok")').click();
    }
    
    // Uzupełnij pozostałe pola
    await page.locator('input[name="preparationTime"]').fill(String(TEST_RECIPE.preparationTime));
    await page.locator('select[name="difficulty"]').selectOption(TEST_RECIPE.difficulty);
    await page.locator('input[name="servings"]').fill(String(TEST_RECIPE.servings));
    
    // Dodaj tagi
    for (const tag of TEST_RECIPE.tags) {
      await page.locator('input[placeholder*="Tag"]').fill(tag);
      await page.locator('button:has-text("Dodaj tag")').click();
    }
    
    // Zapisz przepis
    await page.locator('button:has-text("Zapisz przepis")').click();
    
    // Sprawdź, czy zostaliśmy przekierowani do szczegółów przepisu
    await expect(page.locator('h1')).toContainText(TEST_RECIPE.title);
    
    // Zapisz ID przepisu do przyszłych testów (z URL)
    const url = page.url();
    recipeId = url.split('/').pop();
  });

  test('Wyświetlanie listy przepisów', async ({ page }) => {
    // Przejdź do listy przepisów
    await page.locator('a:has-text("Przepisy")').click();
    
    // Sprawdź, czy przepis testowy jest na liście
    await expect(page.locator('.recipe-card', { hasText: TEST_RECIPE.title })).toBeVisible();
  });

  test('Wyświetlanie szczegółów przepisu', async ({ page }) => {
    // Jeśli nie mamy ID przepisu, pomiń test
    if (!recipeId) {
      test.skip();
      return;
    }
    
    // Przejdź do szczegółów przepisu
    await page.goto(`${BASE_URL}/recipes/${recipeId}`);
    
    // Sprawdź, czy szczegóły się wyświetlają
    await expect(page.locator('h1')).toContainText(TEST_RECIPE.title);
    await expect(page.locator('.ingredients-list')).toContainText(TEST_RECIPE.ingredients[0].name);
    await expect(page.locator('.steps-list')).toContainText(TEST_RECIPE.steps[0]);
  });

  test('Edycja przepisu', async ({ page }) => {
    // Jeśli nie mamy ID przepisu, pomiń test
    if (!recipeId) {
      test.skip();
      return;
    }
    
    // Przejdź do edycji przepisu
    await page.goto(`${BASE_URL}/recipes/${recipeId}`);
    await page.locator('button:has-text("Edytuj")').click();
    
    // Zmień tytuł przepisu
    const updatedTitle = 'Zaktualizowany przepis testowy';
    await page.locator('input[name="title"]').fill(updatedTitle);
    
    // Zapisz zmiany
    await page.locator('button:has-text("Zapisz")').click();
    
    // Sprawdź, czy zmiany zostały zapisane
    await expect(page.locator('h1')).toContainText(updatedTitle);
  });

  test('Usuwanie przepisu', async ({ page }) => {
    // Jeśli nie mamy ID przepisu, pomiń test
    if (!recipeId) {
      test.skip();
      return;
    }
    
    // Przejdź do szczegółów przepisu
    await page.goto(`${BASE_URL}/recipes/${recipeId}`);
    
    // Usuń przepis
    await page.locator('button:has-text("Usuń")').click();
    
    // Potwierdź usunięcie
    await page.locator('button:has-text("Potwierdź")').click();
    
    // Sprawdź, czy zostaliśmy przekierowani do listy przepisów
    await expect(page).toHaveURL(/recipes/);
    
    // Sprawdź, czy przepis zniknął z listy
    await expect(page.locator('text=Zaktualizowany przepis testowy')).toHaveCount(0);
  });
}); 