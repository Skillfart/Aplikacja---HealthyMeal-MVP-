// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { signIn, signUp, signOut, getCurrentUser } from '@services/authService';

// Mock serwisu autentykacji
vi.mock('@services/authService', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Komponent testowy
const TestComponent = () => {
  const { user, signIn: login, signUp: register, signOut: logout, loading, error } = useAuth();
  
  return (
    <div>
      {loading && <div>Ładowanie...</div>}
      {error && <div>{error}</div>}
      {user ? (
        <>
          <div>Zalogowany jako: {user.email}</div>
          <button onClick={logout}>Wyloguj</button>
        </>
      ) : (
        <>
          <button onClick={() => login('test@example.com', 'password')}>Zaloguj</button>
          <button onClick={() => register('test@example.com', 'password')}>Zarejestruj</button>
        </>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockowanie serwisu autentykacji
    signIn.mockResolvedValue({ user: mockUser, error: null });
    signUp.mockResolvedValue({ user: mockUser, error: null });
    signOut.mockResolvedValue({ error: null });
    getCurrentUser.mockResolvedValue(mockUser);
  });

  it('powinien wyświetlać formularz logowania gdy użytkownik nie jest zalogowany', async () => {
    getCurrentUser.mockResolvedValueOnce(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Sprawdzenie czy przyciski logowania i rejestracji są wyświetlane
    expect(screen.getByText('Zaloguj')).toBeInTheDocument();
    expect(screen.getByText('Zarejestruj')).toBeInTheDocument();
  });

  it('powinien wyświetlać dane użytkownika gdy jest zalogowany', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Sprawdzenie czy dane użytkownika są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Zalogowany jako: test@example.com')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać komunikat ładowania podczas logowania', async () => {
    // Opóźnienie odpowiedzi
    signIn.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ user: mockUser, error: null }), 100)));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Kliknij przycisk logowania
    await userEvent.click(screen.getByText('Zaloguj'));
    
    // Sprawdzenie czy komunikat ładowania jest wyświetlany
    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
  });

  it('powinien wyświetlać błąd gdy logowanie się nie powiedzie', async () => {
    // Mockowanie błędu logowania
    signIn.mockResolvedValueOnce({ user: null, error: 'Nieprawidłowe dane logowania' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Kliknij przycisk logowania
    await userEvent.click(screen.getByText('Zaloguj'));
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Nieprawidłowe dane logowania')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy rejestracja się nie powiedzie', async () => {
    // Mockowanie błędu rejestracji
    signUp.mockResolvedValueOnce({ user: null, error: 'Email jest już używany' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Kliknij przycisk rejestracji
    await userEvent.click(screen.getByText('Zarejestruj'));
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Email jest już używany')).toBeInTheDocument();
    });
  });

  it('powinien wylogowywać użytkownika', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Poczekaj na załadowanie użytkownika
    await waitFor(() => {
      expect(screen.getByText('Zalogowany jako: test@example.com')).toBeInTheDocument();
    });
    
    // Kliknij przycisk wylogowania
    await userEvent.click(screen.getByText('Wyloguj'));
    
    // Sprawdzenie czy wywołano funkcję wylogowania
    expect(signOut).toHaveBeenCalled();
    
    // Sprawdzenie czy przyciski logowania i rejestracji są wyświetlane
    await waitFor(() => {
      expect(screen.getByText('Zaloguj')).toBeInTheDocument();
      expect(screen.getByText('Zarejestruj')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy wylogowanie się nie powiedzie', async () => {
    // Mockowanie błędu wylogowania
    signOut.mockResolvedValueOnce({ error: 'Błąd wylogowania' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Poczekaj na załadowanie użytkownika
    await waitFor(() => {
      expect(screen.getByText('Zalogowany jako: test@example.com')).toBeInTheDocument();
    });
    
    // Kliknij przycisk wylogowania
    await userEvent.click(screen.getByText('Wyloguj'));
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Błąd wylogowania')).toBeInTheDocument();
    });
  });

  it('powinien wyświetlać błąd gdy nie można pobrać danych użytkownika', async () => {
    // Mockowanie błędu pobierania danych użytkownika
    getCurrentUser.mockRejectedValueOnce(new Error('Błąd pobierania danych użytkownika'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Sprawdzenie czy komunikat błędu jest wyświetlany
    await waitFor(() => {
      expect(screen.getByText('Błąd pobierania danych użytkownika')).toBeInTheDocument();
    });
  });
});