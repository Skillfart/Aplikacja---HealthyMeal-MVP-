import { test, expect } from '@playwright/test';

// Testowe preferencje dietetyczne
const TEST_PREFERENCES = {
  dietType: 'lowCarb',
  maxCalories: 2000,
  maxCarbs: 50,
  excludedProducts: ['mleko', 'jajka'],
  allergens: ['gluten']
};

// Stały adres aplikacji
const BASE_URL = 'http://localhost:3000';

test.describe('Testy planów dietetycznych', () => {
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

  test('Konfiguracja preferencji dietetycznych', async ({ page }) => {
    // Przejdź do strony preferencji
    await page.locator('a:has-text("Profil")').click();
    await page.locator('button:has-text("Preferencje")').click();
    
    // Wypełnij preferencje dietetyczne
    await page.locator('select[name="dietType"]').selectOption(TEST_PREFERENCES.dietType);
    await page.locator('input[name="maxCalories"]').fill(String(TEST_PREFERENCES.maxCalories));
    await page.locator('input[name="maxCarbs"]').fill(String(TEST_PREFERENCES.maxCarbs));
    
    // Dodaj wykluczone produkty
    for (const product of TEST_PREFERENCES.excludedProducts) {
      await page.locator('input[placeholder*="produkt"]').fill(product);
      await page.locator('button:has-text("Dodaj produkt")').click();
    }
    
    // Dodaj alergeny
    for (const allergen of TEST_PREFERENCES.allergens) {
      await page.locator('input[placeholder*="alergen"]').fill(allergen);
      await page.locator('button:has-text("Dodaj alergen")').click();
    }
    
    // Zapisz preferencje
    await page.locator('button:has-text("Zapisz preferencje")').click();
    
    // Sprawdź, czy zapisano pomyślnie
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('Generowanie planu diety', async ({ page }) => {
    // Przejdź do strony generowania planu diety
    await page.locator('a:has-text("Plan diety")').click();
    
    // Ustaw parametry planu
    await page.locator('input[name="days"]').fill('3');
    await page.locator('input[name="mealsPerDay"]').fill('3');
    
    // Kliknij przycisk generowania
    await page.locator('button:has-text("Generuj plan")').click();
    
    // Poczekaj na wygenerowanie planu (to może zająć chwilę)
    await page.locator('.diet-plan-day').first().waitFor({ timeout: 60000 });
    
    // Sprawdź, czy plan został wygenerowany
    await expect(page.locator('.diet-plan-day')).toHaveCount(3); // 3 dni
    
    // Sprawdź, czy każdy dzień ma odpowiednią liczbę posiłków
    const days = await page.locator('.diet-plan-day').all();
    for (const day of days) {
      const meals = await day.locator('.diet-plan-meal').all();
      expect(meals.length).toBe(3); // 3 posiłki dziennie
    }
    
    // Sprawdź, czy plan nie zawiera wykluczonych produktów
    const planText = await page.locator('.diet-plan-container').textContent();
    for (const product of TEST_PREFERENCES.excludedProducts) {
      expect(planText.toLowerCase()).not.toContain(product.toLowerCase());
    }
  });

  test('Zapisywanie planu diety', async ({ page }) => {
    // Przejdź do strony z wygenerowanym planem diety
    await page.locator('a:has-text("Plan diety")').click();
    
    // Ustaw parametry planu
    await page.locator('input[name="days"]').fill('1');
    await page.locator('input[name="mealsPerDay"]').fill('2');
    
    // Kliknij przycisk generowania
    await page.locator('button:has-text("Generuj plan")').click();
    
    // Poczekaj na wygenerowanie planu
    await page.locator('.diet-plan-day').first().waitFor({ timeout: 60000 });
    
    // Zapisz plan
    await page.locator('button:has-text("Zapisz plan")').click();
    
    // Sprawdź, czy plan został zapisany
    await expect(page.locator('.success-message')).toBeVisible();
    
    // Przejdź do zapisanych planów
    await page.locator('button:has-text("Zapisane plany")').click();
    
    // Sprawdź, czy plan jest na liście
    await expect(page.locator('.saved-plan-item').first()).toBeVisible();
  });

  test('Przeglądanie zapisanego planu diety', async ({ page }) => {
    // Przejdź do strony z zapisanymi planami
    await page.locator('a:has-text("Plan diety")').click();
    await page.locator('button:has-text("Zapisane plany")').click();
    
    // Kliknij na pierwszy zapisany plan
    await page.locator('.saved-plan-item').first().click();
    
    // Sprawdź, czy plan się wyświetla
    await expect(page.locator('.diet-plan-day')).toBeVisible();
    await expect(page.locator('.diet-plan-meal')).toBeVisible();
  });

  test('Edycja zapisanego planu diety', async ({ page }) => {
    // Przejdź do strony z zapisanymi planami
    await page.locator('a:has-text("Plan diety")').click();
    await page.locator('button:has-text("Zapisane plany")').click();
    
    // Kliknij na pierwszy zapisany plan
    await page.locator('.saved-plan-item').first().click();
    
    // Kliknij przycisk edycji
    await page.locator('button:has-text("Edytuj")').click();
    
    // Zmień nazwę planu
    const updatedPlanName = 'Zaktualizowany plan diety';
    await page.locator('input[name="planName"]').fill(updatedPlanName);
    
    // Zapisz zmiany
    await page.locator('button:has-text("Zapisz zmiany")').click();
    
    // Sprawdź, czy zmiany zostały zapisane
    await expect(page.locator('.plan-name')).toContainText(updatedPlanName);
  });
}); 