import { useState, useEffect } from 'react';
import axios from 'axios';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [hashtagFilter, setHashtagFilter] = useState([]);

  const limit = 10;

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        search: searchTerm,
        hashtags: hashtagFilter.join(',')
      };

      const response = await axios.get('/api/recipes', { params });
      
      setRecipes(response.data.recipes);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const createRecipe = async (recipeData) => {
    try {
      const response = await axios.post('/api/recipes', recipeData);
      setRecipes(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  const updateRecipe = async (id, recipeData) => {
    try {
      const response = await axios.put(`/api/recipes/${id}`, recipeData);
      setRecipes(prev => prev.map(recipe => 
        recipe._id === id ? response.data : recipe
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes(prev => prev.filter(recipe => recipe._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [page, searchTerm, hashtagFilter]);

  return {
    recipes,
    loading,
    error,
    total,
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    hashtagFilter,
    setHashtagFilter,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refetch: fetchRecipes
  };
}; 