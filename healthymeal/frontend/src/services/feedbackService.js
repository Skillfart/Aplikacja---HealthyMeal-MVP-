import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Pobiera listę zgłoszeń użytkownika
 * @param {Object} filters - Filtry wyszukiwania
 * @returns {Promise<Array>} Lista zgłoszeń
 */
export const getFeedbacks = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/feedback`, { params: filters });
  return response.data;
};

/**
 * Pobiera szczegóły zgłoszenia
 * @param {string} id - ID zgłoszenia
 * @returns {Promise<Object>} Szczegóły zgłoszenia
 */
export const getFeedbackById = async (id) => {
  const response = await axios.get(`${API_URL}/feedback/${id}`);
  return response.data;
};

/**
 * Tworzy nowe zgłoszenie
 * @param {Object} feedbackData - Dane zgłoszenia
 * @returns {Promise<Object>} Utworzone zgłoszenie
 */
export const createFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_URL}/feedback`, feedbackData);
  return response.data;
};

/**
 * Aktualizuje zgłoszenie
 * @param {string} id - ID zgłoszenia
 * @param {Object} feedbackData - Dane do aktualizacji
 * @returns {Promise<Object>} Zaktualizowane zgłoszenie
 */
export const updateFeedback = async (id, feedbackData) => {
  const response = await axios.put(`${API_URL}/feedback/${id}`, feedbackData);
  return response.data;
};

/**
 * Wysyła nowe zgłoszenie
 * @param {Object} feedbackData - Dane zgłoszenia
 * @returns {Promise<Object>} Utworzone zgłoszenie z potwierdzeniem wysłania
 */
export const submitFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_URL}/feedback`, feedbackData);
  return response.data;
}; 