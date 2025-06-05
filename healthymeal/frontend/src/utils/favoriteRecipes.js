/**
 * Funkcje do zarządzania ulubionymi przepisami
 */

import axios from 'axios';

// Nazwa tabeli w bazie danych
const FAVORITES_TABLE = 'user_favorites';
// Prefiks klucza lokalnego storage
const STORAGE_KEY_PREFIX = 'favorites_';

/**
 * Dodaje przepis do ulubionych
 * @param {string} userId - ID użytkownika
 * @param {Object} recipe - Przepis do dodania
 * @returns {Promise<Object>} Odpowiedź z serwera
 */
export const addToFavorites = async (userId, recipe) => {
  try {
    const response = await axios.post('/api/users/favorites', {
      userId,
      recipeId: recipe.id
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Błąd dodawania do ulubionych');
  }
};

/**
 * Usuwa przepis z ulubionych
 * @param {string} userId - ID użytkownika
 * @param {string} recipeId - ID przepisu do usunięcia
 * @returns {Promise<Object>} Odpowiedź z serwera
 */
export const removeFromFavorites = async (userId, recipeId) => {
  try {
    const response = await axios.delete(`/api/users/favorites/${recipeId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Błąd usuwania z ulubionych');
  }
};

/**
 * Sprawdza czy przepis jest w ulubionych
 * @param {string} userId - ID użytkownika
 * @param {string} recipeId - ID przepisu do sprawdzenia
 * @returns {Promise<boolean>} True jeśli przepis jest w ulubionych
 */
export const isFavorite = async (userId, recipeId) => {
  try {
    const response = await axios.get(`/api/users/favorites/${recipeId}`);
    return response.data.isFavorite;
  } catch (error) {
    return false;
  }
};

/**
 * Pobiera wszystkie ulubione przepisy użytkownika
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Array>} Lista ulubionych przepisów
 */
export const getFavoriteRecipes = async (userId) => {
  try {
    const response = await axios.get('/api/users/favorites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Błąd pobierania ulubionych przepisów');
  }
};

/**
 * Zapisuje ulubione przepisy do lokalnego storage
 * @param {string} userId - ID użytkownika
 * @param {Array} favorites - Lista ulubionych przepisów
 */
const saveFavoritesToLocalStorage = (userId, favorites) => {
  if (!userId || !favorites) {
    return;
  }
  
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(favorites));
  } catch (error) {
    console.error('Błąd podczas zapisywania ulubionych do lokalnego storage:', error);
  }
};

/**
 * Pobiera ulubione przepisy z lokalnego storage
 * @param {string} userId - ID użytkownika
 * @returns {Array|null} Lista ulubionych przepisów lub null
 */
const getFavoritesFromLocalStorage = (userId) => {
  if (!userId) {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Błąd podczas pobierania ulubionych z lokalnego storage:', error);
    return [];
  }
};

/**
 * Synchronizuje ulubione przepisy z bazą danych
 * @param {string} userId - ID użytkownika
 * @returns {Promise<void>}
 */
export const syncFavorites = async (userId) => {
  if (!userId) {
    return;
  }
  
  try {
    const response = await axios.get('/api/users/favorites', {
      headers: {
        Authorization: `Bearer ${userId}`
      }
    });
    
    // Zapisz do lokalnego cache
    saveFavoritesToLocalStorage(userId, response.data);
  } catch (error) {
    console.error('Błąd podczas synchronizacji ulubionych przepisów:', error);
  }
}; 