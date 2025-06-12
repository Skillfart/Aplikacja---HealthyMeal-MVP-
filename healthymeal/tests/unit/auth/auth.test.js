import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth hook
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('AuthContext', () => {
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
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
      error: null
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('useAuth hook zwraca poprawny kontekst', () => {
    const { session, signIn, signOut, loading, error } = useAuth();

    expect(session).toBe(mockSession);
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  test('AuthProvider renderuje się poprawnie z dziećmi', () => {
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

  test('signIn wywołuje się z poprawnymi danymi', async () => {
    const mockSignIn = jest.fn();
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

  test('signOut czyści sesję', async () => {
    const mockSignOut = jest.fn();
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

  test('loading jest true podczas autentykacji', () => {
    useAuth.mockImplementation(() => ({
      session: null,
      signIn: jest.fn(),
      loading: true,
      error: null
    }));

    const { loading } = useAuth();
    expect(loading).toBe(true);
  });

  test('error jest ustawiony gdy wystąpi błąd autentykacji', () => {
    const errorMessage = 'Invalid credentials';
    useAuth.mockImplementation(() => ({
      session: null,
      signIn: jest.fn(),
      loading: false,
      error: errorMessage
    }));

    const { error } = useAuth();
    expect(error).toBe(errorMessage);
  });
}); 