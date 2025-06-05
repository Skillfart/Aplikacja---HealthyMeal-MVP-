// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DietPlanGenerator from '@components/diet-plan/DietPlanGenerator';
import { useAuth } from '@contexts/AuthContext';
import { generateDietPlan, saveDietPlan } from '@services/dietPlanService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu planu diety
vi.mock('@services/dietPlanService', () => ({
  generateDietPlan: vi.fn(),
  saveDietPlan: vi.fn(),
}));

describe('DietPlanGenerator Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockDietPlan = {
    id: '1',
    userId: 'test-user-id',
    startDate: '2024-03-18',
    endDate: '2024-03-24',
    dailyCalories: 2000,
    meals: {
      monday: {
        breakfast: {
          id: '1',
          name: 'Owsianka z owocami',
          calories: 350,
          protein: 12,
          carbs: 45,
          fat: 8
        },
        lunch: {
          id: '2',
          name: 'Sałatka z kurczakiem',
          calories: 450,
          protein: 35,
          carbs: 25,
          fat: 15
        },
        dinner: {
          id: '3',
          name: 'Łosoś z warzywami',
          calories: 550,
          protein: 40,
          carbs: 30,
          fat: 25
        }
      },
      tuesday: {
        breakfast: {
          id: '4',
          name: 'Jajecznica z awokado',
          calories: 400,
          protein: 20,
          carbs: 15,
          fat: 30
        },
        lunch: {
          id: '5',
          name: 'Zupa krem z dyni',
          calories: 300,
          protein: 10,
          carbs: 35,
          fat: 12
        },
        dinner: {
          id: '6',
          name: 'Kurczak z ryżem',
          calories: 500,
          protein: 35,
          carbs: 45,
          fat: 15
        }
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie useAuth
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    // Mockowanie serwisu planu diety
    generateDietPlan.mockResolvedValue(mockDietPlan);
    saveDietPlan.mockResolvedValue({ error: null });
  });

  it('powinien wyświetlać formularz generowania planu diety', async () => {
    render(<DietPlanGenerator />);
    
    // Sprawdzenie czy formularz jest wyświetlany
    expect(screen.getByLabelText(/cel diety/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/poziom aktywności/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/waga/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wzrost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wiek/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/płeć/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alergie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferencje żywieniowe/i)).toBeInTheDocument();
  });

  it('powinien generować plan diety po wypełnieniu formularza', async () => {
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    await userEvent.type(screen.getByLabelText(/alergie/i), 'orzechy');
    await userEvent.type(screen.getByLabelText(/preferencje żywieniowe/i), 'wegetariańskie');
    
    // Kliknij przycisk generowania
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Sprawdź czy wywołano funkcję generowania
    expect(generateDietPlan).toHaveBeenCalledWith({
      userId: mockUser.id,
      goal: 'redukcja',
      activityLevel: 'umiarkowany',
      weight: 70,
      height: 170,
      age: 30,
      gender: 'mężczyzna',
      allergies: ['orzechy'],
      preferences: ['wegetariańskie']
    });
    
    // Sprawdź czy plan jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Owsianka z owocami')).toBeInTheDocument();
      expect(screen.getByText('Sałatka z kurczakiem')).toBeInTheDocument();
      expect(screen.getByText('Łosoś z warzywami')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy generowanie planu się nie powiedzie', async () => {
    // Mockowanie błędu
    generateDietPlan.mockRejectedValueOnce(new Error('Błąd generowania planu'));
    
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    
    // Kliknij przycisk generowania
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Sprawdź czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd generowania planu/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać podsumowanie planu diety', async () => {
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz i wygeneruj plan
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Sprawdź czy podsumowanie jest wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Podsumowanie planu diety')).toBeInTheDocument();
      expect(screen.getByText('Dzienne kalorie: 2000 kcal')).toBeInTheDocument();
      expect(screen.getByText('Okres: 18.03.2024 - 24.03.2024')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać posiłki dla każdego dnia', async () => {
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz i wygeneruj plan
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Sprawdź czy posiłki są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('poniedziałek')).toBeInTheDocument();
      expect(screen.getByText('wtorek')).toBeInTheDocument();
      
      // Sprawdź posiłki na poniedziałek
      const mondaySection = screen.getByText('poniedziałek').closest('section');
      expect(mondaySection).toHaveTextContent('Śniadanie: Owsianka z owocami');
      expect(mondaySection).toHaveTextContent('Obiad: Sałatka z kurczakiem');
      expect(mondaySection).toHaveTextContent('Kolacja: Łosoś z warzywami');
      
      // Sprawdź posiłki na wtorek
      const tuesdaySection = screen.getByText('wtorek').closest('section');
      expect(tuesdaySection).toHaveTextContent('Śniadanie: Jajecznica z awokado');
      expect(tuesdaySection).toHaveTextContent('Obiad: Zupa krem z dyni');
      expect(tuesdaySection).toHaveTextContent('Kolacja: Kurczak z ryżem');
    });
  });

  it('powinien wyświetlać wartości odżywcze dla każdego posiłku', async () => {
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz i wygeneruj plan
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Sprawdź czy wartości odżywcze są wyświetlane
    await waitFor(() => {
      // Sprawdź wartości odżywcze dla pierwszego posiłku
      expect(screen.getByText('350 kcal')).toBeInTheDocument();
      expect(screen.getByText('12g białka')).toBeInTheDocument();
      expect(screen.getByText('45g węglowodanów')).toBeInTheDocument();
      expect(screen.getByText('8g tłuszczu')).toBeInTheDocument();
    });
  });

  it('powinien zapisywać wygenerowany plan diety', async () => {
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz i wygeneruj plan
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Poczekaj na wygenerowanie planu
    await waitFor(() => {
      expect(screen.getByText('Owsianka z owocami')).toBeInTheDocument();
    });
    
    // Kliknij przycisk zapisywania
    await userEvent.click(screen.getByRole('button', { name: /zapisz plan/i }));
    
    // Sprawdź czy wywołano funkcję zapisywania
    expect(saveDietPlan).toHaveBeenCalledWith(mockDietPlan);
    
    // Sprawdź czy komunikat sukcesu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/plan został zapisany/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy zapisywanie planu się nie powiedzie', async () => {
    // Mockowanie błędu zapisywania
    saveDietPlan.mockRejectedValueOnce(new Error('Błąd zapisywania planu'));
    
    render(<DietPlanGenerator />);
    
    // Wypełnij formularz i wygeneruj plan
    await userEvent.selectOptions(screen.getByLabelText(/cel diety/i), 'redukcja');
    await userEvent.selectOptions(screen.getByLabelText(/poziom aktywności/i), 'umiarkowany');
    await userEvent.type(screen.getByLabelText(/waga/i), '70');
    await userEvent.type(screen.getByLabelText(/wzrost/i), '170');
    await userEvent.type(screen.getByLabelText(/wiek/i), '30');
    await userEvent.selectOptions(screen.getByLabelText(/płeć/i), 'mężczyzna');
    await userEvent.click(screen.getByRole('button', { name: /wygeneruj plan/i }));
    
    // Poczekaj na wygenerowanie planu
    await waitFor(() => {
      expect(screen.getByText('Owsianka z owocami')).toBeInTheDocument();
    });
    
    // Kliknij przycisk zapisywania
    await userEvent.click(screen.getByRole('button', { name: /zapisz plan/i }));
    
    // Sprawdź czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd zapisywania planu/i)).toBeInTheDocument();
    });
  });
});