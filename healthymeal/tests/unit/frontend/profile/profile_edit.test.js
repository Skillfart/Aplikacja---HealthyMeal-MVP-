import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileEditForm from '@components/profile/ProfileEditForm';
import { useAuth } from '@contexts/AuthContext';
import { updateProfile } from '@services/profileService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu profilu
vi.mock('@services/profileService', () => ({
  updateProfile: vi.fn(),
}));

describe('ProfileEditForm Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      preferences: {
        dietType: 'lowCarb',
        maxCarbs: 50,
        excludedProducts: ['cukier', 'mąka pszenna'],
        allergens: ['orzechy']
      }
    }
  };

  const mockUpdateProfile = vi.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile
    });
    
    // Mockowanie serwisu profilu
    updateProfile.mockResolvedValue({ error: null, data: null });
  });

  it('powinno wyrenderować formularz z danymi użytkownika', () => {
    render(<ProfileEditForm />);
    
    // Sprawdzenie czy formularz zawiera dane użytkownika
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    
    // Sprawdzenie czy preferencje są poprawnie załadowane
    expect(screen.getByDisplayValue('lowCarb')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('powinno aktualizować dane formularza po zmianie', async () => {
    render(<ProfileEditForm />);
    
    // Zmiana wartości pól
    const nameInput = screen.getByLabelText(/imię/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Nowe Imię');
    
    const dietTypeSelect = screen.getByLabelText(/typ diety/i);
    await userEvent.selectOptions(dietTypeSelect, ['keto']);
    
    const maxCarbsInput = screen.getByLabelText(/maksymalna ilość węglowodanów/i);
    await userEvent.clear(maxCarbsInput);
    await userEvent.type(maxCarbsInput, '30');
    
    // Sprawdzenie czy wartości zostały zaktualizowane
    expect(screen.getByDisplayValue('Nowe Imię')).toBeInTheDocument();
    expect(screen.getByDisplayValue('keto')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('powinno dodawać i usuwać wykluczone produkty', async () => {
    render(<ProfileEditForm />);
    
    // Dodanie nowego produktu
    const productInput = screen.getByLabelText(/dodaj wykluczony produkt/i);
    await userEvent.type(productInput, 'mleko{enter}');
    
    // Sprawdzenie czy produkt został dodany
    expect(screen.getByText('mleko')).toBeInTheDocument();
    
    // Usunięcie produktu
    const removeButton = screen.getAllByLabelText(/usuń produkt/i)[0];
    await userEvent.click(removeButton);
    
    // Sprawdzenie czy produkt został usunięty
    await waitFor(() => {
      expect(screen.queryByText('cukier')).not.toBeInTheDocument();
    });
  });

  it('powinno wysłać dane do API po zapisaniu formularza', async () => {
    render(<ProfileEditForm />);
    
    // Zmiana wartości w formularzu
    const nameInput = screen.getByLabelText(/imię/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Nowe Imię');
    
    // Kliknięcie przycisku zapisz
    const saveButton = screen.getByRole('button', { name: /zapisz/i });
    await userEvent.click(saveButton);
    
    // Sprawdzenie czy funkcja aktualizacji została wywołana
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        name: 'Nowe Imię',
        preferences: {
          dietType: 'lowCarb',
          maxCarbs: 50,
          excludedProducts: ['cukier', 'mąka pszenna'],
          allergens: ['orzechy']
        }
      });
    });
  });

  it('powinno wyświetlić komunikat o sukcesie po zapisaniu', async () => {
    render(<ProfileEditForm />);
    
    // Kliknięcie przycisku zapisz
    const saveButton = screen.getByRole('button', { name: /zapisz/i });
    await userEvent.click(saveButton);
    
    // Sprawdzenie czy komunikat sukcesu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/profil został zaktualizowany/i)).toBeInTheDocument();
    });
  });

  it('powinno wyświetlić błąd, gdy aktualizacja nie powiedzie się', async () => {
    // Mockowanie błędu
    updateProfile.mockResolvedValueOnce({ 
      error: { message: 'Błąd aktualizacji profilu' } 
    });
    
    render(<ProfileEditForm />);
    
    // Kliknięcie przycisku zapisz
    const saveButton = screen.getByRole('button', { name: /zapisz/i });
    await userEvent.click(saveButton);
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd aktualizacji profilu/i)).toBeInTheDocument();
    });
  });
}); 