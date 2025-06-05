import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3031/api';

/**
 * Pobierz preferencje użytkownika
 * @returns {Promise<Object>} Preferencje użytkownika
 */
export const getPreferences = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/preferences`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Aktualizuj preferencje użytkownika
 * @param {Object} updates - Aktualizacje do wprowadzenia
 * @returns {Promise<Object>} Zaktualizowane preferencje
 */
export const updatePreferences = async (updates) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/preferences`, updates, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Dodaj przepis do ulubionych
 * @param {string} recipeId - ID przepisu
 * @returns {Promise<Object>} Zaktualizowane preferencje
 */
export const addToFavorites = async (recipeId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/preferences/favorites`, { recipeId }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Usuń przepis z ulubionych
 * @param {string} recipeId - ID przepisu
 * @returns {Promise<Object>} Zaktualizowane preferencje
 */
export const removeFromFavorites = async (recipeId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/preferences/favorites/${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Dodaj przepis do ostatnio oglądanych
 * @param {string} recipeId - ID przepisu
 * @returns {Promise<Object>} Zaktualizowane preferencje
 */
export const addToRecent = async (recipeId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/preferences/recent`, { recipeId }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}; 