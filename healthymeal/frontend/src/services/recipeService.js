import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Pobiera wszystkie przepisy
 * @param {Object} filters - Filtry wyszukiwania
 * @returns {Promise<Array>} Lista wszystkich przepisów
 */
export const getAllRecipes = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/recipes`, { params: filters });
  return response.data;
};

/**
 * Pobiera przepis dnia
 * @returns {Promise<Object>} Przepis dnia
 */
export const getRecipeOfDay = async () => {
  const response = await axios.get(`${API_URL}/recipes/recipe-of-day`);
  return response.data;
};

/**
 * Pobiera ostatnio dodane przepisy
 * @param {number} limit - Limit przepisów do pobrania
 * @returns {Promise<Array>} Lista ostatnich przepisów
 */
export const getRecentRecipes = async (limit = 5) => {
  const response = await axios.get(`${API_URL}/recipes/recent`, { params: { limit } });
  return response.data;
};

/**
 * Pobiera szczegóły przepisu
 * @param {string} id - ID przepisu
 * @returns {Promise<Object>} Szczegóły przepisu
 */
export const getRecipeById = async (id) => {
  const response = await axios.get(`${API_URL}/recipes/${id}`);
  return response.data;
};

/**
 * Tworzy nowy przepis
 * @param {Object} recipeData - Dane przepisu
 * @returns {Promise<Object>} Utworzony przepis
 */
export const createRecipe = async (recipeData) => {
  const response = await axios.post(`${API_URL}/recipes`, recipeData);
  return response.data;
};

/**
 * Aktualizuje przepis
 * @param {string} id - ID przepisu
 * @param {Object} recipeData - Dane do aktualizacji
 * @returns {Promise<Object>} Zaktualizowany przepis
 */
export const updateRecipe = async (id, recipeData) => {
  const response = await axios.put(`${API_URL}/recipes/${id}`, recipeData);
  return response.data;
};

/**
 * Usuwa przepis
 * @param {string} id - ID przepisu
 * @returns {Promise<void>} Informacja o powodzeniu operacji
 */
export const deleteRecipe = async (id) => {
  const response = await axios.delete(`${API_URL}/recipes/${id}`);
  return response.data;
};

/**
 * Modyfikuje przepis przez AI
 * @param {string} id - ID przepisu
 * @returns {Promise<Object>} Zmodyfikowany przepis
 */
export const modifyRecipeWithAI = async (id) => {
  const response = await axios.post(`${API_URL}/recipes/${id}/modify`);
  return response.data;
}; 