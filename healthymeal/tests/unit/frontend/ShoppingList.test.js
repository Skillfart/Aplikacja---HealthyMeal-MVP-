// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingList from '@components/shopping/ShoppingList';
import { useAuth } from '@contexts/AuthContext';
import { getShoppingList, updateShoppingList, clearShoppingList } from '@services/shoppingService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu zakupów
vi.mock('@services/shoppingService', () => ({
  getShoppingList: vi.fn(),
  updateShoppingList: vi.fn(),
  clearShoppingList: vi.fn(),
}));

describe('ShoppingList Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockShoppingList = {
    id: '1',
    items: [
      {
        id: '1',
        name: 'Jajka',
        amount: '10',
        unit: 'szt',
        category: 'nabiał',
        checked: false
      },
      {
        id: '2',
        name: 'Mleko',
        amount: '1',
        unit: 'l',
        category: 'nabiał',
        checked: false
      },
      {
        id: '3',
        name: 'Chleb',
        amount: '1',
        unit: 'szt',
        category: 'pieczywo',
        checked: false
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu zakupów
    getShoppingList.mockResolvedValue(mockShoppingList);
    updateShoppingList.mockResolvedValue({ error: null });
    clearShoppingList.mockResolvedValue({ error: null });
  });

  it('powinien wyświetlać listę zakupów', async () => {
    render(<ShoppingList />);
    
    // Sprawdzenie czy lista jest wyświetlana
    await waitFor(() => {
      expect(screen.getByText('Jajka')).toBeInTheDocument();
      expect(screen.getByText('Mleko')).toBeInTheDocument();
      expect(screen.getByText('Chleb')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać komunikat gdy lista jest pusta', async () => {
    // Mockowanie pustej listy
    getShoppingList.mockResolvedValueOnce({
      id: '1',
      items: []
    });
    
    render(<ShoppingList />);
    
    // Sprawdzenie czy komunikat jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/lista zakupów jest pusta/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy nie można pobrać listy', async () => {
    // Mockowanie błędu
    getShoppingList.mockRejectedValueOnce(new Error('Błąd pobierania listy'));
    
    render(<ShoppingList />);
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd pobierania listy/i)).toBeInTheDocument();
    });
  });

  it('powinien zaznaczać produkty jako kupione', async () => {
    render(<ShoppingList />);
    
    // Poczekaj na załadowanie listy
    await waitFor(() => {
      expect(screen.getByText('Jajka')).toBeInTheDocument();
    });
    
    // Kliknij checkbox
    const checkbox = screen.getAllByRole('checkbox')[0];
    await userEvent.click(checkbox);
    
    // Sprawdź czy wywołano funkcję aktualizacji
    expect(updateShoppingList).toHaveBeenCalledWith('1', {
      ...mockShoppingList,
      items: [
        { ...mockShoppingList.items[0], checked: true },
        ...mockShoppingList.items.slice(1)
      ]
    });
  });

  it('powinien grupować produkty według kategorii', async () => {
    render(<ShoppingList />);
    
    // Sprawdzenie czy kategorie są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('nabiał')).toBeInTheDocument();
      expect(screen.getByText('pieczywo')).toBeInTheDocument();
    });
    
    // Sprawdzenie czy produkty są pogrupowane
    const dairySection = screen.getByText('nabiał').closest('section');
    expect(dairySection).toHaveTextContent('Jajka');
    expect(dairySection).toHaveTextContent('Mleko');
    
    const breadSection = screen.getByText('pieczywo').closest('section');
    expect(breadSection).toHaveTextContent('Chleb');
  });

  it('powinien wyświetlać ilości produktów', async () => {
    render(<ShoppingList />);
    
    // Sprawdzenie czy ilości są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('10 szt')).toBeInTheDocument();
      expect(screen.getByText('1 l')).toBeInTheDocument();
      expect(screen.getByText('1 szt')).toBeInTheDocument();
    });
  });

  it('powinien czyścić listę zakupów', async () => {
    render(<ShoppingList />);
    
    // Poczekaj na załadowanie listy
    await waitFor(() => {
      expect(screen.getByText('Jajka')).toBeInTheDocument();
    });
    
    // Kliknij przycisk czyszczenia
    const clearButton = screen.getByRole('button', { name: /wyczyść listę/i });
    await userEvent.click(clearButton);
    
    // Sprawdź czy wywołano funkcję czyszczenia
    expect(clearShoppingList).toHaveBeenCalledWith('1');
    
    // Sprawdź czy lista została wyczyszczona
    await waitFor(() => {
      expect(screen.getByText(/lista zakupów jest pusta/i)).toBeInTheDocument();
    });
  });

  it('powinien filtrować produkty według kategorii', async () => {
    render(<ShoppingList />);
    
    // Poczekaj na załadowanie listy
    await waitFor(() => {
      expect(screen.getByText('Jajka')).toBeInTheDocument();
    });
    
    // Wybierz kategorię
    const categorySelect = screen.getByLabelText(/kategoria/i);
    await userEvent.selectOptions(categorySelect, 'nabiał');
    
    // Sprawdź czy lista została przefiltrowana
    expect(screen.getByText('Jajka')).toBeInTheDocument();
    expect(screen.getByText('Mleko')).toBeInTheDocument();
    expect(screen.queryByText('Chleb')).not.toBeInTheDocument();
  });

  it('powinien sortować produkty alfabetycznie', async () => {
    render(<ShoppingList />);
    
    // Poczekaj na załadowanie listy
    await waitFor(() => {
      expect(screen.getByText('Jajka')).toBeInTheDocument();
    });
    
    // Wybierz sortowanie
    const sortSelect = screen.getByLabelText(/sortuj/i);
    await userEvent.selectOptions(sortSelect, 'name');
    
    // Sprawdź czy lista została posortowana
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Chleb');
    expect(items[1]).toHaveTextContent('Jajka');
    expect(items[2]).toHaveTextContent('Mleko');
  });
}); 