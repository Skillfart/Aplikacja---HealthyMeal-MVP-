import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../frontend/src/contexts/AuthContext';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn()
      })
    })
  })
};

// Mock komponent testowy
// Mock komponent testowy  
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('🧪 AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('renderuje się bez błędów', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('dostarcza stan loading na początku', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('dostarcza stan no-user gdy nie zalogowany', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });
  });

  describe('useAuth hook', () => {
    it('zwraca funkcje autoryzacji', () => {
      const TestHook = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="has-login">{typeof auth.login === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-logout">{typeof auth.logout === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-register">{typeof auth.register === 'function' ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestHook />
        </AuthProvider>
      );

      expect(screen.getByTestId('has-login')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-logout')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-register')).toHaveTextContent('yes');
    });

    it('obsługuje stan zalogowanego użytkownika', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      };
      
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } } 
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('obsługuje logowanie użytkownika', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com' 
      };
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password'
        });
      });
    });

    it('obsługuje błędy logowania', async () => {
      const mockError = { message: 'Invalid credentials' };
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const TestErrorComponent = () => {
        const { login, error } = useAuth();
        
        return (
          <div>
            <div data-testid="error">{error || 'no-error'}</div>
            <button onClick={() => login('test@example.com', 'wrong-password')}>
              Login
            </button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestErrorComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });
    });

    it('obsługuje wylogowanie', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Stan loading', () => {
    it('pokazuje loading podczas sprawdzania sesji', () => {
      mockSupabase.auth.getSession.mockReturnValue(new Promise(() => {})); // Nigdy się nie kończy

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('ukrywa loading po sprawdzeniu sesji', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });
}); 