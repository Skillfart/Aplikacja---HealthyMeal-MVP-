import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const UserPreferences = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [preferences, setPreferences] = useState({
    dietType: 'normal',
    maxCarbs: 0,
    excludedProducts: [],
    allergens: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const dietTypes = [
    { value: 'normal', label: 'Normalna' },
    { value: 'keto', label: 'Ketogeniczna' },
    { value: 'lowCarb', label: 'Niskowęglowodanowa' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'vegetarian', label: 'Wegetariańska' },
    { value: 'vegan', label: 'Wegańska' },
    { value: 'glutenFree', label: 'Bezglutenowa' },
    { value: 'dairyFree', label: 'Bez nabiału' }
  ];

  const commonAllergens = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'dairy', label: 'Nabiał' },
    { value: 'nuts', label: 'Orzechy' },
    { value: 'eggs', label: 'Jajka' },
    { value: 'soy', label: 'Soja' },
    { value: 'shellfish', label: 'Skorupiaki' },
    { value: 'fish', label: 'Ryby' },
    { value: 'peanuts', label: 'Orzeszki ziemne' }
  ];

  // Sprawdź autoryzację
  useEffect(() => {
    if (!session?.access_token) {
      navigate('/login');
    }
  }, [session, navigate]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!session?.access_token) return;

      try {
        setError(null);
        const response = await axios.get('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        setPreferences(response.data.preferences);
      } catch (err) {
        console.error('Błąd podczas pobierania preferencji:', err);
        if (err.response?.status === 401) {
          setError('Sesja wygasła. Zaloguj się ponownie.');
          navigate('/login');
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Nie udało się pobrać preferencji. Spróbuj ponownie później.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [session?.access_token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.access_token) {
      setError('Musisz być zalogowany aby zapisać preferencje');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
      await axios.put(`${API_BASE}/api/users/preferences`, preferences, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Odśwież dane dashboardu
      await axios.get(`${API_BASE}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Błąd podczas aktualizacji preferencji:', err);
      if (err.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.');
        navigate('/login');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Nie udało się zaktualizować preferencji. Spróbuj ponownie później.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExcludedProductChange = (e) => {
    const products = e.target.value
      .split(',')
      .map(product => product.trim())
      .filter(product => product.length > 0);
    setPreferences(prev => ({
      ...prev,
      excludedProducts: products
    }));
  };

  const handleAllergenToggle = (allergen) => {
    setPreferences(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  if (!session?.access_token) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Preferencje żywieniowe
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">
                  Preferencje zostały zaktualizowane pomyślnie!
                </div>
              </div>
            )}

            {/* Typ diety */}
            <div>
              <label htmlFor="dietType" className="block text-sm font-medium text-gray-700">
                Typ diety
              </label>
              <select
                id="dietType"
                value={preferences.dietType}
                onChange={(e) => setPreferences(prev => ({ ...prev, dietType: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {dietTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Maksymalna ilość węglowodanów */}
            <div>
              <label htmlFor="maxCarbs" className="block text-sm font-medium text-gray-700">
                Maksymalna ilość węglowodanów (g)
              </label>
              <input
                type="number"
                id="maxCarbs"
                min="0"
                value={preferences.maxCarbs}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxCarbs: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Wykluczone produkty */}
            <div>
              <label htmlFor="excludedProducts" className="block text-sm font-medium text-gray-700">
                Wykluczone produkty (oddzielone przecinkami)
              </label>
              <input
                type="text"
                id="excludedProducts"
                value={preferences.excludedProducts.join(', ')}
                onChange={handleExcludedProductChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="np. mleko, jajka, orzechy"
              />
            </div>

            {/* Alergeny */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Alergeny
              </span>
              <div className="grid grid-cols-2 gap-4">
                {commonAllergens.map(allergen => (
                  <label key={allergen.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.allergens.includes(allergen.value)}
                      onChange={() => handleAllergenToggle(allergen.value)}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{allergen.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Zapisywanie...' : 'Zapisz preferencje'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences; 