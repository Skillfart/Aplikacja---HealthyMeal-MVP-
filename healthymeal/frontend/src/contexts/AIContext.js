import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AIContext = createContext(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI musi być używany wewnątrz AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const modifyRecipe = useCallback(async (recipeId, modifications) => {
    try {
      setLoading(true);
      
      // Sprawdzenie limitu dziennego
      if (user.aiUsage?.requestsToday >= 5) {
        throw new Error('Przekroczono dzienny limit modyfikacji AI (5)');
      }

      const response = await api.post(`/ai/modify-recipe/${recipeId}`, modifications);
      
      // Aktualizacja licznika użycia AI
      if (response.data.user) {
        await updateProfile(response.data.user);
      }

      toast({
        title: 'Przepis zmodyfikowany przez AI',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return response.data.recipe;
    } catch (error) {
      toast({
        title: 'Błąd modyfikacji przepisu',
        description: error.message || 'Wystąpił błąd podczas modyfikacji przepisu przez AI',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, updateProfile, toast]);

  const generateRecipe = useCallback(async (preferences) => {
    try {
      setLoading(true);
      
      // Sprawdzenie limitu dziennego
      if (user.aiUsage?.requestsToday >= 5) {
        throw new Error('Przekroczono dzienny limit generowania przepisów AI (5)');
      }

      const response = await api.post('/ai/generate-recipe', preferences);
      
      // Aktualizacja licznika użycia AI
      if (response.data.user) {
        await updateProfile(response.data.user);
      }

      toast({
        title: 'Wygenerowano nowy przepis',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return response.data.recipe;
    } catch (error) {
      toast({
        title: 'Błąd generowania przepisu',
        description: error.message || 'Wystąpił błąd podczas generowania przepisu przez AI',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, updateProfile, toast]);

  const value = {
    loading,
    modifyRecipe,
    generateRecipe,
    remainingRequests: user?.aiUsage ? 5 - user.aiUsage.requestsToday : 5
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export default AIContext; 