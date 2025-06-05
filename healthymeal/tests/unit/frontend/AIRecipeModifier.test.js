// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIRecipeModifier from '@components/recipes/AIRecipeModifier';
import { useAuth } from '@contexts/AuthContext';
import { modifyRecipe, generateAlternatives, suggestSubstitutes } from '@services/aiService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu AI
vi.mock('@services/aiService', () => ({
  modifyRecipe: vi.fn(),
  generateAlternatives: vi.fn(),
  suggestSubstitutes: vi.fn(),
}));

describe('AIRecipeModifier Component', () => {
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
      { name: 'pomidory w puszce', amount: 2, unit: 'puszki' }
    ],
    instructions: [
      'Ugotuj makaron zgodnie z instrukcją na opakowaniu.',
      'Na oliwie z oliwek podsmaż pokrojoną cebulę i czosnek.',
      'Dodaj mięso mielone i smaż aż się zrumieni.'
    ]
  };

  const mockModifiedRecipe = {
    ...mockRecipe,
    name: 'Spaghetti Bolognese (Wegetariańska)',
    ingredients: [
      { name: 'makaron spaghetti', amount: 500, unit: 'g' },
      { name: 'soja mielona', amount: 400, unit: 'g' },
      { name: 'pomidory w puszce', amount: 2, unit: 'puszki' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu AI
    modifyRecipe.mockResolvedValue(mockModifiedRecipe);
    generateAlternatives.mockResolvedValue([
      { ...mockRecipe, name: 'Spaghetti Bolognese (Wegetariańska)' },
      { ...mockRecipe, name: 'Spaghetti Bolognese (Bezglutenowa)' }
    ]);
    suggestSubstitutes.mockResolvedValue([
      { original: 'mięso mielone', substitute: 'soja mielona' },
      { original: 'makaron spaghetti', substitute: 'makaron bezglutenowy' }
    ]);
  });

  it('powinien wyświetlać formularz modyfikacji przepisu', () => {
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    expect(screen.getByText(/modyfikuj przepis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cel modyfikacji/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferencje/i)).toBeInTheDocument();
  });

  it('powinien modyfikować przepis z pomocą AI', async () => {
    const onRecipeModified = vi.fn();
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={onRecipeModified} />);
    
    // Wypełnij formularz
    await userEvent.selectOptions(screen.getByLabelText(/cel modyfikacji/i), 'wegetariańska');
    await userEvent.type(screen.getByLabelText(/preferencje/i), 'bez glutenu');
    
    // Kliknij przycisk modyfikacji
    await userEvent.click(screen.getByRole('button', { name: /modyfikuj/i }));
    
    // Sprawdź czy wywołano funkcję modyfikacji
    expect(modifyRecipe).toHaveBeenCalledWith(mockRecipe, {
      goal: 'wegetariańska',
      preferences: 'bez glutenu'
    });
    
    // Sprawdź czy zmodyfikowany przepis jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese (Wegetariańska)')).toBeInTheDocument();
    });
    
    // Sprawdź czy callback został wywołany
    expect(onRecipeModified).toHaveBeenCalledWith(mockModifiedRecipe);
  });

  it('powinien generować alternatywne wersje przepisu', async () => {
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Kliknij przycisk generowania alternatyw
    await userEvent.click(screen.getByRole('button', { name: /generuj alternatywy/i }));
    
    // Sprawdź czy wywołano funkcję generowania
    expect(generateAlternatives).toHaveBeenCalledWith(mockRecipe);
    
    // Sprawdź czy alternatywy są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Bolognese (Wegetariańska)')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Bolognese (Bezglutenowa)')).toBeInTheDocument();
    });
  });

  it('powinien sugerować zamienniki składników', async () => {
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Kliknij przycisk sugestii zamienników
    await userEvent.click(screen.getByRole('button', { name: /sugeruj zamienniki/i }));
    
    // Sprawdź czy wywołano funkcję sugestii
    expect(suggestSubstitutes).toHaveBeenCalledWith(mockRecipe);
    
    // Sprawdź czy sugestie są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('mięso mielone → soja mielona')).toBeInTheDocument();
      expect(screen.getByText('makaron spaghetti → makaron bezglutenowy')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy modyfikacja się nie powiedzie', async () => {
    // Mockowanie błędu
    modifyRecipe.mockRejectedValueOnce(new Error('Błąd modyfikacji przepisu'));
    
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Wypełnij formularz i kliknij przycisk
    await userEvent.selectOptions(screen.getByLabelText(/cel modyfikacji/i), 'wegetariańska');
    await userEvent.click(screen.getByRole('button', { name: /modyfikuj/i }));
    
    // Sprawdź czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd modyfikacji przepisu/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy generowanie alternatyw się nie powiedzie', async () => {
    // Mockowanie błędu
    generateAlternatives.mockRejectedValueOnce(new Error('Błąd generowania alternatyw'));
    
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Kliknij przycisk generowania alternatyw
    await userEvent.click(screen.getByRole('button', { name: /generuj alternatywy/i }));
    
    // Sprawdź czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd generowania alternatyw/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy sugestie zamienników się nie powiodą', async () => {
    // Mockowanie błędu
    suggestSubstitutes.mockRejectedValueOnce(new Error('Błąd generowania sugestii'));
    
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Kliknij przycisk sugestii zamienników
    await userEvent.click(screen.getByRole('button', { name: /sugeruj zamienniki/i }));
    
    // Sprawdź czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd generowania sugestii/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać podgląd zmodyfikowanego przepisu', async () => {
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Wypełnij formularz i kliknij przycisk
    await userEvent.selectOptions(screen.getByLabelText(/cel modyfikacji/i), 'wegetariańska');
    await userEvent.click(screen.getByRole('button', { name: /modyfikuj/i }));
    
    // Sprawdź czy podgląd jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Podgląd zmodyfikowanego przepisu')).toBeInTheDocument();
      expect(screen.getByText('soja mielona')).toBeInTheDocument();
    });
  });

  it('powinien pozwalać na anulowanie modyfikacji', async () => {
    render(<AIRecipeModifier recipe={mockRecipe} onRecipeModified={() => {}} />);
    
    // Wypełnij formularz i kliknij przycisk
    await userEvent.selectOptions(screen.getByLabelText(/cel modyfikacji/i), 'wegetariańska');
    await userEvent.click(screen.getByRole('button', { name: /modyfikuj/i }));
    
    // Poczekaj na wyświetlenie podglądu
    await waitFor(() => {
      expect(screen.getByText('Podgląd zmodyfikowanego przepisu')).toBeInTheDocument();
    });
    
    // Kliknij przycisk anulowania
    await userEvent.click(screen.getByRole('button', { name: /anuluj/i }));
    
    // Sprawdź czy wrócono do oryginalnego przepisu
    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.getByText('mięso mielone')).toBeInTheDocument();
  });
});