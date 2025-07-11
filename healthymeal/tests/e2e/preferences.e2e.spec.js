import { test, expect } from '@playwright/test';

// Dane testowe
const testUser = {
  email: 'test-preferences@example.com',
  password: 'TestPassword123!',
  name: 'Test User Preferences'
};

const testPreferences = {
  dietType: 'keto',
  maxCarbs: 25,
  excludedProducts: ['cukier', 'mąka pszenna', 'ryż'],
  allergens: ['gluten', 'dairy', 'nuts']
};

test.describe('🧪 E2E Preferences Management', () => {
  test.beforeEach(async ({ page }) => {
    // Przejdź na stronę logowania
    await page.goto('/auth/login');
    
    // Zaloguj się jako testowy użytkownik
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Sprawdź czy logowanie się powiodło
    await expect(page).toHaveURL('/dashboard');
  });

  test('powinien wyświetlić formularz preferencji', async ({ page }) => {
    // Przejdź do preferencji
    await page.click('[data-testid="preferences-link"]');
    
    // Sprawdź czy formularz się wyświetla
    await expect(page).toHaveURL('/profile/preferences');
    await expect(page.locator('[data-testid="preferences-form"]')).toBeVisible();
    
    // Sprawdź obecność głównych sekcji
    await expect(page.locator('[data-testid="diet-type-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-carbs-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="excluded-products-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="allergens-section"]')).toBeVisible();
  });

  test('powinien pozwolić na wybór typu diety', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Sprawdź domyślną wartość
    const dietSelect = page.locator('[data-testid="diet-type-select"]');
    await expect(dietSelect).toHaveValue('normal');
    
    // Zmień typ diety
    await dietSelect.selectOption('keto');
    await expect(dietSelect).toHaveValue('keto');
    
    // Sprawdź czy opcje są dostępne
    const options = await dietSelect.locator('option').allTextContents();
    expect(options).toContain('Normalna');
    expect(options).toContain('Keto');
    expect(options).toContain('Low Carb');
    expect(options).toContain('Paleo');
  });

  test('powinien pozwolić na ustawienie maksymalnej ilości węglowodanów', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Sprawdź suwak węglowodanów
    const carbsSlider = page.locator('[data-testid="max-carbs-slider"]');
    await expect(carbsSlider).toBeVisible();
    
    // Ustaw wartość suwaka
    await carbsSlider.fill('25');
    await expect(carbsSlider).toHaveValue('25');
    
    // Sprawdź czy wartość jest wyświetlana
    const carbsValue = page.locator('[data-testid="max-carbs-value"]');
    await expect(carbsValue).toContainText('25g');
  });

  test('powinien pozwolić na dodanie wykluczonych produktów', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Znajdź pole wykluczonych produktów
    const excludedInput = page.locator('[data-testid="excluded-products-input"]');
    await expect(excludedInput).toBeVisible();
    
    // Dodaj produkty
    await excludedInput.fill('cukier');
    await page.keyboard.press('Enter');
    
    await excludedInput.fill('mąka pszenna');
    await page.keyboard.press('Enter');
    
    // Sprawdź czy produkty zostały dodane
    await expect(page.locator('[data-testid="excluded-tag-cukier"]')).toBeVisible();
    await expect(page.locator('[data-testid="excluded-tag-mąka pszenna"]')).toBeVisible();
  });

  test('powinien pozwolić na usunięcie wykluczonych produktów', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Dodaj produkt
    const excludedInput = page.locator('[data-testid="excluded-products-input"]');
    await excludedInput.fill('cukier');
    await page.keyboard.press('Enter');
    
    // Sprawdź czy produkt został dodany
    await expect(page.locator('[data-testid="excluded-tag-cukier"]')).toBeVisible();
    
    // Usuń produkt
    await page.click('[data-testid="remove-excluded-cukier"]');
    
    // Sprawdź czy produkt został usunięty
    await expect(page.locator('[data-testid="excluded-tag-cukier"]')).not.toBeVisible();
  });

  test('powinien pozwolić na wybór alergenów', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Sprawdź checkboxy alergenów
    const glutenCheckbox = page.locator('[data-testid="allergen-gluten"]');
    const dairyCheckbox = page.locator('[data-testid="allergen-dairy"]');
    const nutsCheckbox = page.locator('[data-testid="allergen-nuts"]');
    
    await expect(glutenCheckbox).toBeVisible();
    await expect(dairyCheckbox).toBeVisible();
    await expect(nutsCheckbox).toBeVisible();
    
    // Zaznacz alergeny
    await glutenCheckbox.check();
    await dairyCheckbox.check();
    await nutsCheckbox.check();
    
    // Sprawdź czy są zaznaczone
    await expect(glutenCheckbox).toBeChecked();
    await expect(dairyCheckbox).toBeChecked();
    await expect(nutsCheckbox).toBeChecked();
  });

  test('powinien zapisać preferencje', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Wypełnij formularz
    await page.selectOption('[data-testid="diet-type-select"]', 'keto');
    await page.fill('[data-testid="max-carbs-slider"]', '25');
    
    // Dodaj wykluczony produkt
    const excludedInput = page.locator('[data-testid="excluded-products-input"]');
    await excludedInput.fill('cukier');
    await page.keyboard.press('Enter');
    
    // Zaznacz alergeny
    await page.check('[data-testid="allergen-gluten"]');
    await page.check('[data-testid="allergen-dairy"]');
    
    // Zapisz preferencje
    await page.click('[data-testid="save-preferences-button"]');
    
    // Sprawdź komunikat sukcesu
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Preferencje zostały zapisane');
  });

  test('powinien wyświetlić błąd walidacji dla nieprawidłowych danych', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Ustaw nieprawidłową wartość węglowodanów
    await page.fill('[data-testid="max-carbs-slider"]', '999');
    
    // Spróbuj zapisać
    await page.click('[data-testid="save-preferences-button"]');
    
    // Sprawdź komunikat błędu
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Maksymalna ilość węglowodanów nie może przekraczać 300g');
  });

  test('powinien zachować preferencje po odświeżeniu strony', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Ustaw preferencje
    await page.selectOption('[data-testid="diet-type-select"]', 'lowCarb');
    await page.fill('[data-testid="max-carbs-slider"]', '50');
    
    // Zapisz
    await page.click('[data-testid="save-preferences-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Odśwież stronę
    await page.reload();
    
    // Sprawdź czy preferencje zostały zachowane
    await expect(page.locator('[data-testid="diet-type-select"]')).toHaveValue('lowCarb');
    await expect(page.locator('[data-testid="max-carbs-slider"]')).toHaveValue('50');
  });

  test('powinien resetować preferencje do domyślnych', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Ustaw preferencje
    await page.selectOption('[data-testid="diet-type-select"]', 'keto');
    await page.fill('[data-testid="max-carbs-slider"]', '20');
    
    // Kliknij reset
    await page.click('[data-testid="reset-preferences-button"]');
    
    // Sprawdź czy wartości zostały zresetowane
    await expect(page.locator('[data-testid="diet-type-select"]')).toHaveValue('normal');
    await expect(page.locator('[data-testid="max-carbs-slider"]')).toHaveValue('0');
  });

  test('powinien wyświetlić podgląd wpływu preferencji na przepisy', async ({ page }) => {
    await page.goto('/profile/preferences');
    
    // Ustaw preferencje
    await page.selectOption('[data-testid="diet-type-select"]', 'keto');
    await page.fill('[data-testid="max-carbs-slider"]', '25');
    
    // Dodaj wykluczony produkt
    const excludedInput = page.locator('[data-testid="excluded-products-input"]');
    await excludedInput.fill('cukier');
    await page.keyboard.press('Enter');
    
    // Sprawdź podgląd wpływu
    await expect(page.locator('[data-testid="preferences-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preferences-preview"]')).toContainText('Keto');
    await expect(page.locator('[data-testid="preferences-preview"]')).toContainText('25g węglowodanów');
    await expect(page.locator('[data-testid="preferences-preview"]')).toContainText('cukier');
  });
}); 