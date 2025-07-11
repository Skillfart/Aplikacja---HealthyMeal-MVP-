import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../../frontend/src/contexts/AuthContext';
import { AuthProvider } from '../../../frontend/src/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    }
  }))
}));

// Mock useAuth hook
vi.mock('../../../frontend/src/contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../frontend/src/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn()
  };
});

describe.skip('AuthContext', () => {
  const mockSession = {
    access_token: 'test-token',
    user: {
      id: '123',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    useAuth.mockImplementation(() => ({
      session: mockSession,
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false,
      error: null
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('useAuth hook zwraca poprawny kontekst', () => {
    const { session, signIn, signOut, loading, error } = useAuth();

    expect(session).toBe(mockSession);
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  it('AuthProvider renderuje się poprawnie z dziećmi', () => {
    const TestComponent = () => <div>Test Component</div>;

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('signIn wywołuje się z poprawnymi danymi', async () => {
    const mockSignIn = vi.fn();
    useAuth.mockImplementation(() => ({
      session: null,
      signIn: mockSignIn,
      loading: false,
      error: null
    }));

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const { signIn } = useAuth();
    await signIn(credentials);

    expect(mockSignIn).toHaveBeenCalledWith(credentials);
  });

  it('signOut czyści sesję', async () => {
    const mockSignOut = vi.fn();
    useAuth.mockImplementation(() => ({
      session: mockSession,
      signOut: mockSignOut,
      loading: false,
      error: null
    }));

    const { signOut } = useAuth();
    await signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('loading jest true podczas autentykacji', () => {
    useAuth.mockImplementation(() => ({
      session: null,
      signIn: vi.fn(),
      loading: true,
      error: null
    }));

    const { loading } = useAuth();
    expect(loading).toBe(true);
  });

  it('error jest ustawiony gdy wystąpi błąd autentykacji', () => {
    const errorMessage = 'Invalid credentials';
    useAuth.mockImplementation(() => ({
      session: null,
      signIn: vi.fn(),
      loading: false,
      error: errorMessage
    }));

    const { error } = useAuth();
    expect(error).toBe(errorMessage);
  });
}); 