import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AIUsageCounter from '../components/AIUsageCounter';

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [dashboardData, setDashboardData] = useState({
    recipeOfDay: null,
    recentRecipes: [],
    preferences: {
      dietType: 'normal',
      maxCarbs: 0,
      excludedProducts: [],
      allergens: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    if (!session?.access_token) {
      console.log('Brak tokenu dostępu');
      return;
    }

    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
      const response = await axios.get(`${API_BASE}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Błąd podczas pobierania danych dashboardu:', error);
      setError('Nie udało się pobrać danych. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session?.access_token, location.search]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nagłówek */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <AIUsageCounter />
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
            >
              Wyloguj się
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Przepis dnia */}
        {dashboardData?.recipeOfDay && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Przepis dnia
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {dashboardData.recipeOfDay?.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Czas przygotowania: {dashboardData.recipeOfDay?.preparationTime} min • 
                    Poziom trudności: {dashboardData.recipeOfDay?.difficulty}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Węglowodany na porcję: {dashboardData.recipeOfDay?.nutritionalValues?.carbsPerServing}g
                  </p>
                </div>
                <Link
                  to={`/recipes/${dashboardData.recipeOfDay?.id}`}
                  className="btn btn-primary"
                >
                  Zobacz przepis
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Preferencje żywieniowe */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Twoje preferencje</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Typ diety: <span className="font-medium">{dashboardData?.preferences?.dietType}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Max węglowodanów: <span className="font-medium">{dashboardData?.preferences?.maxCarbs}g</span>
                </p>
                {dashboardData?.preferences?.excludedProducts?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Wykluczone produkty: <span className="font-medium">{dashboardData.preferences.excludedProducts.join(', ')}</span>
                  </p>
                )}
                {dashboardData?.preferences?.allergens?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Alergeny: <span className="font-medium">{dashboardData.preferences.allergens.join(', ')}</span>
                  </p>
                )}
              </div>
              <Link
                to="/profile/preferences"
                className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                Edytuj preferencje →
              </Link>
            </div>
          </div>

          {/* Ostatnie przepisy */}
          <div className="bg-white shadow rounded-lg overflow-hidden col-span-2">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Twoje ostatnie przepisy
                </h3>
                <Link
                  to="/recipes"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Zobacz wszystkie →
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {!dashboardData?.recentRecipes?.length ? (
                <li className="px-4 py-5 sm:px-6">
                  <p className="text-gray-500 text-center">Nie masz jeszcze żadnych przepisów</p>
                </li>
              ) : (
                dashboardData.recentRecipes.map((recipe) => (
                  <li key={recipe?.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link to={`/recipes/${recipe?.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{recipe?.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {recipe?.preparationTime} min • {recipe?.difficulty}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {recipe?.createdAt && new Date(recipe.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 