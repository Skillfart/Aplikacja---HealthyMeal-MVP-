import { renderHook, act } from '@testing-library/react';
import { useAIUsage } from '../../../../frontend/src/hooks/useAIUsage';
import { useAuth } from '../../../../frontend/src/contexts/AuthContext';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../../frontend/src/contexts/AuthContext');

describe('useAIUsage', () => {
  const mockUser = {
    access_token: 'valid-jwt-token',
    id: 'user123',
    email: 'test@example.com'
  };

  const mockUsageData = {
    current: 3,
    limit: 5,
    remaining: 2
  };

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser
    });
    
    axios.get.mockResolvedValue({
      data: mockUsageData
    });
    
    axios.post.mockResolvedValue({
      data: { ...mockUsageData, current: 4, remaining: 1 }
    });
    
    jest.clearAllMocks();
  });

  describe('Initial state', () => {
    test('should return initial state', () => {
      const { result } = renderHook(() => useAIUsage());

      expect(result.current.usage).toEqual({
        current: 0,
        limit: 5,
        remaining: 5
      });
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('fetchUsage', () => {
    test('should fetch usage data successfully', async () => {
      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        await result.current.fetchUsage();
      });

      expect(axios.get).toHaveBeenCalledWith('/api/users/ai-usage', {
        headers: {
          Authorization: 'Bearer valid-jwt-token'
        }
      });
      expect(result.current.usage).toEqual(mockUsageData);
      expect(result.current.error).toBeNull();
    });

    test('should handle error when fetching usage', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        try {
          await result.current.fetchUsage();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Nie udało się pobrać danych o użyciu AI');
      expect(result.current.usage).toEqual({
        current: 0,
        limit: 5,
        remaining: 5
      });
    });

    test('should not fetch if no user token', async () => {
      useAuth.mockReturnValue({
        user: null
      });

      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        await result.current.fetchUsage();
      });

      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should set loading state correctly', async () => {
      const { result } = renderHook(() => useAIUsage());

      let loadingStates = [];
      
      await act(async () => {
        loadingStates.push(result.current.loading);
        const promise = result.current.fetchUsage();
        loadingStates.push(result.current.loading);
        await promise;
        loadingStates.push(result.current.loading);
      });

      expect(loadingStates).toEqual([false, true, false]);
    });
  });

  describe('incrementUsage', () => {
    test('should increment usage successfully', async () => {
      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        await result.current.incrementUsage();
      });

      expect(axios.post).toHaveBeenCalledWith('/api/users/ai-usage', {}, {
        headers: {
          Authorization: 'Bearer valid-jwt-token'
        }
      });
      expect(result.current.usage).toEqual({
        current: 4,
        limit: 5,
        remaining: 1
      });
      expect(result.current.error).toBeNull();
    });

    test('should handle 429 error (limit exceeded)', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: { error: 'Przekroczono dzienny limit' }
        }
      };
      axios.post.mockRejectedValue(errorResponse);

      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        try {
          await result.current.incrementUsage();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Przekroczono dzienny limit użycia AI');
    });

    test('should handle generic error', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: 'Server error' }
        }
      };
      axios.post.mockRejectedValue(errorResponse);

      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        try {
          await result.current.incrementUsage();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Nie udało się zaktualizować licznika AI');
    });

    test('should not increment if no user token', async () => {
      useAuth.mockReturnValue({
        user: null
      });

      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        await result.current.incrementUsage();
      });

      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('Loading states', () => {
    test('should manage loading state for incrementUsage', async () => {
      const { result } = renderHook(() => useAIUsage());

      let loadingStates = [];
      
      await act(async () => {
        loadingStates.push(result.current.loading);
        const promise = result.current.incrementUsage();
        loadingStates.push(result.current.loading);
        await promise;
        loadingStates.push(result.current.loading);
      });

      expect(loadingStates).toEqual([false, true, false]);
    });
  });

  describe('Error handling', () => {
    test('should clear error on successful operation', async () => {
      const { result } = renderHook(() => useAIUsage());

      // First set an error
      axios.get.mockRejectedValue(new Error('Network Error'));
      
      await act(async () => {
        try {
          await result.current.fetchUsage();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Nie udało się pobrać danych o użyciu AI');

      // Then clear error with successful operation
      axios.get.mockResolvedValue({ data: mockUsageData });
      
      await act(async () => {
        await result.current.fetchUsage();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Multiple operations', () => {
    test('should handle multiple fetchUsage calls correctly', async () => {
      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        await Promise.all([
          result.current.fetchUsage(),
          result.current.fetchUsage(),
          result.current.fetchUsage()
        ]);
      });

      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(result.current.usage).toEqual(mockUsageData);
    });

    test('should handle increment followed by fetch', async () => {
      const { result } = renderHook(() => useAIUsage());

      await act(async () => {
        await result.current.incrementUsage();
        await result.current.fetchUsage();
      });

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result.current.usage).toEqual(mockUsageData);
    });
  });
}); 