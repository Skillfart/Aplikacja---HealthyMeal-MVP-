// unit/utils/validators.test.js - Test walidatorów
import { describe, test, expect } from 'vitest';
import { 
  validateEmail, 
  validatePassword, 
  validateRecipe,
  validateRecipeId,
  sanitizeInput
} from '../../../backend/src/utils/validators.js';

describe('Validators', () => {
  describe('validateEmail', () => {
    test('akceptuje prawidłowy email', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('odrzuca nieprawidłowy email', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    test('akceptuje silne hasło', () => {
      const strongPasswords = [
        'Password123!',
        'StrongP@ssw0rd',
        'MySecure123$'
      ];

      strongPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    test('odrzuca słabe hasło', () => {
      const weakPasswords = [
        'short',
        'onlylowercase',
        'ONLYUPPERCASE',
        '12345678',
        'NoNumbers!',
        'nospecialchars123'
      ];

      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('validateRecipe', () => {
    const validRecipe = {
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: 'Test instructions',
      preparationTime: 30,
      difficulty: 'easy',
      servings: 4
    };

    test('akceptuje prawidłowy przepis', () => {
      expect(validateRecipe(validRecipe)).toBe(true);
    });

    test('odrzuca przepis bez tytułu', () => {
      const recipe = { ...validRecipe, title: '' };
      expect(validateRecipe(recipe)).toBe(false);
    });

    test('odrzuca przepis bez składników', () => {
      const recipe = { ...validRecipe, ingredients: [] };
      expect(validateRecipe(recipe)).toBe(false);
    });

    test('odrzuca przepis z nieprawidłowym czasem', () => {
      const recipe = { ...validRecipe, preparationTime: -5 };
      expect(validateRecipe(recipe)).toBe(false);
    });

    test('odrzuca przepis z nieprawidłową trudnością', () => {
      const recipe = { ...validRecipe, difficulty: 'invalid' };
      expect(validateRecipe(recipe)).toBe(false);
    });

    test('odrzuca przepis z nieprawidłową liczbą porcji', () => {
      const recipe = { ...validRecipe, servings: 0 };
      expect(validateRecipe(recipe)).toBe(false);
    });
  });

  describe('validateRecipeId', () => {
    test('akceptuje prawidłowy MongoDB ObjectId', () => {
      const validIds = [
        '507f1f77bcf86cd799439011',
        '507f191e810c19729de860ea',
        '000000000000000000000000'
      ];

      validIds.forEach(id => {
        expect(validateRecipeId(id)).toBe(true);
      });
    });

    test('odrzuca nieprawidłowy ObjectId', () => {
      const invalidIds = [
        'invalid-id',
        '507f1f77bcf86cd79943901',  // za krótki
        '507f1f77bcf86cd799439011x', // za długi
        '',
        null,
        undefined
      ];

      invalidIds.forEach(id => {
        expect(validateRecipeId(id)).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    test('usuwa niebezpieczne znaki HTML', () => {
      const dangerousInput = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(dangerousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    test('zachowuje bezpieczny tekst', () => {
      const safeInput = 'This is safe text with numbers 123 and symbols !@#';
      const sanitized = sanitizeInput(safeInput);
      expect(sanitized).toBe(safeInput);
    });

    test('obsługuje puste wartości', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });
}); 