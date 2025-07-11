// __mocks__/AuthContext.jsx - Mock AuthContext dla testów
import React, { createContext, useContext } from 'react';

const AuthContext = createContext({});

// Mock hook
export const useAuth = () => ({
  session: {
    access_token: 'mock-token',
    user: {
      id: 'mock-user-id',
      email: 'test@example.com'
    }
  },
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    access_token: 'mock-token'
  },
  loading: false,
  error: null,
  signIn: jest.fn(() => Promise.resolve({ error: null })),
  signUp: jest.fn(() => Promise.resolve({ error: null })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  refreshData: jest.fn()
});

// Mock Provider
export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={useAuth()}>
      {children}
    </AuthContext.Provider>
  );
}; 