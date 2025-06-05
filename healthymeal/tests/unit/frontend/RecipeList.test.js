// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeList from '@components/recipes/RecipeList';
import { useAuth } from '@contexts/AuthContext';
import { getRecipes, addToFavorites, removeFromFavorites } from '@services/recipeService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu przepisów
vi.mock('@services/recipeService', () => ({
  getRecipes: vi.fn(),
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
}));

describe('RecipeList Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockRecipes = [
    {
      id: '1',
      name: 'Spaghetti Bolognese',
      description: 'Klasyczny włoski makaron z sosem mięsnym',
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
    },
    {
      id: '2',
      name: 'Sałatka Cezar',
      description: 'Sałatka z kurczakiem, grzankami i sosem cezar',
      preparationTime: 20,
      cookingTime: 15,
      difficulty: 'łatwy',
      servings: 2,
      calories: 450,
      protein: 30,
      carbs: 25,
      fat: 25,
      tags: ['sałatka', 'kurczak', 'lekki'],
      isFavorite: true
    },
    {
      id: '3',
      name: 'Łosoś z warzywami',
      description: 'Pieczony łosoś z sezonowymi warzywami',
      preparationTime: 15,
      cookingTime: 25,
      difficulty: 'średni',
      servings: 2,
      calories: 550,
      protein: 40,
      carbs: 20,
      fat: 35,
      tags: ['ryby', 'zdrowe', 'pieczone'],
      isFavorite: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu przepisów
    getRecipes.mockResolvedValue(mockRecipes);
    addToFavorites.mockResolvedValue({ error: null });
    removeFromFavorites.mockResolvedValue({ error: null });
  });

  it('powinien wyświetlać listę przepisów', async () => {
    render(<RecipeList />);
    
    // Sprawdzenie czy przepisy są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Sałatka Cezar')).toBeInTheDocument();
      expect(screen.getByText('Łosoś z warzywami')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać komunikat gdy lista jest pusta', async () => {
    // Mockowanie pustej listy
    getRecipes.mockResolvedValueOnce([]);
    
    render(<RecipeList />);
    
    // Sprawdzenie czy komunikat jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/brak przepisów/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy nie można pobrać przepisów', async () => {
    // Mockowanie błędu
    getRecipes.mockRejectedValueOnce(new Error('Błąd pobierania przepisów'));
    
    render(<RecipeList />);
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd pobierania przepisów/i)).toBeInTheDocument();
    });
  });

  it('powinien dodawać przepis do ulubionych', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Kliknij przycisk dodania do ulubionych
    const favoriteButton = screen.getAllByRole('button', { name: /dodaj do ulubionych/i })[0];
    await userEvent.click(favoriteButton);
    
    // Sprawdź czy wywołano funkcję dodawania do ulubionych
    expect(addToFavorites).toHaveBeenCalledWith(mockUser.id, '1');
  });

  it('powinien usuwać przepis z ulubionych', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Sałatka Cezar')).toBeInTheDocument();
    });
    
    // Kliknij przycisk usunięcia z ulubionych
    const favoriteButton = screen.getAllByRole('button', { name: /usuń z ulubionych/i })[0];
    await userEvent.click(favoriteButton);
    
    // Sprawdź czy wywołano funkcję usuwania z ulubionych
    expect(removeFromFavorites).toHaveBeenCalledWith(mockUser.id, '2');
  });

  it('powinien filtrować przepisy według tagów', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Wybierz tag
    const tagSelect = screen.getByLabelText(/tag/i);
    await userEvent.selectOptions(tagSelect, 'włoskie');
    
    // Sprawdź czy lista została przefiltrowana
    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.queryByText('Sałatka Cezar')).not.toBeInTheDocument();
    expect(screen.queryByText('Łosoś z warzywami')).not.toBeInTheDocument();
  });

  it('powinien sortować przepisy według czasu przygotowania', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Wybierz sortowanie
    const sortSelect = screen.getByLabelText(/sortuj/i);
    await userEvent.selectOptions(sortSelect, 'preparationTime');
    
    // Sprawdź czy lista została posortowana
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Łosoś z warzywami'); // 15 min
    expect(items[1]).toHaveTextContent('Sałatka Cezar'); // 20 min
    expect(items[2]).toHaveTextContent('Spaghetti Bolognese'); // 30 min
  });

  it('powinien wyświetlać szczegóły przepisu po kliknięciu', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Kliknij przepis
    await userEvent.click(screen.getByText('Spaghetti Bolognese'));
    
    // Sprawdź czy szczegóły są wyświetlane
    expect(screen.getByText('Klasyczny włoski makaron z sosem mięsnym')).toBeInTheDocument();
    expect(screen.getByText('Czas przygotowania: 30 min')).toBeInTheDocument();
    expect(screen.getByText('Czas gotowania: 45 min')).toBeInTheDocument();
    expect(screen.getByText('Trudność: średni')).toBeInTheDocument();
    expect(screen.getByText('Porcje: 4')).toBeInTheDocument();
  });

  it('powinien wyświetlać wartości odżywcze przepisu', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Kliknij przepis
    await userEvent.click(screen.getByText('Spaghetti Bolognese'));
    
    // Sprawdź czy wartości odżywcze są wyświetlane
    expect(screen.getByText('Kalorie: 650 kcal')).toBeInTheDocument();
    expect(screen.getByText('Białko: 25g')).toBeInTheDocument();
    expect(screen.getByText('Węglowodany: 80g')).toBeInTheDocument();
    expect(screen.getByText('Tłuszcz: 20g')).toBeInTheDocument();
  });

  it('powinien wyświetlać tagi przepisu', async () => {
    render(<RecipeList />);
    
    // Poczekaj na załadowanie przepisów
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
    
    // Kliknij przepis
    await userEvent.click(screen.getByText('Spaghetti Bolognese'));
    
    // Sprawdź czy tagi są wyświetlane
    expect(screen.getByText('włoskie')).toBeInTheDocument();
    expect(screen.getByText('makaron')).toBeInTheDocument();
    expect(screen.getByText('mięsne')).toBeInTheDocument();
  });
});