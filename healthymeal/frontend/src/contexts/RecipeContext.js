import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import api from '../services/api';

const RecipeContext = createContext(null);

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe musi być używany wewnątrz RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/recipes');
      setRecipes(response.data);
    } catch (error) {
      toast({
        title: 'Błąd pobierania przepisów',
        description: error.response?.data?.message || 'Wystąpił błąd podczas pobierania przepisów',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getRecipeById = useCallback(async (id) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      toast({
        title: 'Błąd pobierania przepisu',
        description: error.response?.data?.message || 'Wystąpił błąd podczas pobierania przepisu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  }, [toast]);

  const createRecipe = useCallback(async (recipeData) => {
    try {
      const response = await api.post('/recipes', recipeData);
      setRecipes(prev => [...prev, response.data]);
      toast({
        title: 'Przepis utworzony',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return response.data;
    } catch (error) {
      toast({
        title: 'Błąd tworzenia przepisu',
        description: error.response?.data?.message || 'Wystąpił błąd podczas tworzenia przepisu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  }, [toast]);

  const updateRecipe = useCallback(async (id, recipeData) => {
    try {
      const response = await api.put(`/recipes/${id}`, recipeData);
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? response.data : recipe
      ));
      toast({
        title: 'Przepis zaktualizowany',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return response.data;
    } catch (error) {
      toast({
        title: 'Błąd aktualizacji przepisu',
        description: error.response?.data?.message || 'Wystąpił błąd podczas aktualizacji przepisu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  }, [toast]);

  const deleteRecipe = useCallback(async (id) => {
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      toast({
        title: 'Przepis usunięty',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd usuwania przepisu',
        description: error.response?.data?.message || 'Wystąpił błąd podczas usuwania przepisu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  }, [toast]);

  const value = {
    recipes,
    loading,
    fetchRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

export default RecipeContext; 