import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const RecipeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        setError(null);
        
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
        const response = await axios.get(`${API_BASE}/api/recipes/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setRecipe(response.data);
      } catch (err) {
        console.error('Błąd podczas pobierania przepisu:', err);
        if (err.response?.status === 401) {
          setError('Sesja wygasła. Zaloguj się ponownie.');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Przepis nie został znaleziony.');
        } else {
          setError('Nie udało się pobrać przepisu. Spróbuj ponownie później.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, session?.access_token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{recipe?.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Informacje</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Czas przygotowania:</dt>
                    <dd className="text-sm text-gray-900">{recipe?.preparationTime} min</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Poziom trudności:</dt>
                    <dd className="text-sm text-gray-900">{recipe?.difficulty}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Węglowodany/porcja:</dt>
                    <dd className="text-sm text-gray-900">{recipe?.nutritionalValues?.carbsPerServing}g</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tagi</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe?.hashtags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Składniki</h3>
              <ul className="space-y-2">
                {recipe?.ingredients?.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Instrukcje</h3>
              <ol className="space-y-4">
                {recipe?.instructions?.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails; 