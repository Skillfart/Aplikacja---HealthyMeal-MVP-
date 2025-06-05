import { test, expect } from '@playwright/test'

test.describe('Preferences Management', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie przed każdym testem
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'testpass123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should save dietary preferences', async ({ page }) => {
    await page.goto('/preferences')
    await page.waitForSelector('h1')

    // Wybór alergii
    await page.check('input[name="allergies"][value="nuts"]')
    await page.check('input[name="allergies"][value="lactose"]')

    // Wybór ograniczeń dietetycznych
    await page.check('input[name="dietaryRestrictions"][value="vegetarian"]')

    // Wybór ulubionych kuchni
    await page.check('input[name="favoriteCuisines"][value="italian"]')
    await page.check('input[name="favoriteCuisines"][value="mexican"]')

    // Dodanie niechcianych składników
    await page.fill('input[name="dislikedIngredients"]', 'Cebula')
    await page.press('input[name="dislikedIngredients"]', 'Enter')
    await page.fill('input[name="dislikedIngredients"]', 'Czosnek')
    await page.press('input[name="dislikedIngredients"]', 'Enter')

    // Wybór poziomu umiejętności kulinarnych
    await page.selectOption('select[name="cookingSkillLevel"]', 'intermediate')

    // Wybór preferowanego czasu gotowania
    await page.selectOption('select[name="cookingTimePreference"]', '30-60')

    // Wybór preferowanej wielkości posiłku
    await page.selectOption('select[name="mealSizePreference"]', 'medium')

    // Wybór preferowanego poziomu ostrości
    await page.selectOption('select[name="spiceLevelPreference"]', 'medium')

    // Zapisywanie preferencji
    await page.click('button:has-text("Zapisz preferencje")')

    // Sprawdzenie komunikatu sukcesu
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message')).toContainText('Preferencje zostały zapisane')
  })

  test('should show error for invalid preferences', async ({ page }) => {
    await page.goto('/preferences')
    await page.waitForSelector('h1')

    // Próba zapisania bez wybrania żadnych preferencji
    await page.click('button:has-text("Zapisz preferencje")')

    // Sprawdzenie komunikatu błędu
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Wybierz przynajmniej jedną preferencję')
  })

  test('should remove disliked ingredient', async ({ page }) => {
    await page.goto('/preferences')
    await page.waitForSelector('h1')

    // Dodanie składnika
    await page.fill('input[name="dislikedIngredients"]', 'Cebula')
    await page.press('input[name="dislikedIngredients"]', 'Enter')

    // Usunięcie składnika
    await page.click('button:has-text("Usuń")')

    // Sprawdzenie czy składnik został usunięty
    await expect(page.locator('text=Cebula')).not.toBeVisible()
  })

  test('should handle network error during save', async ({ page }) => {
    // Symulacja błędu sieci
    await page.route('**/api/preferences', route => route.abort())

    await page.goto('/preferences')
    await page.waitForSelector('h1')

    // Wybór preferencji
    await page.check('input[name="allergies"][value="nuts"]')
    await page.click('button:has-text("Zapisz preferencje")')

    // Sprawdzenie komunikatu błędu
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Wystąpił błąd podczas zapisywania preferencji')
  })

  test('should show loading state during save', async ({ page }) => {
    await page.goto('/preferences')
    await page.waitForSelector('h1')

    // Wybór preferencji
    await page.check('input[name="allergies"][value="nuts"]')
    await page.click('button:has-text("Zapisz preferencje")')

    // Sprawdzenie stanu ładowania
    await expect(page.locator('.loading-spinner')).toBeVisible()
    await expect(page.locator('button:has-text("Zapisz preferencje")')).toBeDisabled()

    // Poczekaj na zakończenie zapisywania
    await expect(page.locator('.loading-spinner')).not.toBeVisible()
  })

  test('should reset preferences', async ({ page }) => {
    await page.goto('/preferences')
    await page.waitForSelector('h1')

    // Wybór preferencji
    await page.check('input[name="allergies"][value="nuts"]')
    await page.check('input[name="dietaryRestrictions"][value="vegetarian"]')

    // Resetowanie preferencji
    await page.click('button:has-text("Resetuj preferencje")')
    await page.click('button:has-text("Potwierdź")')

    // Sprawdzenie czy preferencje zostały zresetowane
    await expect(page.locator('input[name="allergies"][value="nuts"]')).not.toBeChecked()
    await expect(page.locator('input[name="dietaryRestrictions"][value="vegetarian"]')).not.toBeChecked()
  })

  test('should show preferences in recipe recommendations', async ({ page }) => {
    // Zapisywanie preferencji
    await page.goto('/preferences')
    await page.waitForSelector('h1')
    await page.check('input[name="allergies"][value="nuts"]')
    await page.check('input[name="dietaryRestrictions"][value="vegetarian"]')
    await page.click('button:has-text("Zapisz preferencje")')

    // Przejście do rekomendacji
    await page.goto('/recommendations')
    await page.waitForSelector('h1')

    // Sprawdzenie czy rekomendacje uwzględniają preferencje
    const recipes = await page.locator('.recipe-card').all()
    for (const recipe of recipes) {
      await expect(recipe).not.toContainText('Orzechy')
      await expect(recipe).toContainText('Wegetariański')
    }
  })
}) 