import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from './RecipeCard';
import { useAI } from '../contexts/AIContext';
import { useAuth } from '../contexts/AuthContext';

const RecipeList = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    hashtags: []
  });
  const { incrementUsage } = useAI();

  // Sprawdź autoryzację
  useEffect(() => {
    if (!session?.access_token) {
      navigate('/login');
    }
  }, [session, navigate]);

  const fetchRecipes = async () => {
    if (!session?.access_token) return;
  
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.hashtags.length > 0) params.append('hashtags', filters.hashtags.join(','));
  
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
      
      const response = await axios.get(`${API_BASE}/api/recipes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setRecipes(response.data.recipes);
    } catch (err) {
      console.error('Błąd podczas pobierania przepisów:', err);
      if (err.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.');
        navigate('/login');
      } else {
        setError('Nie udało się pobrać przepisów. Spróbuj ponownie później.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [filters, session?.access_token]);

  const handleModify = async (recipeId) => {
    if (!session?.access_token) {
      setError('Musisz być zalogowany aby modyfikować przepisy');
      return;
    }

    try {
      setError(null);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
      const response = await axios.post(`${API_BASE}/api/recipes/${recipeId}/ai-modify`, {}, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Zaktualizuj licznik AI
      await incrementUsage();
      
      // Dodaj nowy przepis do listy
      setRecipes(prev => [response.data.recipe, ...prev]);
    } catch (err) {
      console.error('Błąd podczas modyfikacji przepisu:', err);
      if (err.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.');
        navigate('/login');
      } else if (err.response?.status === 429) {
        setError('Przekroczono dzienny limit użycia AI');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Nie udało się zmodyfikować przepisu. Spróbuj ponownie później.');
      }
    }
  };

  const handleDelete = async (recipeId) => {
    if (!session?.access_token) {
      setError('Musisz być zalogowany aby usuwać przepisy');
      return;
    }

    if (!window.confirm('Czy na pewno chcesz usunąć ten przepis?')) {
      return;
    }

    try {
      setError(null);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
      await axios.delete(`${API_BASE}/api/recipes/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      setRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
    } catch (err) {
      console.error('Błąd podczas usuwania przepisu:', err);
      if (err.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.');
        navigate('/login');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Nie udało się usunąć przepisu. Spróbuj ponownie później.');
      }
    }
  };

  if (!session?.access_token) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3 mt-4">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filtry */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Szukaj przepisów..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="input input-bordered w-full"
          />
          <input
            type="text"
            placeholder="Tagi (oddzielone przecinkami)"
            value={filters.hashtags.join(', ')}
            onChange={e => setFilters(prev => ({
              ...prev,
              hashtags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }))}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      {/* Lista przepisów */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nie znaleziono żadnych przepisów</p>
          </div>
        ) : (
          recipes.map(recipe => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onModify={handleModify}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeList; 