// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServer } from '@utils/testServer';
import { generateToken } from '@utils/auth';
import { validateRequest } from '@middleware/security';

describe('Testy bezpieczeństwa API', () => {
  let server;

  beforeEach(() => {
    server = createServer();
  });

  describe('Ochrona przed atakami', () => {
    it('powinien blokować nieautoryzowane żądania', async () => {
      const response = await server.get('/api/recipes');
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Brak autoryzacji');
    });

    it('powinien blokować niepoprawne tokeny', async () => {
      const response = await server.get('/api/recipes', {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Niepoprawny token');
    });

    it('powinien blokować ataki XSS w danych wejściowych', async () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>',
        description: 'Test<script>alert("XSS")</script>'
      };

      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.post('/api/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: maliciousData
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Nieprawidłowe dane wejściowe');
    });

    it('powinien blokować ataki SQL Injection', async () => {
      const maliciousQuery = "'; DROP TABLE recipes; --";
      
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.get(`/api/recipes?search=${maliciousQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Nieprawidłowe dane wejściowe');
    });

    it('powinien blokować ataki CSRF', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.post('/api/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Test Recipe',
          description: 'Test Description'
        }
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Brak tokenu CSRF');
    });

    it('powinien blokować ataki DoS', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const requests = Array(100).fill().map(() => 
        server.get('/api/recipes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const responses = await Promise.all(requests);
      const blockedRequests = responses.filter(r => r.status === 429);
      
      expect(blockedRequests.length).toBeGreaterThan(0);
      expect(blockedRequests[0].body.error).toContain('Zbyt wiele żądań');
    });
  });

  describe('Ograniczenia dostępu', () => {
    it('powinien ograniczać dostęp do zasobów innych użytkowników', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.get('/api/users/2/recipes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Brak dostępu');
    });

    it('powinien wymagać uprawnień admina do zarządzania użytkownikami', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.get('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Brak uprawnień');
    });

    it('powinien ograniczać dostęp do wrażliwych danych', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.get('/api/users/1', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('email');
    });
  });

  describe('Walidacja danych', () => {
    it('powinien walidować dane wejściowe', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.post('/api/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: '', // Puste pole
          description: 'Test Description'
        }
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Nazwa jest wymagana');
    });

    it('powinien walidować typy danych', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.post('/api/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Test Recipe',
          preparationTime: 'invalid' // Niepoprawny typ
        }
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Niepoprawny typ danych');
    });

    it('powinien walidować rozmiar danych', async () => {
      const token = generateToken({ id: '1', role: 'user' });
      const response = await server.post('/api/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Test Recipe',
          description: 'a'.repeat(10001) // Zbyt długi opis
        }
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Przekroczono maksymalny rozmiar danych');
    });
  });

  describe('Bezpieczeństwo nagłówków', () => {
    it('powinien ustawiać odpowiednie nagłówki bezpieczeństwa', async () => {
      const response = await server.get('/api/recipes');
      
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(response.headers).toHaveProperty('strict-transport-security');
      expect(response.headers).toHaveProperty('content-security-policy');
    });

    it('powinien blokować niebezpieczne nagłówki', async () => {
      const response = await server.get('/api/recipes', {
        headers: {
          'X-Forwarded-For': '1.1.1.1',
          'X-Real-IP': '2.2.2.2'
        }
      });

      expect(response.headers).not.toHaveProperty('x-forwarded-for');
      expect(response.headers).not.toHaveProperty('x-real-ip');
    });
  });

  describe('Obsługa błędów', () => {
    it('powinien ukrywać szczegóły błędów w produkcji', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await server.get('/api/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
      expect(response.body).not.toHaveProperty('stack');
    });

    it('powinien logować błędy bezpieczeństwa', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      await server.get('/api/recipes', {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('Security error');
    });
  });
}); 