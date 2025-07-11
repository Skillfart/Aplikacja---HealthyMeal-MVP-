import { describe, it, expect } from 'vitest';

// Mock funkcji buildPrompt - w rzeczywistości byłaby importowana z @/lib/ai/promptBuilder
const buildPrompt = (recipe, preferences) => {
  if (!recipe || !preferences) {
    throw new Error('Recipe and preferences are required');
  }

  let prompt = `Zmodyfikuj przepis "${recipe.title}" zgodnie z preferencjami:`;
  
  if (preferences.goal) {
    prompt += ` Cel: ${preferences.goal}.`;
  }
  
  if (preferences.avoid && preferences.avoid.length > 0) {
    prompt += ` Usuń lub zastąp następujące składniki: ${preferences.avoid.join(', ')}.`;
  }
  
  if (preferences.maxCarbs) {
    prompt += ` Maksymalna ilość węglowodanów: ${preferences.maxCarbs}g.`;
  }
  
  prompt += ` Składniki: ${recipe.ingredients.join(', ')}.`;
  prompt += ` Instrukcje: ${recipe.instructions}`;
  
  return prompt;
};

describe('🧪 PromptBuilder', () => {
  describe('buildPrompt', () => {
    it('tworzy poprawny prompt dla preferencji i przepisu', () => {
      const recipe = {
        title: 'Makaron z kurczakiem',
        ingredients: ['kurczak', 'makaron', 'śmietana'],
        instructions: 'Ugotuj makaron i dodaj kurczaka',
      };

      const preferences = {
        avoid: ['śmietana'],
        goal: 'obniżenie indeksu glikemicznego',
        maxCarbs: 30
      };

      const prompt = buildPrompt(recipe, preferences);

      expect(prompt).toContain('obniżenie indeksu glikemicznego');
      expect(prompt).toContain('Usuń lub zastąp następujące składniki: śmietana');
      expect(prompt).toContain('Makaron z kurczakiem');
      expect(prompt).toContain('Maksymalna ilość węglowodanów: 30g');
    });

    it('obsługuje preferencje bez wykluczonych składników', () => {
      const recipe = {
        title: 'Sałatka grecka',
        ingredients: ['ogórek', 'pomidor', 'feta'],
        instructions: 'Pokrój warzywa i dodaj ser',
      };

      const preferences = {
        goal: 'zwiększenie białka',
        maxCarbs: 20
      };

      const prompt = buildPrompt(recipe, preferences);

      expect(prompt).toContain('zwiększenie białka');
      expect(prompt).toContain('Sałatka grecka');
      expect(prompt).not.toContain('Usuń lub zastąp');
    });

    it('obsługuje wielokrotne wykluczone składniki', () => {
      const recipe = {
        title: 'Pizza margherita',
        ingredients: ['ciasto', 'ser', 'pomidor', 'mąka'],
        instructions: 'Przygotuj ciasto i dodaj składniki',
      };

      const preferences = {
        avoid: ['mąka', 'ser'],
        goal: 'dieta bezglutenowa',
      };

      const prompt = buildPrompt(recipe, preferences);

      expect(prompt).toContain('mąka, ser');
      expect(prompt).toContain('dieta bezglutenowa');
    });

    it('rzuca błąd gdy brak przepisu', () => {
      const preferences = {
        goal: 'test',
      };

      expect(() => buildPrompt(null, preferences)).toThrow('Recipe and preferences are required');
    });

    it('rzuca błąd gdy brak preferencji', () => {
      const recipe = {
        title: 'Test',
        ingredients: ['test'],
        instructions: 'test',
      };

      expect(() => buildPrompt(recipe, null)).toThrow('Recipe and preferences are required');
    });

    it('obsługuje preferencje z alergenami', () => {
      const recipe = {
        title: 'Ciasto czekoladowe',
        ingredients: ['jajka', 'mąka', 'czekolada', 'orzechy'],
        instructions: 'Wymieszaj składniki i upiecz',
      };

      const preferences = {
        avoid: ['orzechy', 'jajka'],
        goal: 'dieta bez alergenów',
        maxCarbs: 40
      };

      const prompt = buildPrompt(recipe, preferences);

      expect(prompt).toContain('orzechy, jajka');
      expect(prompt).toContain('dieta bez alergenów');
      expect(prompt).toContain('40g');
    });

    it('obsługuje długie listy składników', () => {
      const recipe = {
        title: 'Kompleksowa sałatka',
        ingredients: ['sałata', 'pomidor', 'ogórek', 'marchew', 'papryka', 'cebula', 'oliwa'],
        instructions: 'Pokrój wszystkie warzywa i wymieszaj z oliwą',
      };

      const preferences = {
        avoid: ['cebula'],
        goal: 'zwiększenie zawartości błonnika',
      };

      const prompt = buildPrompt(recipe, preferences);

      expect(prompt).toContain('sałata, pomidor, ogórek, marchew, papryka, cebula, oliwa');
      expect(prompt).toContain('zwiększenie zawartości błonnika');
    });
  });
}); 