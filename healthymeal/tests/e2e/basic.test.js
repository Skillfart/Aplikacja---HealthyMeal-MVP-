import { test, expect } from '@playwright/test';

test('podstawowa nawigacja', async ({ page }) => {
  await page.goto('/');
  
  // Sprawdź tytuł strony
  await expect(page).toHaveTitle(/HealthyMeal/);
  
  // Sprawdź główne elementy nawigacji
  await expect(page.getByRole('link', { name: 'Przepisy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Planer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Profil' })).toBeVisible();
});