import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../../../frontend/src/contexts/AuthContext';
import { renderHook, act } from '@testing-library/react';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('powinien zalogować użytkownika', async () => {
    const { result } = renderHook(() => useAuth());
    
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = {
      user: { id: '123', email: mockCredentials.email },
      token: 'mock-token'
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    await act(async () => {
      await result.current.login(mockCredentials.email, mockCredentials.password);
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(localStorage.getItem('token')).toBe(mockResponse.token);
  });

  it('powinien wylogować użytkownika', async () => {
    const { result } = renderHook(() => useAuth());
    
    localStorage.setItem('token', 'mock-token');
    
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('powinien zarejestrować nowego użytkownika', async () => {
    const { result } = renderHook(() => useAuth());
    
    const mockUser = {
      email: 'new@example.com',
      password: 'password123'
    };

    const mockResponse = {
      user: { id: '456', email: mockUser.email },
      token: 'new-mock-token'
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    await act(async () => {
      await result.current.register(mockUser.email, mockUser.password);
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(localStorage.getItem('token')).toBe(mockResponse.token);
  });

  it('powinien obsłużyć błędy logowania', async () => {
    const { result } = renderHook(() => useAuth());
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid credentials'
      })
    });

    let error;
    await act(async () => {
      try {
        await result.current.login('wrong@example.com', 'wrongpass');
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
}); 