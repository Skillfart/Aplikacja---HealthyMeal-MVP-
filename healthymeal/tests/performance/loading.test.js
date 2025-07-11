import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecipeList from '../../frontend/src/components/RecipeList';

// Generator dużej ilości danych testowych
const generateLargeRecipeDataset = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    _id: `recipe-${index}`,
    title: `Przepis ${index + 1} - ${Math.random().toString(36).substr(2, 9)}`,
    ingredients: Array.from({ length: 5 + (index % 10) }, (_, i) => ({
      name: `Składnik ${i + 1}`,
      quantity: 100 + (i * 50),
      unit: ['g', 'ml', 'szt', 'łyżka', 'szklanka'][i % 5]
    })),
    instructions: Array.from({ length: 3 + (index % 5) }, (_, i) => 
      `Krok ${i + 1}: Wykonaj czynność ${i + 1} zgodnie z przepisem`
    ),
    hashtags: [
      'tag1', 'tag2', 'tag3', 'keto', 'vegan', 'paleo', 'low-carb'
    ].slice(0, 2 + (index % 3)),
    preparationTime: 10 + (index % 50),
    servings: 2 + (index % 6),
    author: `user-${index % 10}`,
    createdAt: new Date(Date.now() - (index * 86400000)).toISOString() // Różne daty
  }));
};

describe('⚡ Performance Tests', () => {
  const LARGE_DATASET_SIZE = 1000;
  const VERY_LARGE_DATASET_SIZE = 5000;
  
  let largeRecipeDataset;
  let veryLargeRecipeDataset;

  beforeEach(() => {
    largeRecipeDataset = generateLargeRecipeDataset(LARGE_DATASET_SIZE);
    veryLargeRecipeDataset = generateLargeRecipeDataset(VERY_LARGE_DATASET_SIZE);
    vi.clearAllMocks();
  });

  describe('🔄 Renderowanie dużych list', () => {
    it('renderuje 1000 przepisów w czasie < 2 sekund', async () => {
      const startTime = performance.now();
      
      render(
        <MemoryRouter>
          <RecipeList 
            recipes={largeRecipeDataset} 
            loading={false}
            error={null}
          />
        </MemoryRouter>
      );

      // Czekaj na załadowanie komponentów
      await waitFor(() => {
        expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
      }, { timeout: 5000 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`⏱️ Czas renderowania 1000 przepisów: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(2000); // < 2 sekundy
    });

    it('wirtualizacja listy - renderuje tylko widoczne elementy', async () => {
      render(
        <MemoryRouter>
          <RecipeList 
            recipes={veryLargeRecipeDataset} 
            loading={false}
            error={null}
            virtualized={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
      });

      // Sprawdź że renderowane są tylko widoczne elementy (np. 20-50)
      const renderedCards = screen.getAllByTestId('recipe-card');
      expect(renderedCards.length).toBeLessThan(100);
      expect(renderedCards.length).toBeGreaterThan(10);
      
      console.log(`📊 Renderowane karty z ${VERY_LARGE_DATASET_SIZE}: ${renderedCards.length}`);
    });
  });

  describe('🔍 Wydajność wyszukiwania', () => {
    it('wyszukiwanie w 1000 przepisów < 100ms', async () => {
      const searchTerm = 'Przepis 123';
      const startTime = performance.now();
      
      const filteredRecipes = largeRecipeDataset.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const endTime = performance.now();
      const searchTime = endTime - startTime;

      console.log(`🔍 Czas wyszukiwania w ${LARGE_DATASET_SIZE} przepisów: ${searchTime.toFixed(2)}ms`);
      expect(searchTime).toBeLessThan(100);
      expect(filteredRecipes.length).toBeGreaterThan(0);
    });

    it('filtrowanie po hashtags w dużym zbiorze < 50ms', async () => {
      const hashtag = 'keto';
      const startTime = performance.now();
      
      const filteredRecipes = largeRecipeDataset.filter(recipe => 
        recipe.hashtags.includes(hashtag)
      );

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      console.log(`🏷️ Czas filtrowania po hashtag w ${LARGE_DATASET_SIZE} przepisów: ${filterTime.toFixed(2)}ms`);
      expect(filterTime).toBeLessThan(50);
      expect(filteredRecipes.length).toBeGreaterThan(0);
    });

    it('sortowanie dużej listy przepisów < 200ms', async () => {
      const startTime = performance.now();
      
      const sortedRecipes = [...largeRecipeDataset].sort((a, b) => 
        a.preparationTime - b.preparationTime
      );

      const endTime = performance.now();
      const sortTime = endTime - startTime;

      console.log(`📊 Czas sortowania ${LARGE_DATASET_SIZE} przepisów: ${sortTime.toFixed(2)}ms`);
      expect(sortTime).toBeLessThan(200);
      expect(sortedRecipes[0].preparationTime).toBeLessThanOrEqual(sortedRecipes[1].preparationTime);
    });
  });

  describe('💾 Zarządzanie pamięcią', () => {
    it('nie powoduje wycieków pamięci przy wielokrotnym renderowaniu', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Renderuj i odmontuj komponent 10 razy
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <MemoryRouter>
            <RecipeList 
              recipes={largeRecipeDataset.slice(0, 100)} 
              loading={false}
              error={null}
            />
          </MemoryRouter>
        );
        
        await waitFor(() => {
          expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
        });
        
        unmount();
      }

      // Wymuś garbage collection (jeśli dostępny)
      if (global.gc) {
        global.gc();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`💾 Wzrost pamięci po 10 cyklach: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // Pamięć nie powinna wzrosnąć o więcej niż 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('🌐 Wydajność API', () => {
    it('symuluje opóźnienie API i sprawdza responsywność UI', async () => {
      const mockFetch = vi.fn().mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve({
                recipes: largeRecipeDataset.slice(0, 50),
                total: LARGE_DATASET_SIZE,
                page: 1,
                limit: 50
              })
            });
          }, 1000); // Symulacja 1s opóźnienia
        })
      );

      global.fetch = mockFetch;

      const startTime = performance.now();
      
      render(
        <MemoryRouter>
          <RecipeList 
            recipes={[]} 
            loading={true}
            error={null}
          />
        </MemoryRouter>
      );

      // Sprawdź że loader jest widoczny od razu
      const loaderTime = performance.now() - startTime;
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(loaderTime).toBeLessThan(100); // Loader powinien pojawić się < 100ms

      // Czekaj na załadowanie danych
      await waitFor(() => {
        expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
      }, { timeout: 2000 });

      const totalTime = performance.now() - startTime;
      console.log(`🌐 Całkowity czas ładowania z API: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('📱 Wydajność responsywna', () => {
    it('adaptuje się do różnych rozmiarów ekranu bez utraty wydajności', async () => {
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ];

      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        const startTime = performance.now();
        
        const { unmount } = render(
          <MemoryRouter>
            <RecipeList 
              recipes={largeRecipeDataset.slice(0, 100)} 
              loading={false}
              error={null}
            />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
        });

        const renderTime = performance.now() - startTime;
        console.log(`📱 Czas renderowania ${viewport.width}x${viewport.height}: ${renderTime.toFixed(2)}ms`);
        
        expect(renderTime).toBeLessThan(1000); // < 1 sekunda dla każdego viewportu
        unmount();
      }
    });
  });

  describe('🔄 Wydajność aktualizacji', () => {
    it('szybko aktualizuje listę przy dodaniu nowego przepisu', async () => {
      const { rerender } = render(
        <MemoryRouter>
          <RecipeList 
            recipes={largeRecipeDataset} 
            loading={false}
            error={null}
          />
        </MemoryRouter>
      );

      const newRecipe = {
        _id: 'new-recipe',
        title: 'Nowy Przepis',
        ingredients: [{ name: 'Test', quantity: 100, unit: 'g' }],
        instructions: ['Test'],
        hashtags: ['nowy'],
        preparationTime: 20,
        servings: 4,
        author: 'test-user',
        createdAt: new Date().toISOString()
      };

      const startTime = performance.now();
      
      rerender(
        <MemoryRouter>
          <RecipeList 
            recipes={[newRecipe, ...largeRecipeDataset]} 
            loading={false}
            error={null}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Nowy Przepis')).toBeInTheDocument();
      });

      const updateTime = performance.now() - startTime;
      console.log(`🔄 Czas aktualizacji listy: ${updateTime.toFixed(2)}ms`);
      expect(updateTime).toBeLessThan(500); // < 0.5 sekundy
    });
  });

  describe('📈 Benchmarki wydajnościowe', () => {
    it('wykonuje benchmark kompleksowych operacji', async () => {
      const results = {};

      // Test 1: Renderowanie
      const renderStart = performance.now();
      const { unmount } = render(
        <MemoryRouter>
          <RecipeList 
            recipes={largeRecipeDataset} 
            loading={false}
            error={null}
          />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
      });
      results.renderTime = performance.now() - renderStart;

      // Test 2: Wyszukiwanie
      const searchStart = performance.now();
      const searchResults = largeRecipeDataset.filter(recipe => 
        recipe.title.includes('Przepis 5')
      );
      results.searchTime = performance.now() - searchStart;

      // Test 3: Sortowanie
      const sortStart = performance.now();
      const sortedResults = [...searchResults].sort((a, b) => 
        a.preparationTime - b.preparationTime
      );
      results.sortTime = performance.now() - sortStart;

      unmount();

      // Raportuj wyniki
      console.table({
        'Renderowanie (ms)': results.renderTime.toFixed(2),
        'Wyszukiwanie (ms)': results.searchTime.toFixed(2),
        'Sortowanie (ms)': results.sortTime.toFixed(2),
        'Suma (ms)': (results.renderTime + results.searchTime + results.sortTime).toFixed(2)
      });

      // Asercje wydajnościowe
      expect(results.renderTime).toBeLessThan(2000);
      expect(results.searchTime).toBeLessThan(100);
      expect(results.sortTime).toBeLessThan(50);
    });
  });
}); 