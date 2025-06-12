import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeForm from '../../../src/components/RecipeForm';
import { useAuth } from '../../../src/contexts/AuthContext';

// Mock useAuth hook
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('RecipeForm', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com'
  };

  const mockRecipe = {
    title: 'Test Recipe',
    ingredients: ['2 łyżki cukru', '1 kg mąki'],
    instructions: ['Krok 1', 'Krok 2'],
    hashtags: ['healthy', 'quick']
  };

  const mockHandlers = {
    onSubmit: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    useAuth.mockImplementation(() => ({
      user: mockUser
    }));
    jest.clearAllMocks();
  });

  test('renderuje się poprawnie w trybie tworzenia', () => {
    render(<RecipeForm {...mockHandlers} />);

    expect(screen.getByLabelText(/tytuł/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/składniki/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instrukcje/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hashtagi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zapisz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anuluj/i })).toBeInTheDocument();
  });

  test('renderuje się poprawnie w trybie edycji', () => {
    render(<RecipeForm {...mockHandlers} recipe={mockRecipe} />);

    expect(screen.getByLabelText(/tytuł/i)).toHaveValue(mockRecipe.title);
    expect(screen.getByLabelText(/składniki/i)).toHaveValue(mockRecipe.ingredients.join('\n'));
    expect(screen.getByLabelText(/instrukcje/i)).toHaveValue(mockRecipe.instructions.join('\n'));
    expect(screen.getByLabelText(/hashtagi/i)).toHaveValue(mockRecipe.hashtags.join(' '));
  });

  test('waliduje wymagane pola', async () => {
    render(<RecipeForm {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /zapisz/i }));

    await waitFor(() => {
      expect(screen.getByText(/tytuł jest wymagany/i)).toBeInTheDocument();
      expect(screen.getByText(/składniki są wymagane/i)).toBeInTheDocument();
      expect(screen.getByText(/instrukcje są wymagane/i)).toBeInTheDocument();
    });

    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });

  test('wywołuje onSubmit z poprawnymi danymi', async () => {
    render(<RecipeForm {...mockHandlers} />);

    fireEvent.change(screen.getByLabelText(/tytuł/i), {
      target: { value: mockRecipe.title }
    });

    fireEvent.change(screen.getByLabelText(/składniki/i), {
      target: { value: mockRecipe.ingredients.join('\n') }
    });

    fireEvent.change(screen.getByLabelText(/instrukcje/i), {
      target: { value: mockRecipe.instructions.join('\n') }
    });

    fireEvent.change(screen.getByLabelText(/hashtagi/i), {
      target: { value: mockRecipe.hashtags.join(' ') }
    });

    fireEvent.click(screen.getByRole('button', { name: /zapisz/i }));

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        ...mockRecipe,
        author: mockUser.id
      });
    });
  });

  test('wywołuje onCancel po kliknięciu anuluj', () => {
    render(<RecipeForm {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /anuluj/i }));

    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  test('formatuje składniki podczas wprowadzania', () => {
    render(<RecipeForm {...mockHandlers} />);

    const ingredientsInput = screen.getByLabelText(/składniki/i);

    fireEvent.change(ingredientsInput, {
      target: { value: '2 łyżki cukru\n1kg mąki' }
    });

    expect(ingredientsInput).toHaveValue('2 łyżki cukru\n1 kg mąki');
  });

  test('formatuje hashtagi podczas wprowadzania', () => {
    render(<RecipeForm {...mockHandlers} />);

    const hashtagsInput = screen.getByLabelText(/hashtagi/i);

    fireEvent.change(hashtagsInput, {
      target: { value: 'healthy quick #vegan' }
    });

    expect(hashtagsInput).toHaveValue('#healthy #quick #vegan');
  });

  test('obsługuje błędy walidacji składników', async () => {
    render(<RecipeForm {...mockHandlers} />);

    fireEvent.change(screen.getByLabelText(/składniki/i), {
      target: { value: 'niepoprawny format' }
    });

    fireEvent.click(screen.getByRole('button', { name: /zapisz/i }));

    await waitFor(() => {
      expect(screen.getByText(/niepoprawny format składnika/i)).toBeInTheDocument();
    });

    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });
}); 