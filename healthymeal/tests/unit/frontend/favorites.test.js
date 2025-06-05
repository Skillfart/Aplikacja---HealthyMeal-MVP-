import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@frontend/contexts/AuthContext';
import mockSupabase from '../../mocks/supabase';
import FavoritesList from '@frontend/components/recipes/FavoritesList';

// Mock kontekstu autentykacji
vi.mock('@frontend/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock supabase
vi.mock('@frontend/config/supabaseClient', () => ({
  default: mockSupabase
}));

describe('FavoritesList Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockFavorites = [
    {
      id: 1,
      recipe_id: 'recipe-1',
      recipe: {
        title: 'Sałatka z kurczakiem',
        description: 'Pyszna sałatka z kurczakiem',
        prepTime: 15,
        cookTime: 20,
      },
    },
    {
      id: 2,
      recipe_id: 'recipe-2',
      recipe: {
        title: 'Makaron z sosem pomidorowym',
        description: 'Klasyczny makaron z sosem',
        prepTime: 10,
        cookTime: 20,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie supabase
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockResolvedValue({ data: mockFavorites, error: null });
  });

  it('powinien wyświetlać listę ulubionych przepisów', async () => {
    render(<FavoritesList />);
    
    // Poczekaj na załadowanie danych
    await waitFor(() => {
      expect(screen.getByText('Sałatka z kurczakiem')).toBeInTheDocument();
      expect(screen.getByText('Makaron z sosem pomidorowym')).toBeInTheDocument();
    });
  });

  it('powinien usunąć przepis z ulubionych po kliknięciu przycisku usuwania', async () => {
    // Mockowanie usuwania
    mockSupabase.delete.mockResolvedValueOnce({ error: null });
    
    render(<FavoritesList />);
    
    // Poczekaj na załadowanie danych
    await waitFor(() => {
      expect(screen.getByText('Sałatka z kurczakiem')).toBeInTheDocument();
    });
    
    // Kliknij przycisk usuwania
    const removeButtons = screen.getAllByLabelText(/usuń z ulubionych/i);
    await userEvent.click(removeButtons[0]);
    
    // Sprawdź czy wywołano usuwanie
    expect(mockSupabase.delete).toHaveBeenCalled();
    
    // Sprawdź czy przepis został usunięty z widoku
    await waitFor(() => {
      expect(screen.queryByText('Sałatka z kurczakiem')).not.toBeInTheDocument();
    });
  });

  it('powinien wyświetlić komunikat gdy lista ulubionych jest pusta', async () => {
    // Mockowanie pustej listy
    mockSupabase.eq.mockResolvedValueOnce({ data: [], error: null });
    
    render(<FavoritesList />);
    
    // Sprawdź czy wyświetla się komunikat
    await waitFor(() => {
      expect(screen.getByText(/nie masz jeszcze ulubionych przepisów/i)).toBeInTheDocument();
    });
  });

  it('powinien obsługiwać błędy podczas ładowania ulubionych', async () => {
    // Mockowanie błędu
    mockSupabase.eq.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Błąd ładowania ulubionych' } 
    });
    
    render(<FavoritesList />);
    
    // Sprawdź czy wyświetla się komunikat błędu
    await waitFor(() => {
      expect(screen.getByText(/błąd ładowania ulubionych/i)).toBeInTheDocument();
    });
  });
}); 