// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesList from '@components/recipes/FavoritesList';
import { useAuth } from '@contexts/AuthContext';
import { getFavoriteRecipes, removeFromFavorites } from '@services/favoritesService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu ulubionych
vi.mock('@services/favoritesService', () => ({
  getFavoriteRecipes: vi.fn(),
  removeFromFavorites: vi.fn(),
}));

describe('FavoritesList Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockFavorites = [
    {
      id: '1',
      recipe: {
        id: '1',
        title: 'Test Recipe 1',
        description: 'Test Description 1',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2'],
        tags: ['tag1', 'tag2'],
        difficulty: 'easy',
        prepTime: 30,
        cookTime: 20,
        servings: 4,
        carbs: 20,
        protein: 15,
        fat: 10,
        calories: 300
      }
    },
    {
      id: '2',
      recipe: {
        id: '2',
        title: 'Test Recipe 2',
        description: 'Test Description 2',
        ingredients: ['ingredient3', 'ingredient4'],
        instructions: ['step3', 'step4'],
        tags: ['tag3', 'tag4'],
        difficulty: 'medium',
        prepTime: 45,
        cookTime: 30,
        servings: 6,
        carbs: 25,
        protein: 20,
        fat: 15,
        calories: 400
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu ulubionych
    getFavoriteRecipes.mockResolvedValue(mockFavorites);
    removeFromFavorites.mockResolvedValue({ error: null });
  });

  it('powinien wyświetlać listę ulubionych przepisów', async () => {
    render(<FavoritesList />);
    
    // Sprawdzenie czy lista jest wyświetlana
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać komunikat gdy nie ma ulubionych przepisów', async () => {
    // Mockowanie pustej listy
    getFavoriteRecipes.mockResolvedValueOnce([]);
    
    render(<FavoritesList />);
    
    // Sprawdzenie czy komunikat jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/nie masz jeszcze ulubionych przepisów/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy nie można pobrać ulubionych', async () => {
    // Mockowanie błędu
    getFavoriteRecipes.mockRejectedValueOnce(new Error('Błąd pobierania ulubionych'));
    
    render(<FavoritesList />);
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd pobierania ulubionych/i)).toBeInTheDocument();
    });
  });

  it('powinien usuwać przepis z ulubionych po kliknięciu przycisku', async () => {
    render(<FavoritesList />);
    
    // Poczekaj na załadowanie listy
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    });
    
    // Kliknij przycisk usuwania
    const removeButton = screen.getAllByRole('button', { name: /usuń z ulubionych/i })[0];
    await userEvent.click(removeButton);
    
    // Sprawdź czy wywołano funkcję usuwania
    expect(removeFromFavorites).toHaveBeenCalledWith('1');
    
    // Sprawdź czy lista została zaktualizowana
    await waitFor(() => {
      expect(screen.queryByText('Test Recipe 1')).not.toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy usuwanie nie powiedzie się', async () => {
    // Mockowanie błędu przy usuwaniu
    removeFromFavorites.mockRejectedValueOnce(new Error('Błąd usuwania z ulubionych'));
    
    render(<FavoritesList />);
    
    // Poczekaj na załadowanie listy
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    });
    
    // Kliknij przycisk usuwania
    const removeButton = screen.getAllByRole('button', { name: /usuń z ulubionych/i })[0];
    await userEvent.click(removeButton);
    
    // Sprawdź czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd usuwania z ulubionych/i)).toBeInTheDocument();
    });
  });
}); 