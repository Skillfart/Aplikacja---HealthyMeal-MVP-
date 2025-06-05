// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signIn, signUp, signOut, getCurrentUser } from '@services/authService';
import { validatePassword, validateEmail, validateToken } from '@utils/security';

describe('Testy bezpieczeństwa autentykacji', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Walidacja hasła', () => {
    it('powinien odrzucić zbyt krótkie hasło', () => {
      const result = validatePassword('abc123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hasło musi mieć minimum 8 znaków');
    });

    it('powinien odrzucić hasło bez wielkiej litery', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hasło musi zawierać wielką literę');
    });

    it('powinien odrzucić hasło bez cyfry', () => {
      const result = validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hasło musi zawierać cyfrę');
    });

    it('powinien odrzucić hasło bez znaku specjalnego', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hasło musi zawierać znak specjalny');
    });

    it('powinien zaakceptować poprawne hasło', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Walidacja emaila', () => {
    it('powinien odrzucić niepoprawny format emaila', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Niepoprawny format adresu email');
    });

    it('powinien odrzucić email bez domeny', () => {
      const result = validateEmail('user@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Niepoprawny format adresu email');
    });

    it('powinien zaakceptować poprawny email', () => {
      const result = validateEmail('user@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Walidacja tokenu', () => {
    it('powinien odrzucić niepoprawny token', () => {
      const result = validateToken('invalid-token');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Niepoprawny token');
    });

    it('powinien odrzucić wygasły token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9';
      const result = validateToken(expiredToken);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Token wygasł');
    });

    it('powinien zaakceptować poprawny token', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9';
      const result = validateToken(validToken);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Ochrona przed atakami', () => {
    it('powinien blokować zbyt częste próby logowania', async () => {
      const email = 'test@example.com';
      const password = 'wrong-password';

      // Symulacja 5 nieudanych prób logowania
      for (let i = 0; i < 5; i++) {
        await signIn(email, password);
      }

      // Próba zalogowania po zablokowaniu
      const result = await signIn(email, password);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Zbyt wiele nieudanych prób logowania');
    });

    it('powinien wymagać silnego hasła przy rejestracji', async () => {
      const result = await signUp({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Hasło nie spełnia wymagań bezpieczeństwa');
    });

    it('powinien unieważniać wszystkie sesje po zmianie hasła', async () => {
      // Symulacja zalogowania
      const loginResult = await signIn('test@example.com', 'old-password');
      expect(loginResult.success).toBe(true);

      // Symulacja zmiany hasła
      await changePassword('old-password', 'new-password');

      // Próba użycia starego tokenu
      const userResult = await getCurrentUser(loginResult.token);
      expect(userResult.success).toBe(false);
      expect(userResult.error).toContain('Token unieważniony');
    });

    it('powinien wymagać potwierdzenia emaila', async () => {
      const result = await signUp({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      });

      expect(result.success).toBe(true);
      expect(result.requiresEmailVerification).toBe(true);

      // Próba zalogowania przed potwierdzeniem emaila
      const loginResult = await signIn('test@example.com', 'Password123!');
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Email nie został potwierdzony');
    });

    it('powinien chronić przed atakiem XSS w danych użytkownika', async () => {
      const maliciousName = '<script>alert("XSS")</script>';
      
      const result = await signUp({
        email: 'test@example.com',
        password: 'Password123!',
        name: maliciousName
      });

      expect(result.success).toBe(true);
      expect(result.user.name).not.toContain('<script>');
      expect(result.user.name).toContain('&lt;script&gt;');
    });

    it('powinien chronić przed atakiem SQL Injection', async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      
      const result = await signIn(maliciousEmail, 'Password123!');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Niepoprawny format adresu email');
    });
  });

  describe('Bezpieczeństwo sesji', () => {
    it('powinien unieważniać sesję po określonym czasie', async () => {
      // Symulacja zalogowania
      const loginResult = await signIn('test@example.com', 'Password123!');
      expect(loginResult.success).toBe(true);

      // Symulacja upływu czasu sesji
      vi.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 godziny

      // Próba użycia wygasłego tokenu
      const userResult = await getCurrentUser(loginResult.token);
      expect(userResult.success).toBe(false);
      expect(userResult.error).toContain('Sesja wygasła');
    });

    it('powinien unieważniać wszystkie sesje po wylogowaniu', async () => {
      // Symulacja zalogowania
      const loginResult = await signIn('test@example.com', 'Password123!');
      expect(loginResult.success).toBe(true);

      // Wylogowanie
      await signOut(loginResult.token);

      // Próba użycia tokenu po wylogowaniu
      const userResult = await getCurrentUser(loginResult.token);
      expect(userResult.success).toBe(false);
      expect(userResult.error).toContain('Token unieważniony');
    });

    it('powinien wymagać ponownego logowania po zmianie uprawnień', async () => {
      // Symulacja zalogowania
      const loginResult = await signIn('test@example.com', 'Password123!');
      expect(loginResult.success).toBe(true);

      // Symulacja zmiany uprawnień
      await updateUserPermissions('test@example.com', ['admin']);

      // Próba użycia starego tokenu
      const userResult = await getCurrentUser(loginResult.token);
      expect(userResult.success).toBe(false);
      expect(userResult.error).toContain('Token wymaga odświeżenia');
    });
  });
});