import React, { createContext, useContext } from 'react';
import { useAIUsage } from '../hooks/useAIUsage';

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const aiUsage = useAIUsage();

  return (
    <AIContext.Provider value={aiUsage}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext; 