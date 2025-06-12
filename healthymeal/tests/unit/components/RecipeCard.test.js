import { render, screen, fireEvent } from '@testing-library/react';
import RecipeCard from '../../../src/components/RecipeCard';
import { MemoryRouter } from 'react-router-dom';

describe('RecipeCard', () => {
  const mockRecipe = {
    _id: '123',
    title: 'Test Recipe',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: 'Test instructions',
    hashtags: ['healthy', 'quick'],
    author: 'user123'
  };

  const mockHandlers = {
    onModify: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderuje się poprawnie z danymi przepisu', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();
    expect(screen.getByText('#healthy')).toBeInTheDocument();
    expect(screen.getByText('#quick')).toBeInTheDocument();
  });

  test('wywołuje onModify po kliknięciu przycisku modyfikacji', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    const modifyButton = screen.getByText(/Modyfikuj/i);
    fireEvent.click(modifyButton);

    expect(mockHandlers.onModify).toHaveBeenCalledWith(mockRecipe._id);
  });

  test('wywołuje onDelete po potwierdzeniu usunięcia', () => {
    window.confirm = jest.fn(() => true);

    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByText(/Usuń/i);
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockRecipe._id);
  });

  test('nie wywołuje onDelete po anulowaniu usunięcia', () => {
    window.confirm = jest.fn(() => false);

    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByText(/Usuń/i);
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });

  test('wyświetla hashtagi jako linki', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    mockRecipe.hashtags.forEach(tag => {
      const tagElement = screen.getByText(`#${tag}`);
      expect(tagElement).toBeInTheDocument();
      expect(tagElement.tagName).toBe('A');
    });
  });

  test('wyświetla skróconą listę składników', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    mockRecipe.ingredients.forEach(ingredient => {
      expect(screen.getByText(ingredient)).toBeInTheDocument();
    });
  });

  test('link do szczegółów przepisu ma poprawny URL', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} {...mockHandlers} />
      </MemoryRouter>
    );

    const link = screen.getByText(mockRecipe.title).closest('a');
    expect(link).toHaveAttribute('href', `/recipes/${mockRecipe._id}`);
  });
}); 