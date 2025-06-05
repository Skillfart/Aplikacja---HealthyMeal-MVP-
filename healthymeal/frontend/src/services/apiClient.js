import axios from 'axios';
import supabase from '../config/supabaseClient';
import { API_CONFIG } from '../config/constants';

// Konfiguracja bazowa
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Interceptor dodający token do żądań
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  } catch (error) {
    console.error('Błąd podczas dodawania tokenu:', error);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

// Interceptor obsługujący odpowiedzi
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jeśli błąd 401 i nie próbowaliśmy jeszcze odświeżyć tokenu
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Próba odświeżenia sesji
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;

        // Jeśli udało się odświeżyć token, ponów żądanie
        if (session) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Błąd odświeżania sesji:', refreshError);
        // Przekieruj do strony logowania lub wyloguj użytkownika
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Metody pomocnicze
const api = {
  // Użytkownicy
  users: {
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (data) => apiClient.put('/api/users/profile', data),
    getPreferences: () => apiClient.get('/api/users/preferences'),
    updatePreferences: (data) => apiClient.put('/api/users/preferences', data)
  },

  // Przepisy
  recipes: {
    getAll: (params) => apiClient.get('/api/recipes', { params }),
    getById: (id) => apiClient.get(`/api/recipes/${id}`),
    create: (data) => apiClient.post('/api/recipes', data),
    update: (id, data) => apiClient.put(`/api/recipes/${id}`, data),
    delete: (id) => apiClient.delete(`/api/recipes/${id}`),
    search: (query) => apiClient.get('/api/recipes/search', { params: { query } })
  },

  // AI
  ai: {
    generateRecipe: (params) => apiClient.post('/api/ai/generate-recipe', params),
    analyzeRecipe: (data) => apiClient.post('/api/ai/analyze-recipe', data),
    getUsage: () => apiClient.get('/api/ai/usage')
  },

  // Feedback
  feedback: {
    submit: (data) => apiClient.post('/api/feedback', data),
    getHistory: () => apiClient.get('/api/feedback/history')
  }
};

export { apiClient, api }; 