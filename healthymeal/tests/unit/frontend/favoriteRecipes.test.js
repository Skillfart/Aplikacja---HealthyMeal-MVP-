// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { useAuth } from '@frontend/contexts/AuthContext';

// Mock dla axios
vi.mock('axios');

// Mock dla useAuth
vi.mock('@frontend/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'test-user-123',
      token: 'test-token'
    }
  }))
}));

describe('Favorite Recipes API', () => {
  const userId = 'test-user-123';
  const recipe1 = { id: 'recipe-1', title: 'Sałatka grecka' };
  const recipe2 = { id: 'recipe-2', title: 'Kurczak curry' };
  const recipe3 = { id: 'recipe-3', title: 'Placki z dyni' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users/favorites', () => {
    it('powinien pobierać ulubione przepisy użytkownika', async () => {
      const mockFavorites = [recipe1, recipe2];
      axios.get.mockResolvedValueOnce({ data: mockFavorites });

      const response = await axios.get('/api/users/favorites', {
        headers: {
          Authorization: `Bearer test-token`
        }
      });

      expect(response.data).toEqual(mockFavorites);
      expect(axios.get).toHaveBeenCalledWith('/api/users/favorites', {
        headers: {
          Authorization: `Bearer test-token`
        }
      });
    });

    it('powinien obsługiwać błąd podczas pobierania ulubionych', async () => {
      const errorMessage = 'Błąd pobierania ulubionych';
      axios.get.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage }
        }
      });

      try {
        await axios.get('/api/users/favorites', {
          headers: {
            Authorization: `Bearer test-token`
          }
        });
      } catch (error) {
        expect(error.response.data.message).toBe(errorMessage);
      }
    });
  });

  describe('DELETE /api/users/favorites/:id', () => {
    it('powinien usuwać przepis z ulubionych', async () => {
      axios.delete.mockResolvedValueOnce({ data: { success: true } });

      await axios.delete(`/api/users/favorites/${recipe1.id}`, {
        headers: {
          Authorization: `Bearer test-token`
        }
      });

      expect(axios.delete).toHaveBeenCalledWith(`/api/users/favorites/${recipe1.id}`, {
        headers: {
          Authorization: `Bearer test-token`
        }
      });
    });

    it('powinien obsługiwać błąd podczas usuwania z ulubionych', async () => {
      const errorMessage = 'Błąd usuwania z ulubionych';
      axios.delete.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage }
        }
      });

      try {
        await axios.delete(`/api/users/favorites/${recipe1.id}`, {
          headers: {
            Authorization: `Bearer test-token`
          }
        });
      } catch (error) {
        expect(error.response.data.message).toBe(errorMessage);
      }
    });
  });
}); 