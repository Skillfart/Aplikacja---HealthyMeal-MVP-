import axios from 'axios';
import supabase from '../config/supabaseClient';
import { API_CONFIG } from '../config/constants';

const API_URL = API_CONFIG.BASE_URL;

/**
 * Pobiera preferencje zalogowanego użytkownika
 * @returns {Promise<Object>} Obiekt z preferencjami użytkownika
 */
export const getUserPreferences = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Brak tokenu autoryzacji');
    }

    console.log('Pobieranie preferencji użytkownika...');
    const response = await axios.get(`${API_URL}/users/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Pobrano preferencje:', response.data);
    return response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania preferencji:', error);
    if (error.response) {
      console.error('Odpowiedź serwera:', error.response.data);
    }
    throw error;
  }
};

/**
 * Aktualizuje preferencje zalogowanego użytkownika
 * @param {Object} preferences - Nowe preferencje użytkownika
 * @param {string} preferences.dietType - Typ diety
 * @param {number} preferences.maxCarbs - Maksymalna ilość węglowodanów
 * @param {string[]} preferences.excludedProducts - Lista wykluczonych produktów
 * @param {string[]} preferences.allergens - Lista alergenów
 * @returns {Promise<Object>} Zaktualizowane preferencje użytkownika
 */
export const updateUserPreferences = async (preferences) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Brak tokenu autoryzacji');
    }

    console.log('Aktualizacja preferencji użytkownika:', preferences);
    const response = await axios.put(`${API_URL}/users/preferences`, preferences, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Zaktualizowano preferencje:', response.data);
    return response.data;
  } catch (error) {
    console.error('Błąd podczas aktualizacji preferencji:', error);
    if (error.response) {
      console.error('Odpowiedź serwera:', error.response.data);
    }
    throw error;
  }
};

export const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}; 