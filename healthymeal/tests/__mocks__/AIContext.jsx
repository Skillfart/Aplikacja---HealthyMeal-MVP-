// __mocks__/AIContext.jsx - Mock AIContext dla testów
import React, { createContext, useContext } from 'react';

const AIContext = createContext({});

// Mock hook
export const useAI = () => ({
  usage: {
    count: 0,
    remaining: 10,
    limit: 10
  },
  loading: false,
  error: null,
  incrementUsage: jest.fn(),
  resetUsage: jest.fn()
});

// Mock Provider
export const AIProvider = ({ children }) => {
  return (
    <AIContext.Provider value={useAI()}>
      {children}
    </AIContext.Provider>
  );
}; 