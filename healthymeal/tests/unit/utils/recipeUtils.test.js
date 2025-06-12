import {
  parseIngredients,
  formatInstructions,
  validateRecipe,
  parseHashtags
} from '../../../src/utils/recipeUtils';

describe('recipeUtils', () => {
  describe('parseIngredients', () => {
    test('parsuje poprawnie listę składników', () => {
      const input = ['2 łyżki cukru', '1 kg mąki', '3 jajka'];
      const expected = [
        { quantity: 2, unit: 'łyżki', name: 'cukru' },
        { quantity: 1, unit: 'kg', name: 'mąki' },
        { quantity: 3, unit: 'szt', name: 'jajka' }
      ];

      expect(parseIngredients(input)).toEqual(expected);
    });

    test('obsługuje brak jednostki', () => {
      const input = ['2 jajka', '1 cebula'];
      const expected = [
        { quantity: 2, unit: 'szt', name: 'jajka' },
        { quantity: 1, unit: 'szt', name: 'cebula' }
      ];

      expect(parseIngredients(input)).toEqual(expected);
    });

    test('obsługuje niepoprawny format', () => {
      const input = ['niepoprawny format'];
      expect(() => parseIngredients(input)).toThrow();
    });
  });

  describe('formatInstructions', () => {
    test('formatuje instrukcje jako numerowaną listę', () => {
      const input = ['Zagotuj wodę', 'Dodaj makaron', 'Wymieszaj'];
      const expected = '1. Zagotuj wodę\n2. Dodaj makaron\n3. Wymieszaj';

      expect(formatInstructions(input)).toBe(expected);
    });

    test('obsługuje pojedynczą instrukcję', () => {
      const input = ['Zagotuj wodę'];
      const expected = '1. Zagotuj wodę';

      expect(formatInstructions(input)).toBe(expected);
    });

    test('usuwa puste instrukcje', () => {
      const input = ['Zagotuj wodę', '', 'Wymieszaj'];
      const expected = '1. Zagotuj wodę\n2. Wymieszaj';

      expect(formatInstructions(input)).toBe(expected);
    });
  });

  describe('validateRecipe', () => {
    const validRecipe = {
      title: 'Test Recipe',
      ingredients: ['2 łyżki cukru', '1 kg mąki'],
      instructions: ['Krok 1', 'Krok 2'],
      hashtags: ['healthy', 'quick']
    };

    test('akceptuje poprawny przepis', () => {
      expect(() => validateRecipe(validRecipe)).not.toThrow();
    });

    test('wymaga tytułu', () => {
      const recipe = { ...validRecipe, title: '' };
      expect(() => validateRecipe(recipe)).toThrow('Tytuł jest wymagany');
    });

    test('wymaga składników', () => {
      const recipe = { ...validRecipe, ingredients: [] };
      expect(() => validateRecipe(recipe)).toThrow('Wymagany jest co najmniej jeden składnik');
    });

    test('wymaga instrukcji', () => {
      const recipe = { ...validRecipe, instructions: [] };
      expect(() => validateRecipe(recipe)).toThrow('Wymagana jest co najmniej jedna instrukcja');
    });

    test('waliduje format składników', () => {
      const recipe = { ...validRecipe, ingredients: ['niepoprawny format'] };
      expect(() => validateRecipe(recipe)).toThrow('Niepoprawny format składnika');
    });
  });

  describe('parseHashtags', () => {
    test('parsuje hashtagi z tekstu', () => {
      const input = 'Test #healthy #quick recipe';
      const expected = ['healthy', 'quick'];

      expect(parseHashtags(input)).toEqual(expected);
    });

    test('usuwa duplikaty', () => {
      const input = 'Test #healthy #quick #healthy recipe';
      const expected = ['healthy', 'quick'];

      expect(parseHashtags(input)).toEqual(expected);
    });

    test('ignoruje niepoprawne hashtagi', () => {
      const input = 'Test #healthy # #123 #quick# recipe';
      const expected = ['healthy', 'quick'];

      expect(parseHashtags(input)).toEqual(expected);
    });

    test('zwraca pustą tablicę dla tekstu bez hashtagów', () => {
      const input = 'Test recipe';
      expect(parseHashtags(input)).toEqual([]);
    });

    test('obsługuje hashtagi z polskimi znakami', () => {
      const input = 'Test #zdrowe #szybkie #łatwe';
      const expected = ['zdrowe', 'szybkie', 'łatwe'];

      expect(parseHashtags(input)).toEqual(expected);
    });
  });
}); 