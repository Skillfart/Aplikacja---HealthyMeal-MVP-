/**
 * @vitest-environment jsdom 
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeFilters from '@components/recipes/RecipeFilters';
import { useAuth } from '@contexts/AuthContext';
import { searchRecipes, filterRecipes } from '@services/recipeService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu przepisów
vi.mock('@services/recipeService', () => ({
  searchRecipes: vi.fn(),
  filterRecipes: vi.fn(),
}));

describe('RecipeFilters Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockRecipes = [
    {
      id: '1',
      name: 'Spaghetti Bolognese',
      tags: ['włoskie', 'makaron', 'mięsne'],
      calories: 650,
      preparationTime: 30,
      difficulty: 'średni'
    },
    {
      id: '2',
      name: 'Sałatka Cezar',
      tags: ['sałatka', 'kurczak', 'lekki'],
      calories: 450,
      preparationTime: 20,
      difficulty: 'łatwy'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu przepisów
    searchRecipes.mockResolvedValue(mockRecipes);
    filterRecipes.mockResolvedValue(mockRecipes);
  });

  it('powinien wyświetlać pole wyszukiwania', () => {
    render(<RecipeFilters onFilterChange={() => {}} />);
    
    expect(screen.getByPlaceholderText(/szukaj przepisów/i)).toBeInTheDocument();
  });

  it('powinien wyświetlać filtry', () => {
    render(<RecipeFilters onFilterChange={() => {}} />);
    
    expect(screen.getByLabelText(/kategoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/trudność/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/czas przygotowania/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kalorie/i)).toBeInTheDocument();
  });

  it('powinien wyszukiwać przepisy po nazwie', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText(/szukaj przepisów/i);
    await userEvent.type(searchInput, 'Spaghetti');
    
    // Poczekaj na debounce
    await waitFor(() => {
      expect(searchRecipes).toHaveBeenCalledWith('Spaghetti');
    });
    
    expect(onFilterChange).toHaveBeenCalledWith(mockRecipes);
  });

  it('powinien filtrować przepisy według kategorii', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    const categorySelect = screen.getByLabelText(/kategoria/i);
    await userEvent.selectOptions(categorySelect, 'włoskie');
    
    expect(filterRecipes).toHaveBeenCalledWith({
      category: 'włoskie'
    });
    
    expect(onFilterChange).toHaveBeenCalledWith(mockRecipes);
  });

  it('powinien filtrować przepisy według trudności', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    const difficultySelect = screen.getByLabelText(/trudność/i);
    await userEvent.selectOptions(difficultySelect, 'łatwy');
    
    expect(filterRecipes).toHaveBeenCalledWith({
      difficulty: 'łatwy'
    });
    
    expect(onFilterChange).toHaveBeenCalledWith(mockRecipes);
  });

  it('powinien filtrować przepisy według czasu przygotowania', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    const timeSelect = screen.getByLabelText(/czas przygotowania/i);
    await userEvent.selectOptions(timeSelect, '30');
    
    expect(filterRecipes).toHaveBeenCalledWith({
      maxPreparationTime: 30
    });
    
    expect(onFilterChange).toHaveBeenCalledWith(mockRecipes);
  });

  it('powinien filtrować przepisy według kalorii', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    const caloriesSelect = screen.getByLabelText(/kalorie/i);
    await userEvent.selectOptions(caloriesSelect, '500');
    
    expect(filterRecipes).toHaveBeenCalledWith({
      maxCalories: 500
    });
    
    expect(onFilterChange).toHaveBeenCalledWith(mockRecipes);
  });

  it('powinien łączyć wiele filtrów', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    // Ustaw filtry
    await userEvent.selectOptions(screen.getByLabelText(/kategoria/i), 'włoskie');
    await userEvent.selectOptions(screen.getByLabelText(/trudność/i), 'średni');
    await userEvent.selectOptions(screen.getByLabelText(/czas przygotowania/i), '30');
    
    expect(filterRecipes).toHaveBeenCalledWith({
      category: 'włoskie',
      difficulty: 'średni',
      maxPreparationTime: 30
    });
    
    expect(onFilterChange).toHaveBeenCalledWith(mockRecipes);
  });

  it('powinien wyświetlać błąd gdy wyszukiwanie się nie powiedzie', async () => {
    // Mockowanie błędu
    searchRecipes.mockRejectedValueOnce(new Error('Błąd wyszukiwania'));
    
    render(<RecipeFilters onFilterChange={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/szukaj przepisów/i);
    await userEvent.type(searchInput, 'Spaghetti');
    
    await waitFor(() => {
      expect(screen.getByText(/błąd wyszukiwania/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy filtrowanie się nie powiedzie', async () => {
    // Mockowanie błędu
    filterRecipes.mockRejectedValueOnce(new Error('Błąd filtrowania'));
    
    render(<RecipeFilters onFilterChange={() => {}} />);
    
    const categorySelect = screen.getByLabelText(/kategoria/i);
    await userEvent.selectOptions(categorySelect, 'włoskie');
    
    await waitFor(() => {
      expect(screen.getByText(/błąd filtrowania/i)).toBeInTheDocument();
    });
  });

  it('powinien resetować filtry', async () => {
    const onFilterChange = vi.fn();
    render(<RecipeFilters onFilterChange={onFilterChange} />);
    
    // Ustaw filtry
    await userEvent.selectOptions(screen.getByLabelText(/kategoria/i), 'włoskie');
    await userEvent.selectOptions(screen.getByLabelText(/trudność/i), 'średni');
    
    // Kliknij przycisk resetowania
    const resetButton = screen.getByRole('button', { name: /resetuj filtry/i });
    await userEvent.click(resetButton);
    
    // Sprawdź czy wszystkie filtry zostały zresetowane
    expect(screen.getByLabelText(/kategoria/i)).toHaveValue('');
    expect(screen.getByLabelText(/trudność/i)).toHaveValue('');
    expect(screen.getByLabelText(/czas przygotowania/i)).toHaveValue('');
    expect(screen.getByLabelText(/kalorie/i)).toHaveValue('');
  });
}); 