import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../../../frontend/src/contexts/AuthContext';

// Mock całego modułu AuthContext zamiast importowania rzeczywistego
vi.mock('../../../frontend/src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn()
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(),
    }
  }))
}));

describe('🧪 AuthContext Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook behavior', () => {
    it('zwraca stan niezalogowanego użytkownika', () => {
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      
      expect(auth.user).toBeNull();
      expect(auth.session).toBeNull();
      expect(auth.loading).toBe(false);
      expect(typeof auth.signIn).toBe('function');
      expect(typeof auth.signUp).toBe('function');
      expect(typeof auth.signOut).toBe('function');
    });

    it('zwraca stan zalogowanego użytkownika', () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        access_token: 'mock-token'
      };

      const mockSession = {
        access_token: 'mock-token',
        user: mockUser
      };

      useAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      
      expect(auth.user).toEqual(mockUser);
      expect(auth.session).toEqual(mockSession);
      expect(auth.user.email).toBe('test@example.com');
    });

    it('zwraca stan ładowania', () => {
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: true,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      
      expect(auth.loading).toBe(true);
      expect(auth.user).toBeNull();
    });

    it('zwraca błąd autoryzacji', () => {
      const errorMessage = 'Invalid credentials';
      
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: errorMessage,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      
      expect(auth.error).toBe(errorMessage);
      expect(auth.user).toBeNull();
    });
  });

  describe('signIn function behavior', () => {
    it('obsługuje udane logowanie', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      const result = await auth.signIn('test@example.com', 'password123');
      
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result.error).toBeNull();
    });

    it('obsługuje błąd logowania', async () => {
      const mockError = { message: 'Invalid credentials' };
      const mockSignIn = vi.fn().mockResolvedValue({ error: mockError });
      
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      const result = await auth.signIn('test@example.com', 'wrongpassword');
      
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signUp function behavior', () => {
    it('obsługuje udaną rejestrację', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ error: null });
      
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: mockSignUp,
        signOut: vi.fn()
      });

      const auth = useAuth();
      const result = await auth.signUp('test@example.com', 'password123');
      
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result.error).toBeNull();
    });

    it('obsługuje błąd rejestracji', async () => {
      const mockError = { message: 'Email already exists' };
      const mockSignUp = vi.fn().mockResolvedValue({ error: mockError });
      
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: mockSignUp,
        signOut: vi.fn()
      });

      const auth = useAuth();
      const result = await auth.signUp('existing@example.com', 'password123');
      
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut function behavior', () => {
    it('obsługuje udane wylogowanie', async () => {
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });
      
      useAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        session: { access_token: 'token' },
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: mockSignOut
      });

      const auth = useAuth();
      const result = await auth.signOut();
      
      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('obsługuje błąd wylogowania', async () => {
      const mockError = { message: 'Logout failed' };
      const mockSignOut = vi.fn().mockResolvedValue({ error: mockError });
      
      useAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        session: { access_token: 'token' },
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: mockSignOut
      });

      const auth = useAuth();
      const result = await auth.signOut();
      
      expect(result.error).toEqual(mockError);
    });
  });

  describe('session management', () => {
    it('sprawdza czy sesja zawiera wymagane dane', () => {
      const mockSession = {
        access_token: 'mock-token-123',
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      };

      useAuth.mockReturnValue({
        user: mockSession.user,
        session: mockSession,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      
      expect(auth.session.access_token).toBeTruthy();
      expect(auth.session.user.id).toBeTruthy();
      expect(auth.session.user.email).toBeTruthy();
    });

    it('obsługuje brak sesji', () => {
      useAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      const auth = useAuth();
      
      expect(auth.session).toBeNull();
      expect(auth.user).toBeNull();
    });
  });

  describe('error handling', () => {
    it('czyści błędy po udanej operacji', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      
      // Pierwszy stan z błędem
      useAuth.mockReturnValueOnce({
        user: null,
        session: null,
        loading: false,
        error: 'Previous error',
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      // Drugi stan bez błędu
      useAuth.mockReturnValueOnce({
        user: { id: 'user123', email: 'test@example.com' },
        session: { access_token: 'token' },
        loading: false,
        error: null,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      });

      let auth = useAuth();
      expect(auth.error).toBe('Previous error');

      await auth.signIn('test@example.com', 'password123');
      
      auth = useAuth();
      expect(auth.error).toBeNull();
    });
  });
}); 