// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealPlanner from '@components/meal-planner/MealPlanner';
import { useAuth } from '@contexts/AuthContext';
import { getMealPlan, updateMealPlan, generateMealPlan } from '@services/mealPlanService';

// Mock kontekstu autentykacji
vi.mock('@contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock serwisu planowania posiłków
vi.mock('@services/mealPlanService', () => ({
  getMealPlan: vi.fn(),
  updateMealPlan: vi.fn(),
  generateMealPlan: vi.fn(),
}));

describe('MealPlanner Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockMealPlan = {
    id: '1',
    weekStart: '2024-03-18',
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
    
    // Mockowanie serwisu planowania posiłków
    getMealPlan.mockResolvedValue(mockMealPlan);
    updateMealPlan.mockResolvedValue({ error: null });
    generateMealPlan.mockResolvedValue(mockMealPlan);
  });

  it('powinien wyświetlać plan posiłków', async () => {
    render(<MealPlanner />);
    
    // Sprawdzenie czy plan jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Owsianka z owocami')).toBeInTheDocument();
      expect(screen.getByText('Sałatka z kurczakiem')).toBeInTheDocument();
      expect(screen.getByText('Łosoś z warzywami')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać komunikat gdy plan jest pusty', async () => {
    // Mockowanie pustego planu
    getMealPlan.mockResolvedValueOnce({
      id: '1',
      weekStart: '2024-03-18',
      meals: {}
    });
    
    render(<MealPlanner />);
    
    // Sprawdzenie czy komunikat jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/brak zaplanowanych posiłków/i)).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy nie można pobrać planu', async () => {
    // Mockowanie błędu
    getMealPlan.mockRejectedValueOnce(new Error('Błąd pobierania planu'));
    
    render(<MealPlanner />);
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText(/błąd pobierania planu/i)).toBeInTheDocument();
    });
  });

  it('powinien generować nowy plan posiłków', async () => {
    render(<MealPlanner />);
    
    // Kliknij przycisk generowania
    const generateButton = screen.getByRole('button', { name: /wygeneruj plan/i });
    await userEvent.click(generateButton);
    
    // Sprawdź czy wywołano funkcję generowania
    expect(generateMealPlan).toHaveBeenCalledWith(mockUser.id);
    
    // Sprawdź czy nowy plan jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Owsianka z owocami')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać wartości odżywcze dla posiłków', async () => {
    render(<MealPlanner />);
    
    // Sprawdzenie czy wartości odżywcze są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('350 kcal')).toBeInTheDocument();
      expect(screen.getByText('12g białka')).toBeInTheDocument();
      expect(screen.getByText('45g węglowodanów')).toBeInTheDocument();
      expect(screen.getByText('8g tłuszczu')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać posiłki według dni tygodnia', async () => {
    render(<MealPlanner />);
    
    // Sprawdzenie czy dni tygodnia są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('poniedziałek')).toBeInTheDocument();
      expect(screen.getByText('wtorek')).toBeInTheDocument();
    });
    
    // Sprawdzenie czy posiłki są pogrupowane według dni
    const mondaySection = screen.getByText('poniedziałek').closest('section');
    expect(mondaySection).toHaveTextContent('Owsianka z owocami');
    expect(mondaySection).toHaveTextContent('Sałatka z kurczakiem');
    expect(mondaySection).toHaveTextContent('Łosoś z warzywami');
    
    const tuesdaySection = screen.getByText('wtorek').closest('section');
    expect(tuesdaySection).toHaveTextContent('Jajecznica z awokado');
    expect(tuesdaySection).toHaveTextContent('Zupa krem z dyni');
    expect(tuesdaySection).toHaveTextContent('Kurczak z ryżem');
  });

  it('powinien wyświetlać posiłki według pory dnia', async () => {
    render(<MealPlanner />);
    
    // Sprawdzenie czy pory dnia są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('śniadanie')).toBeInTheDocument();
      expect(screen.getByText('obiad')).toBeInTheDocument();
      expect(screen.getByText('kolacja')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać sumę kalorii dla dnia', async () => {
    render(<MealPlanner />);
    
    // Sprawdzenie czy suma kalorii jest wyświetlana
    await waitFor(() => {
      expect(screen.getByText('1350 kcal')).toBeInTheDocument(); // 350 + 450 + 550
    });
  });

  it('powinien wyświetlać sumę makroskładników dla dnia', async () => {
    render(<MealPlanner />);
    
    // Sprawdzenie czy suma makroskładników jest wyświetlana
    await waitFor(() => {
      expect(screen.getByText('87g białka')).toBeInTheDocument(); // 12 + 35 + 40
      expect(screen.getByText('100g węglowodanów')).toBeInTheDocument(); // 45 + 25 + 30
      expect(screen.getByText('48g tłuszczu')).toBeInTheDocument(); // 8 + 15 + 25
    });
  });
}); 