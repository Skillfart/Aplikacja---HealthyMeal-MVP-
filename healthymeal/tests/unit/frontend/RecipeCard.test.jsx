import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RecipeCard from '../../../frontend/src/components/Recipe/RecipeCard';

// Mock dla useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('RecipeCard', () => {
  // Testowe dane przepisu
  const mockRecipe = {
    _id: 'recipe123',
    title: 'Niskocukrowy omlet',
    image: 'https://example.com/image.jpg',
    prepTime: 10,
    cookTime: 5,
    calories: 320
  };

  // Reset mocków przed każdym testem
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('powinien poprawnie renderować kartę przepisu ze wszystkimi informacjami', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );

    // Sprawdzenie czy tytuł jest wyświetlany
    expect(screen.getByText('Niskocukrowy omlet')).toBeInTheDocument();
    
    // Sprawdzenie czy czas przygotowania jest wyświetlany
    expect(screen.getByText('15 min')).toBeInTheDocument();
    
    // Sprawdzenie czy kalorie są wyświetlane
    expect(screen.getByText('320 kcal')).toBeInTheDocument();
    
    // Sprawdzenie czy obraz jest wyświetlany
    const image = screen.getByAltText('Niskocukrowy omlet');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('powinien wyświetlać zastępczy element, gdy brak obrazu', () => {
    const recipeWithoutImage = {
      ...mockRecipe,
      image: null
    };

    render(
      <MemoryRouter>
        <RecipeCard recipe={recipeWithoutImage} />
      </MemoryRouter>
    );

    // Sprawdzenie czy zastępczy element dla obrazu jest wyświetlany
    expect(screen.queryByAltText('Niskocukrowy omlet')).not.toBeInTheDocument();
    const noImageElement = document.querySelector('.noImage');
    expect(noImageElement).toBeInTheDocument();
  });

  it('powinien nawigować do strony szczegółów przepisu po kliknięciu karty', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );

    // Symulacja kliknięcia karty
    fireEvent.click(screen.getByText('Niskocukrowy omlet'));

    // Sprawdzenie czy została wywołana nawigacja do odpowiedniej ścieżki
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/recipes/recipe123');
  });

  it('powinien wywołać edycję przepisu po kliknięciu przycisku edycji', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );

    // Symulacja kliknięcia przycisku edycji
    fireEvent.click(screen.getByText('Edytuj'));

    // Sprawdzenie czy została wywołana nawigacja do ścieżki edycji
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/recipes/edit/recipe123');
  });

  it('powinien wywołać funkcję usuwania po kliknięciu przycisku usuwania', () => {
    const mockDelete = vi.fn();

    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} onDelete={mockDelete} />
      </MemoryRouter>
    );

    // Symulacja kliknięcia przycisku usuwania
    fireEvent.click(screen.getByText('Usuń'));

    // Sprawdzenie czy została wywołana funkcja usuwania z odpowiednim ID
    expect(mockDelete).toHaveBeenCalledWith('recipe123');
  });

  it('powinien nawigować do strony porównania po kliknięciu przycisku porównania', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );

    // Symulacja kliknięcia przycisku porównania
    fireEvent.click(screen.getByText('Porównaj'));

    // Sprawdzenie czy została wywołana nawigacja do ścieżki porównania
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/recipes/compare?recipeId=recipe123');
  });
}); 