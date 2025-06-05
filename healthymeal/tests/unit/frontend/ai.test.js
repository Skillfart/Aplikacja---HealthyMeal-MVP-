import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@contexts/AuthContext';
import { modifyRecipeWithAI } from '@services/aiService';
import RecipeModification from '@components/recipes/RecipeModification';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu AI
vi.mock('@services/aiService', () => ({
  modifyRecipeWithAI: vi.fn(),
}));

describe('RecipeModification Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      preferences: {
        dietType: 'lowCarb',
        maxCarbs: 50,
        excludedProducts: ['cukier', 'mąka pszenna'],
        allergens: ['orzechy']
      }
    }
  };

  const mockRecipe = {
    id: 1,
    title: 'Makaron z sosem pomidorowym',
    ingredients: [
      { name: 'makaron', amount: '200g' },
      { name: 'pomidory', amount: '400g' },
      { name: 'cukier', amount: '1 łyżka' }
    ],
    instructions: '1. Ugotuj makaron\n2. Przygotuj sos\n3. Wymieszaj'
  };

  const mockModifiedRecipe = {
    ...mockRecipe,
    ingredients: [
      { name: 'makaron pełnoziarnisty', amount: '200g' },
      { name: 'pomidory', amount: '400g' },
      { name: 'ksylitol', amount: '1 łyżka' }
    ],
    instructions: '1. Ugotuj makaron pełnoziarnisty\n2. Przygotuj sos\n3. Wymieszaj'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu AI
    modifyRecipeWithAI.mockResolvedValue({
      data: mockModifiedRecipe,
      error: null
    });
  });

  it('powinien wyświetlać formularz modyfikacji przepisu', () => {
    render(<RecipeModification recipe={mockRecipe} />);
    
    expect(screen.getByText(/modyfikuj przepis/i)).toBeInTheDocument();
    expect(screen.getByText(/preferencje/i)).toBeInTheDocument();
  });

  it('powinien modyfikować przepis z pomocą AI', async () => {
    render(<RecipeModification recipe={mockRecipe} />);
    
    // Kliknij przycisk modyfikacji
    const modifyButton = screen.getByRole('button', { name: /modyfikuj/i });
    await userEvent.click(modifyButton);
    
    // Sprawdź czy wywołano serwis AI
    expect(modifyRecipeWithAI).toHaveBeenCalledWith(mockRecipe, mockUser.user_metadata.preferences);
    
    // Sprawdź czy wyświetlono zmodyfikowany przepis
    await waitFor(() => {
      expect(screen.getByText('makaron pełnoziarnisty')).toBeInTheDocument();
      expect(screen.getByText('ksylitol')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy modyfikacja nie powiedzie się', async () => {
    // Mockowanie błędu
    modifyRecipeWithAI.mockResolvedValueOnce({
      data: null,
      error: { message: 'Błąd modyfikacji przepisu' }
    });
    
    render(<RecipeModification recipe={mockRecipe} />);
    
    // Kliknij przycisk modyfikacji
    const modifyButton = screen.getByRole('button', { name: /modyfikuj/i });
    await userEvent.click(modifyButton);
    
    // Sprawdź czy wyświetlono komunikat błędu
    await waitFor(() => {
      expect(screen.getByText(/błąd modyfikacji przepisu/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać porównanie oryginalnego i zmodyfikowanego przepisu', async () => {
    render(<RecipeModification recipe={mockRecipe} />);
    
    // Kliknij przycisk modyfikacji
    const modifyButton = screen.getByRole('button', { name: /modyfikuj/i });
    await userEvent.click(modifyButton);
    
    // Sprawdź czy wyświetlono porównanie
    await waitFor(() => {
      expect(screen.getByText(/oryginalny przepis/i)).toBeInTheDocument();
      expect(screen.getByText(/zmodyfikowany przepis/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać podsumowanie zmian', async () => {
    render(<RecipeModification recipe={mockRecipe} />);
    
    // Kliknij przycisk modyfikacji
    const modifyButton = screen.getByRole('button', { name: /modyfikuj/i });
    await userEvent.click(modifyButton);
    
    // Sprawdź czy wyświetlono podsumowanie zmian
    await waitFor(() => {
      expect(screen.getByText(/zmieniono składniki/i)).toBeInTheDocument();
      expect(screen.getByText(/makaron → makaron pełnoziarnisty/i)).toBeInTheDocument();
      expect(screen.getByText(/cukier → ksylitol/i)).toBeInTheDocument();
    });
  });
}); 