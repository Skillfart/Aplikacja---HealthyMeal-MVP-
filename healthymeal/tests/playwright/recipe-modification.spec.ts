import { test, expect } from '@playwright/test'

test.describe('Recipe Modification', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie przed każdym testem
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'testpass123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should modify recipe using AI', async ({ page }) => {
    // Przejście do przepisu
    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    // Kliknięcie przycisku modyfikacji
    await page.click('button:has-text("Modyfikuj przez AI")')
    await page.waitForSelector('textarea[name="modifications"]')

    // Wprowadzenie modyfikacji
    await page.fill('textarea[name="modifications"]', 'Zmniejsz ilość soli i dodaj więcej warzyw')
    await page.click('button:has-text("Zastosuj zmiany")')

    // Sprawdzenie komunikatu sukcesu
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message')).toContainText('Przepis został zmodyfikowany')

    // Sprawdzenie czy zmiany zostały zastosowane
    await expect(page.locator('.recipe-content')).toContainText('Zmodyfikowany przepis')
  })

  test('should show error for invalid modifications', async ({ page }) => {
    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    await page.click('button:has-text("Modyfikuj przez AI")')
    await page.waitForSelector('textarea[name="modifications"]')

    // Próba modyfikacji bez wprowadzenia zmian
    await page.click('button:has-text("Zastosuj zmiany")')

    // Sprawdzenie komunikatu błędu
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Wprowadź modyfikacje')
  })

  test('should cancel modification', async ({ page }) => {
    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    await page.click('button:has-text("Modyfikuj przez AI")')
    await page.waitForSelector('textarea[name="modifications"]')

    // Wprowadzenie modyfikacji
    await page.fill('textarea[name="modifications"]', 'Zmniejsz ilość soli')
    
    // Anulowanie modyfikacji
    await page.click('button:has-text("Anuluj")')

    // Sprawdzenie czy wróciliśmy do oryginalnego przepisu
    await expect(page.locator('button:has-text("Modyfikuj przez AI")')).toBeVisible()
    await expect(page.locator('textarea[name="modifications"]')).not.toBeVisible()
  })

  test('should show loading state during modification', async ({ page }) => {
    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    await page.click('button:has-text("Modyfikuj przez AI")')
    await page.waitForSelector('textarea[name="modifications"]')

    // Wprowadzenie modyfikacji
    await page.fill('textarea[name="modifications"]', 'Zmniejsz ilość soli')
    await page.click('button:has-text("Zastosuj zmiany")')

    // Sprawdzenie stanu ładowania
    await expect(page.locator('.loading-spinner')).toBeVisible()
    await expect(page.locator('button:has-text("Zastosuj zmiany")')).toBeDisabled()

    // Poczekaj na zakończenie modyfikacji
    await expect(page.locator('.loading-spinner')).not.toBeVisible()
  })

  test('should handle network error during modification', async ({ page }) => {
    // Symulacja błędu sieci
    await page.route('**/api/recipes/*/modify', route => route.abort())

    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    await page.click('button:has-text("Modyfikuj przez AI")')
    await page.waitForSelector('textarea[name="modifications"]')

    await page.fill('textarea[name="modifications"]', 'Zmniejsz ilość soli')
    await page.click('button:has-text("Zastosuj zmiany")')

    // Sprawdzenie komunikatu błędu
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Wystąpił błąd podczas modyfikacji przepisu')
  })

  test('should show modification history', async ({ page }) => {
    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    // Sprawdzenie czy historia modyfikacji jest widoczna
    await expect(page.locator('.modification-history')).toBeVisible()
    
    // Sprawdzenie czy lista modyfikacji jest wyświetlana
    const modifications = await page.locator('.modification-history li').all()
    expect(modifications.length).toBeGreaterThan(0)
  })

  test('should restore previous version', async ({ page }) => {
    await page.goto('/recipes/1')
    await page.waitForSelector('h1')

    // Kliknięcie przycisku przywracania
    await page.click('button:has-text("Przywróć poprzednią wersję")')
    
    // Potwierdzenie przywrócenia
    await page.click('button:has-text("Potwierdź")')

    // Sprawdzenie komunikatu sukcesu
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message')).toContainText('Przywrócono poprzednią wersję')
  })
}) 