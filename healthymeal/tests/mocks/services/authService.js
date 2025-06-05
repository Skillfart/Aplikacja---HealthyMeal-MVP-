// Mock dla usługi autoryzacji
import { vi } from 'vitest';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User'
  }
};

export const signIn = vi.fn().mockResolvedValue({ 
  data: { user: mockUser },
  error: null 
});

export const signUp = vi.fn().mockResolvedValue({ 
  data: { user: mockUser },
  error: null 
});

export const signOut = vi.fn().mockResolvedValue({
  error: null
});

export const getCurrentUser = vi.fn().mockResolvedValue({ 
  data: { user: mockUser },
  error: null 
});

export const updateProfile = vi.fn().mockResolvedValue({
  data: { user: mockUser },
  error: null
});

export const resetPassword = vi.fn().mockResolvedValue({
  data: {},
  error: null
});

export default {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  updateProfile,
  resetPassword
}; 