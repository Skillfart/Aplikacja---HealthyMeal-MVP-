import { describe, it, expect } from 'vitest';
import {
  calculateTotalTime,
  formatCookingTime,
  formatIngredients,
  calculateNutritionalValuesPerServing,
  assessRecipeDifficulty,
  validateRecipe
} from '../../../frontend/src/utils/recipeUtils';

describe('Recipe Utility Functions', () => {
  
  describe('calculateTotalTime', () => {
    it('powinien poprawnie sumować czas przygotowania i gotowania', () => {
      const result = calculateTotalTime(15, 30);
      expect(result).toBe(45);
    });

    it('powinien obsługiwać wartości undefined i null', () => {
      expect(calculateTotalTime(undefined, 30)).toBe(30);
      expect(calculateTotalTime(15, null)).toBe(15);
      expect(calculateTotalTime(null, undefined)).toBe(0);
    });

    it('powinien konwertować wartości tekstowe na liczby', () => {
      expect(calculateTotalTime('15', '30')).toBe(45);
      expect(calculateTotalTime('15', 30)).toBe(45);
    });
  });

  describe('formatCookingTime', () => {
    it('powinien formatować minuty na odpowiedni format czasowy', () => {
      expect(formatCookingTime(75)).toBe('1h 15min');
      expect(formatCookingTime(60)).toBe('1h');
      expect(formatCookingTime(45)).toBe('45min');
    });

    it('powinien obsługiwać wartości edge cases', () => {
      expect(formatCookingTime(0)).toBe('0min');
      expect(formatCookingTime()).toBe('0min');
      expect(formatCookingTime(null)).toBe('0min');
      expect(formatCookingTime(undefined)).toBe('0min');
    });
  });

  describe('formatIngredients', () => {
    it('powinien formatować składniki do odpowiedniego formatu', () => {
      const ingredients = [
        { name: 'mąka', amount: 200, unit: 'g' },
        { name: 'jajka', amount: 2, unit: 'szt' },
        { name: 'mleko', amount: 0.5, unit: 'l' }
      ];
      
      const expected = [
        '200g mąka',
        '2szt jajka',
        '0.5l mleko'
      ];
      
      expect(formatIngredients(ingredients)).toEqual(expected);
    });

    it('powinien obsługiwać brakujące pola', () => {
      const ingredients = [
        { name: 'mąka', amount: 200 },
        { name: 'jajka' },
        { amount: 0.5, unit: 'l' }
      ];
      
      const expected = [
        '200 mąka',
        'jajka',
        '0.5l '
      ];
      
      expect(formatIngredients(ingredients)).toEqual(expected);
    });

    it('powinien zwracać pustą tablicę dla nieprawidłowych danych', () => {
      expect(formatIngredients()).toEqual([]);
      expect(formatIngredients(null)).toEqual([]);
      expect(formatIngredients([])).toEqual([]);
      expect(formatIngredients('string')).toEqual([]);
      expect(formatIngredients(123)).toEqual([]);
    });
  });

  describe('calculateNutritionalValuesPerServing', () => {
    it('powinien poprawnie dzielić wartości odżywcze przez liczbę porcji', () => {
      const nutritionalValues = {
        calories: 1000,
        protein: 50,
        fat: 30,
        carbs: 120
      };
      
      const expected = {
        calories: 250,
        protein: 12.5,
        fat: 7.5,
        carbs: 30
      };
      
      expect(calculateNutritionalValuesPerServing(nutritionalValues, 4)).toEqual(expected);
    });

    it('powinien zaokrąglać wartości do 1 miejsca po przecinku', () => {
      const nutritionalValues = {
        calories: 1000,
        protein: 50,
        fat: 33.333,
        carbs: 120
      };
      
      const expected = {
        calories: 333.3,
        protein: 16.7,
        fat: 11.1,
        carbs: 40
      };
      
      expect(calculateNutritionalValuesPerServing(nutritionalValues, 3)).toEqual(expected);
    });

    it('powinien obsługiwać nieprawidłowe dane wejściowe', () => {
      expect(calculateNutritionalValuesPerServing(null, 4)).toEqual({});
      expect(calculateNutritionalValuesPerServing({}, 4)).toEqual({});
      expect(calculateNutritionalValuesPerServing({ calories: 1000 }, 0)).toEqual({ calories: 0 });
      expect(calculateNutritionalValuesPerServing({ calories: 1000 }, null)).toEqual({ calories: 0 });
    });
  });

  describe('assessRecipeDifficulty', () => {
    it('powinien oceniać przepis jako łatwy dla prostych przepisów', () => {
      const recipe = {
        ingredients: [{ name: 'mąka' }, { name: 'jajka' }, { name: 'mleko' }],
        steps: ['Wymieszaj składniki', 'Upiecz'],
        prepTime: 10,
        cookTime: 15
      };
      
      expect(assessRecipeDifficulty(recipe)).toBe('easy');
    });

    it('powinien oceniać przepis jako trudny dla skomplikowanych przepisów', () => {
      const recipe = {
        ingredients: Array(15).fill({ name: 'składnik' }),
        steps: Array(10).fill('krok'),
        prepTime: 45,
        cookTime: 90
      };
      
      expect(assessRecipeDifficulty(recipe)).toBe('hard');
    });

    it('powinien oceniać przepis jako średni dla przepisów pomiędzy', () => {
      const recipe = {
        ingredients: Array(7).fill({ name: 'składnik' }),
        steps: Array(5).fill('krok'),
        prepTime: 20,
        cookTime: 40
      };
      
      expect(assessRecipeDifficulty(recipe)).toBe('medium');
    });

    it('powinien obsługiwać nieprawidłowe dane wejściowe', () => {
      expect(assessRecipeDifficulty(null)).toBe('easy');
      expect(assessRecipeDifficulty({})).toBe('easy');
      expect(assessRecipeDifficulty({ ingredients: [], steps: [] })).toBe('easy');
    });
  });

  describe('validateRecipe', () => {
    it('powinien uznać prawidłowy przepis za poprawny', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [{ name: 'mąka', amount: 200, unit: 'g' }],
        steps: ['Wymieszaj składniki', 'Upiecz'],
        servings: 4,
        prepTime: 15,
        cookTime: 30
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('powinien wykrywać brak tytułu', () => {
      const recipe = {
        ingredients: [{ name: 'mąka', amount: 200, unit: 'g' }],
        steps: ['Wymieszaj składniki', 'Upiecz'],
        servings: 4
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tytuł jest wymagany');
    });

    it('powinien wykrywać brak składników', () => {
      const recipe = {
        title: 'Test Recipe',
        steps: ['Wymieszaj składniki', 'Upiecz'],
        servings: 4
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Składniki są wymagane');
    });

    it('powinien wykrywać nieprawidłowe składniki', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: 'mąka, jajka, mleko',
        steps: ['Wymieszaj składniki', 'Upiecz'],
        servings: 4
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Składniki muszą być listą');
    });

    it('powinien wykrywać brak kroków', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [{ name: 'mąka', amount: 200, unit: 'g' }],
        servings: 4
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Kroki przygotowania są wymagane');
    });

    it('powinien wykrywać nieprawidłowe kroki', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [{ name: 'mąka', amount: 200, unit: 'g' }],
        steps: 'Wymieszaj składniki i upiecz',
        servings: 4
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Kroki muszą być listą');
    });

    it('powinien wykrywać nieprawidłową liczbę porcji', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [{ name: 'mąka', amount: 200, unit: 'g' }],
        steps: ['Wymieszaj składniki', 'Upiecz'],
        servings: 'cztery'
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Liczba porcji musi być liczbą');
    });

    it('powinien wykrywać wiele błędów jednocześnie', () => {
      const recipe = {
        ingredients: 'mąka, jajka, mleko',
        steps: 'Wymieszaj składniki i upiecz',
        servings: 'cztery'
      };
      
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
}); 