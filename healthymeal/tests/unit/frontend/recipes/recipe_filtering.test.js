import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterRecipes, searchRecipes } from '@frontend/utils/recipeFilters';

describe('Recipe Filtering Tests', () => {
  let recipesData;

  beforeEach(() => {
    // Przygotowanie danych testowych
    recipesData = [
      {
        id: '1',
        title: 'Placki kokosowe',
        tags: ['śniadanie', 'deser', 'niskowęglowodanowy'],
        preparationTime: 15,
        difficulty: 'łatwy',
        nutritionalValues: {
          carbsPerServing: 5
        }
      },
      {
        id: '2',
        title: 'Sałatka z awokado',
        tags: ['obiad', 'wegański', 'keto'],
        preparationTime: 10,
        difficulty: 'łatwy',
        nutritionalValues: {
          carbsPerServing: 3
        }
      },
      {
        id: '3',
        title: 'Curry z kurczakiem',
        tags: ['obiad', 'paleo'],
        preparationTime: 30,
        difficulty: 'średni',
        nutritionalValues: {
          carbsPerServing: 12
        }
      },
    ];
  });

  describe('filterRecipes', () => {
    it('powinno zwrócić wszystkie przepisy, gdy nie podano filtrów', () => {
      const result = filterRecipes(recipesData, {});
      expect(result).toHaveLength(3);
    });

    it('powinno filtrować po tagach', () => {
      const result = filterRecipes(recipesData, { tags: ['obiad'] });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });

    it('powinno filtrować po trudności', () => {
      const result = filterRecipes(recipesData, { difficulty: 'łatwy' });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('powinno filtrować po czasie przygotowania', () => {
      const result = filterRecipes(recipesData, { maxPreparationTime: 20 });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('powinno filtrować po zawartości węglowodanów', () => {
      const result = filterRecipes(recipesData, { maxCarbs: 6 });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('powinno łączyć wiele filtrów (AND)', () => {
      const result = filterRecipes(recipesData, { 
        tags: ['obiad'], 
        difficulty: 'łatwy',
        maxCarbs: 6
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('searchRecipes', () => {
    it('powinno wyszukiwać przepisy po frazie w tytule', () => {
      const result = searchRecipes(recipesData, 'placki');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('powinno wyszukiwać przepisy po częściowej frazie', () => {
      const result = searchRecipes(recipesData, 'kok');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('powinno ignorować wielkość liter podczas wyszukiwania', () => {
      const result = searchRecipes(recipesData, 'CURRY');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('powinno zwracać wszystkie przepisy dla pustego zapytania', () => {
      const result = searchRecipes(recipesData, '');
      expect(result).toHaveLength(3);
    });

    it('powinno zwracać pusty wynik dla niematczujących zapytań', () => {
      const result = searchRecipes(recipesData, 'pizza');
      expect(result).toHaveLength(0);
    });
  });
}); 