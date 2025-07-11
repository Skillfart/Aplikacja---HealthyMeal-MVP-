import { describe, it, expect } from 'vitest';

// Test walidacji formularzy - zgodny z planem testów
// Testuje walidację dla formularzy rejestracji, logowania i preferencji

// Mock funkcji walidacyjnych
const validateEmail = (email) => {
  if (!email) return 'Email jest wymagany';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Email ma nieprawidłowy format';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Hasło jest wymagane';
  if (password.length < 8) return 'Hasło musi mieć co najmniej 8 znaków';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Hasło musi zawierać małą i wielką literę oraz cyfrę';
  }
  return null;
};

const validateMaxCarbs = (maxCarbs) => {
  if (maxCarbs === null || maxCarbs === undefined) return null;
  if (maxCarbs < 0) return 'Liczba węglowodanów nie może być ujemna';
  if (maxCarbs > 300) return 'Maksymalna ilość węglowodanów nie może przekraczać 300g';
  return null;
};

const validateExcludedProducts = (products) => {
  if (!Array.isArray(products)) return 'Wykluczzone produkty muszą być tablicą';
  if (products.length > 20) return 'Maksymalnie 20 wykluczonych produktów';
  
  for (const product of products) {
    if (typeof product !== 'string') return 'Każdy produkt musi być tekstem';
    if (product.trim().length === 0) return 'Nazwa produktu nie może być pusta';
    if (product.length > 50) return 'Nazwa produktu nie może być dłuższa niż 50 znaków';
  }
  return null;
};

const validateRecipeTitle = (title) => {
  if (!title) return 'Tytuł przepisu jest wymagany';
  if (title.length < 3) return 'Tytuł musi mieć co najmniej 3 znaki';
  if (title.length > 100) return 'Tytuł nie może być dłuższy niż 100 znaków';
  return null;
};

const validateIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) return 'Składniki muszą być tablicą';
  if (ingredients.length === 0) return 'Wymagany jest co najmniej jeden składnik';
  if (ingredients.length > 50) return 'Maksymalnie 50 składników';
  
  for (const ingredient of ingredients) {
    if (!ingredient.name) return 'Nazwa składnika jest wymagana';
    if (!ingredient.quantity) return 'Ilość składnika jest wymagana';
    if (typeof ingredient.quantity !== 'number' || ingredient.quantity <= 0) {
      return 'Ilość musi być liczbą większą od 0';
    }
  }
  return null;
};

describe('🧪 Form Validation', () => {
  describe('Email Validation', () => {
    it('akceptuje prawidłowy email', () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'name.surname@company.org'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBeNull();
      });
    });

    it('odrzuca nieprawidłowy email', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        'test@',
        '@domain.com',
        'test..test@domain.com',
        'test@domain',
        'test@domain.'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBeTruthy();
      });
    });

    it('zwraca odpowiedni komunikat błędu', () => {
      expect(validateEmail('')).toBe('Email jest wymagany');
      expect(validateEmail('invalid')).toBe('Email ma nieprawidłowy format');
    });
  });

  describe('Password Validation', () => {
    it('akceptuje prawidłowe hasło', () => {
      const validPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test123Password'
      ];
      
      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBeNull();
      });
    });

    it('odrzuca hasło za krótkie', () => {
      const shortPasswords = ['', '123', 'Pass1'];
      
      shortPasswords.forEach(password => {
        expect(validatePassword(password)).toBeTruthy();
      });
    });

    it('odrzuca hasło bez wymaganych znaków', () => {
      const weakPasswords = [
        'password',         // brak wielkiej litery i cyfry
        'PASSWORD',         // brak małej litery i cyfry
        '12345678',         // brak liter
        'Password',         // brak cyfry
        'password123'       // brak wielkiej litery
      ];
      
      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBeTruthy();
      });
    });

    it('zwraca odpowiednie komunikaty błędów', () => {
      expect(validatePassword('')).toBe('Hasło jest wymagane');
      expect(validatePassword('123')).toBe('Hasło musi mieć co najmniej 8 znaków');
      expect(validatePassword('password')).toBe('Hasło musi zawierać małą i wielką literę oraz cyfrę');
    });
  });

  describe('Max Carbs Validation', () => {
    it('akceptuje prawidłowe wartości węglowodanów', () => {
      const validValues = [0, 25, 50, 100, 200, 300];
      
      validValues.forEach(value => {
        expect(validateMaxCarbs(value)).toBeNull();
      });
    });

    it('akceptuje wartości null i undefined', () => {
      expect(validateMaxCarbs(null)).toBeNull();
      expect(validateMaxCarbs(undefined)).toBeNull();
    });

    it('odrzuca wartości ujemne', () => {
      expect(validateMaxCarbs(-1)).toBe('Liczba węglowodanów nie może być ujemna');
      expect(validateMaxCarbs(-100)).toBe('Liczba węglowodanów nie może być ujemna');
    });

    it('odrzuca wartości powyżej 300', () => {
      expect(validateMaxCarbs(301)).toBe('Maksymalna ilość węglowodanów nie może przekraczać 300g');
      expect(validateMaxCarbs(500)).toBe('Maksymalna ilość węglowodanów nie może przekraczać 300g');
    });
  });

  describe('Excluded Products Validation', () => {
    it('akceptuje prawidłową listę produktów', () => {
      const validProducts = [
        [],
        ['cukier'],
        ['cukier', 'mąka', 'ryż'],
        ['produkt z długą nazwą ale nie za długą']
      ];
      
      validProducts.forEach(products => {
        expect(validateExcludedProducts(products)).toBeNull();
      });
    });

    it('odrzuca nieprawidłowy typ danych', () => {
      const invalidTypes = [null, undefined, 'string', 123, {}];
      
      invalidTypes.forEach(type => {
        expect(validateExcludedProducts(type)).toBe('Wykluczzone produkty muszą być tablicą');
      });
    });

    it('odrzuca zbyt dużą liczbę produktów', () => {
      const tooManyProducts = Array(21).fill('produkt');
      expect(validateExcludedProducts(tooManyProducts)).toBe('Maksymalnie 20 wykluczonych produktów');
    });

    it('odrzuca produkty z nieprawidłowym typem', () => {
      const invalidProducts = [123, null, undefined, {}];
      
      invalidProducts.forEach(product => {
        expect(validateExcludedProducts([product])).toBe('Każdy produkt musi być tekstem');
      });
    });

    it('odrzuca puste nazwy produktów', () => {
      const emptyProducts = ['', '   ', '\t', '\n'];
      
      emptyProducts.forEach(product => {
        expect(validateExcludedProducts([product])).toBe('Nazwa produktu nie może być pusta');
      });
    });

    it('odrzuca zbyt długie nazwy produktów', () => {
      const longProductName = 'a'.repeat(51);
      expect(validateExcludedProducts([longProductName])).toBe('Nazwa produktu nie może być dłuższa niż 50 znaków');
    });
  });

  describe('Recipe Title Validation', () => {
    it('akceptuje prawidłowe tytuły', () => {
      const validTitles = [
        'Kotlet schabowy',
        'Sałatka grecka z fetą',
        'Zupa pomidorowa z bazylią'
      ];
      
      validTitles.forEach(title => {
        expect(validateRecipeTitle(title)).toBeNull();
      });
    });

    it('odrzuca pusty tytuł', () => {
      expect(validateRecipeTitle('')).toBe('Tytuł przepisu jest wymagany');
      expect(validateRecipeTitle(null)).toBe('Tytuł przepisu jest wymagany');
      expect(validateRecipeTitle(undefined)).toBe('Tytuł przepisu jest wymagany');
    });

    it('odrzuca zbyt krótki tytuł', () => {
      expect(validateRecipeTitle('ab')).toBe('Tytuł musi mieć co najmniej 3 znaki');
    });

    it('odrzuca zbyt długi tytuł', () => {
      const longTitle = 'a'.repeat(101);
      expect(validateRecipeTitle(longTitle)).toBe('Tytuł nie może być dłuższy niż 100 znaków');
    });
  });

  describe('Ingredients Validation', () => {
    it('akceptuje prawidłowe składniki', () => {
      const validIngredients = [
        [{ name: 'Kurczak', quantity: 500, unit: 'g' }],
        [
          { name: 'Kurczak', quantity: 500, unit: 'g' },
          { name: 'Ryż', quantity: 200, unit: 'g' }
        ]
      ];
      
      validIngredients.forEach(ingredients => {
        expect(validateIngredients(ingredients)).toBeNull();
      });
    });

    it('odrzuca nieprawidłowy typ danych', () => {
      const invalidTypes = [null, undefined, 'string', 123];
      
      invalidTypes.forEach(type => {
        expect(validateIngredients(type)).toBe('Składniki muszą być tablicą');
      });
    });

    it('odrzuca pustą listę składników', () => {
      expect(validateIngredients([])).toBe('Wymagany jest co najmniej jeden składnik');
    });

    it('odrzuca zbyt dużą liczbę składników', () => {
      const tooManyIngredients = Array(51).fill({ name: 'Test', quantity: 100 });
      expect(validateIngredients(tooManyIngredients)).toBe('Maksymalnie 50 składników');
    });

    it('odrzuca składniki bez nazwy', () => {
      const ingredientsWithoutName = [{ quantity: 100 }];
      expect(validateIngredients(ingredientsWithoutName)).toBe('Nazwa składnika jest wymagana');
    });

    it('odrzuca składniki bez ilości', () => {
      const ingredientsWithoutQuantity = [{ name: 'Test' }];
      expect(validateIngredients(ingredientsWithoutQuantity)).toBe('Ilość składnika jest wymagana');
    });

    it('odrzuca składniki z nieprawidłową ilością', () => {
      const invalidQuantities = [
        [{ name: 'Test', quantity: 0 }],
        [{ name: 'Test', quantity: -1 }],
        [{ name: 'Test', quantity: 'invalid' }]
      ];
      
      invalidQuantities.forEach(ingredients => {
        expect(validateIngredients(ingredients)).toBe('Ilość musi być liczbą większą od 0');
      });
    });
  });

  describe('Complex Form Validation', () => {
    it('waliduje cały formularz rejestracji', () => {
      const registrationForm = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };
      
      const emailError = validateEmail(registrationForm.email);
      const passwordError = validatePassword(registrationForm.password);
      const confirmPasswordError = registrationForm.password !== registrationForm.confirmPassword 
        ? 'Hasła nie są zgodne' 
        : null;
      
      expect(emailError).toBeNull();
      expect(passwordError).toBeNull();
      expect(confirmPasswordError).toBeNull();
    });

    it('waliduje cały formularz preferencji', () => {
      const preferencesForm = {
        dietType: 'keto',
        maxCarbs: 25,
        excludedProducts: ['cukier', 'mąka'],
        allergens: ['gluten']
      };
      
      const maxCarbsError = validateMaxCarbs(preferencesForm.maxCarbs);
      const excludedProductsError = validateExcludedProducts(preferencesForm.excludedProducts);
      
      expect(maxCarbsError).toBeNull();
      expect(excludedProductsError).toBeNull();
    });

    it('waliduje cały formularz przepisu', () => {
      const recipeForm = {
        title: 'Kotlet schabowy',
        ingredients: [
          { name: 'Schab', quantity: 500, unit: 'g' },
          { name: 'Jajko', quantity: 1, unit: 'szt' }
        ],
        instructions: ['Rozbij schab', 'Obtocz w jajku']
      };
      
      const titleError = validateRecipeTitle(recipeForm.title);
      const ingredientsError = validateIngredients(recipeForm.ingredients);
      
      expect(titleError).toBeNull();
      expect(ingredientsError).toBeNull();
    });
  });
}); 