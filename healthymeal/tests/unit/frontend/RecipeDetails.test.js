// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeDetails from '@components/recipes/RecipeDetails';
import { useAuth } from '@contexts/AuthContext';
import { getRecipe, addToFavorites, removeFromFavorites } from '@services/recipeService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu przepisów
vi.mock('@services/recipeService', () => ({
  getRecipe: vi.fn(),
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
}));

describe('RecipeDetails Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockRecipe = {
    id: '1',
    name: 'Spaghetti Bolognese',
    description: 'Klasyczny włoski makaron z sosem mięsnym',
    ingredients: [
      { name: 'makaron spaghetti', amount: 500, unit: 'g' },
      { name: 'mięso mielone', amount: 400, unit: 'g' },
      { name: 'pomidory w puszce', amount: 2, unit: 'puszki' },
      { name: 'cebula', amount: 1, unit: 'szt' },
      { name: 'czosnek', amount: 2, unit: 'ząbki' },
      { name: 'oliwa z oliwek', amount: 2, unit: 'łyżki' },
      { name: 'sól', amount: 1, unit: 'łyżeczka' },
      { name: 'pieprz', amount: 1, unit: 'łyżeczka' },
      { name: 'bazylia', amount: 1, unit: 'łyżka' }
    ],
    instructions: [
      'Ugotuj makaron zgodnie z instrukcją na opakowaniu.',
      'Na oliwie z oliwek podsmaż pokrojoną cebulę i czosnek.',
      'Dodaj mięso mielone i smaż aż się zrumieni.',
      'Dodaj pomidory z puszki, sól, pieprz i bazylię.',
      'Dusź sos na małym ogniu przez 20 minut.',
      'Połącz makaron z sosem i podawaj.'
    ],
    preparationTime: 30,
    cookingTime: 45,
    difficulty: 'średni',
    servings: 4,
    calories: 650,
    protein: 25,
    carbs: 80,
    fat: 20,
    tags: ['włoskie', 'makaron', 'mięsne'],
    isFavorite: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu przepisów
    getRecipe.mockResolvedValue(mockRecipe);
    addToFavorites.mockResolvedValue({ error: null });
    removeFromFavorites.mockResolvedValue({ error: null });
  });

  it('powinien wyświetlać szczegóły przepisu', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy szczegóły są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Klasyczny włoski makaron z sosem mięsnym')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy nie można pobrać przepisu', async () => {
    // Mockowanie błędu
    getRecipe.mockRejectedValueOnce(new Error('Błąd pobierania przepisu'));
    
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd pobierania przepisu/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać listę składników', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy składniki są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('500g makaron spaghetti')).toBeInTheDocument();
      expect(screen.getByText('400g mięso mielone')).toBeInTheDocument();
      expect(screen.getByText('2 puszki pomidory w puszce')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać instrukcje przygotowania', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy instrukcje są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('1. Ugotuj makaron zgodnie z instrukcją na opakowaniu.')).toBeInTheDocument();
      expect(screen.getByText('2. Na oliwie z oliwek podsmaż pokrojoną cebulę i czosnek.')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać informacje o czasie przygotowania', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy informacje o czasie są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Czas przygotowania: 30 min')).toBeInTheDocument();
      expect(screen.getByText('Czas gotowania: 45 min')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać informacje o trudności i porcjach', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy informacje o trudności i porcjach są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Trudność: średni')).toBeInTheDocument();
      expect(screen.getByText('Porcje: 4')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać wartości odżywcze', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy wartości odżywcze są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Kalorie: 650 kcal')).toBeInTheDocument();
      expect(screen.getByText('Białko: 25g')).toBeInTheDocument();
      expect(screen.getByText('Węglowodany: 80g')).toBeInTheDocument();
      expect(screen.getByText('Tłuszcz: 20g')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać tagi', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy tagi są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('włoskie')).toBeInTheDocument();
      expect(screen.getByText('makaron')).toBeInTheDocument();
      expect(screen.getByText('mięsne')).toBeInTheDocument();
    });
  });

  it('powinien dodawać przepis do ulubionych', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Poczekaj na załadowanie przepisu
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Kliknij przycisk dodania do ulubionych
    const favoriteButton = screen.getByRole('button', { name: /dodaj do ulubionych/i });
    await userEvent.click(favoriteButton);
    
    // Sprawdź czy wywołano funkcję dodawania do ulubionych
    expect(addToFavorites).toHaveBeenCalledWith(mockUser.id, '1');
  });

  it('powinien usuwać przepis z ulubionych', async () => {
    // Mockowanie przepisu jako ulubionego
    getRecipe.mockResolvedValueOnce({
      ...mockRecipe,
      isFavorite: true
    });
    
    render(<RecipeDetails recipeId="1" />);
    
    // Poczekaj na załadowanie przepisu
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Kliknij przycisk usunięcia z ulubionych
    const favoriteButton = screen.getByRole('button', { name: /usuń z ulubionych/i });
    await userEvent.click(favoriteButton);
    
    // Sprawdź czy wywołano funkcję usuwania z ulubionych
    expect(removeFromFavorites).toHaveBeenCalledWith(mockUser.id, '1');
  });

  it('powinien wyświetlać przycisk dodania do ulubionych gdy przepis nie jest ulubiony', async () => {
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy przycisk jest wyświetlany
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dodaj do ulubionych/i })).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać przycisk usunięcia z ulubionych gdy przepis jest ulubiony', async () => {
    // Mockowanie przepisu jako ulubionego
    getRecipe.mockResolvedValueOnce({
      ...mockRecipe,
      isFavorite: true
    });
    
    render(<RecipeDetails recipeId="1" />);
    
    // Sprawdzenie czy przycisk jest wyświetlany
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /usuń z ulubionych/i })).toBeInTheDocument();
    });
  });
});