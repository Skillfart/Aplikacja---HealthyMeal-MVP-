import { test, expect } from '@playwright/test';

test.describe('AI Recipe Modification Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token',
          user: {
            id: 'user123',
            email: 'test@example.com'
          }
        })
      });
    });

    await page.route('**/api/users/ai-usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current: 2,
          limit: 5,
          remaining: 3
        })
      });
    });

    await page.route('**/api/recipes**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            recipes: [
              {
                _id: 'recipe123',
                title: 'Kanapka z chleba',
                description: 'Prosta kanapka z chleba pszennego',
                ingredients: [
                  { name: 'chleb pszenny', quantity: '2', unit: 'kromki' },
                  { name: 'masło', quantity: '1', unit: 'łyżka' }
                ],
                instructions: ['Posmaruj chleb masłem', 'Podawaj od razu'],
                hashtags: ['szybkie', 'proste'],
                author: 'user123',
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      }
    });

    // Login
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display AI usage counter', async ({ page }) => {
    await page.goto('/recipes');
    
    // Check if AI usage counter is visible
    await expect(page.locator('[data-testid="ai-usage-counter"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-usage-counter"]')).toContainText('2/5');
  });

  test('should successfully modify recipe with AI', async ({ page }) => {
    // Mock successful AI modification
    await page.route('**/api/recipes/recipe123/ai-modify', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recipe: {
            _id: 'modified-recipe123',
            title: 'Bezglutenowa kanapka',
            description: 'Kanapka dostosowana do diety bezglutenowej',
            ingredients: [
              { name: 'chleb bezglutenowy', quantity: '2', unit: 'kromki' },
              { name: 'masło', quantity: '1', unit: 'łyżka' }
            ],
            instructions: ['Posmaruj chleb bezglutenowy masłem', 'Podawaj od razu'],
            hashtags: ['szybkie', 'proste', 'bezglutenowe'],
            author: 'user123',
            createdAt: new Date().toISOString()
          }
        })
      });
    });

    // Mock updated AI usage
    await page.route('**/api/users/ai-usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current: 3,
          limit: 5,
          remaining: 2
        })
      });
    });

    await page.goto('/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]');
    
    // Click on "Modyfikuj AI" button
    await page.click('[data-testid="ai-modify-button"]');
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="ai-modify-loading"]', { state: 'hidden' });
    
    // Check if modified recipe appears
    await expect(page.locator('text=Bezglutenowa kanapka')).toBeVisible();
    await expect(page.locator('text=bezglutenowe')).toBeVisible();
    
    // Check if AI usage counter is updated
    await expect(page.locator('[data-testid="ai-usage-counter"]')).toContainText('3/5');
  });

  test('should show error when AI limit is exceeded', async ({ page }) => {
    // Mock exceeded limit
    await page.route('**/api/recipes/recipe123/ai-modify', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Przekroczono dzienny limit użycia AI'
        })
      });
    });

    await page.goto('/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]');
    
    // Click on "Modyfikuj AI" button
    await page.click('[data-testid="ai-modify-button"]');
    
    // Check if error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Przekroczono dzienny limit użycia AI');
  });

  test('should disable AI modify button when limit reached', async ({ page }) => {
    // Mock max usage
    await page.route('**/api/users/ai-usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current: 5,
          limit: 5,
          remaining: 0
        })
      });
    });

    await page.goto('/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]');
    
    // Check if AI modify button is disabled
    await expect(page.locator('[data-testid="ai-modify-button"]')).toBeDisabled();
    
    // Check if usage counter shows max
    await expect(page.locator('[data-testid="ai-usage-counter"]')).toContainText('5/5');
  });

  test('should show loading state during AI modification', async ({ page }) => {
    // Mock delayed response
    await page.route('**/api/recipes/recipe123/ai-modify', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recipe: {
            _id: 'modified-recipe123',
            title: 'Bezglutenowa kanapka',
            description: 'Kanapka dostosowana do diety bezglutenowej',
            ingredients: [
              { name: 'chleb bezglutenowy', quantity: '2', unit: 'kromki' },
              { name: 'masło', quantity: '1', unit: 'łyżka' }
            ],
            instructions: ['Posmaruj chleb bezglutenowy masłem', 'Podawaj od razu'],
            hashtags: ['szybkie', 'proste', 'bezglutenowe'],
            author: 'user123',
            createdAt: new Date().toISOString()
          }
        })
      });
    });

    await page.goto('/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]');
    
    // Click on "Modyfikuj AI" button
    await page.click('[data-testid="ai-modify-button"]');
    
    // Check if loading state is shown
    await expect(page.locator('[data-testid="ai-modify-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-modify-button"]')).toBeDisabled();
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="ai-modify-loading"]', { state: 'hidden' });
    
    // Check if button is enabled again
    await expect(page.locator('[data-testid="ai-modify-button"]')).toBeEnabled();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/recipes/recipe123/ai-modify', async route => {
      await route.abort('failed');
    });

    await page.goto('/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]');
    
    // Click on "Modyfikuj AI" button
    await page.click('[data-testid="ai-modify-button"]');
    
    // Check if error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Nie udało się zmodyfikować przepisu');
  });

  test('should update recipe list after successful modification', async ({ page }) => {
    // Mock successful AI modification
    await page.route('**/api/recipes/recipe123/ai-modify', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recipe: {
            _id: 'modified-recipe123',
            title: 'Bezglutenowa kanapka',
            description: 'Kanapka dostosowana do diety bezglutenowej',
            ingredients: [
              { name: 'chleb bezglutenowy', quantity: '2', unit: 'kromki' },
              { name: 'masło', quantity: '1', unit: 'łyżka' }
            ],
            instructions: ['Posmaruj chleb bezglutenowy masłem', 'Podawaj od razu'],
            hashtags: ['szybkie', 'proste', 'bezglutenowe'],
            author: 'user123',
            createdAt: new Date().toISOString()
          }
        })
      });
    });

    await page.goto('/recipes');
    
    // Count initial recipes
    const initialRecipeCount = await page.locator('[data-testid="recipe-card"]').count();
    
    // Click on "Modyfikuj AI" button
    await page.click('[data-testid="ai-modify-button"]');
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="ai-modify-loading"]', { state: 'hidden' });
    
    // Check if a new recipe was added to the list
    const newRecipeCount = await page.locator('[data-testid="recipe-card"]').count();
    expect(newRecipeCount).toBe(initialRecipeCount + 1);
    
    // Check if the new recipe is at the top (most recent)
    const firstRecipeTitle = await page.locator('[data-testid="recipe-card"]').first().locator('h3').textContent();
    expect(firstRecipeTitle).toBe('Bezglutenowa kanapka');
  });
}); 