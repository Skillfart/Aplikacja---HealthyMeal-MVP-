import axios from 'axios';
import { toast } from 'react-toastify';

// Sprawdzenie środowiska testowego
const isTestEnvironment = () => {
  const isNodeEnvTest = process.env.NODE_ENV === 'test';
  const isLocalStorageTestMode = localStorage.getItem('test_mode') === 'true';
  const isReactAppTestMode = process.env.REACT_APP_TEST_MODE === 'true';
  
  console.log('Tryb testowy wykryty:', {
    isNodeEnvTest,
    isLocalStorageTestMode,
    isReactAppTestMode,
    nodeEnv: process.env.NODE_ENV
  });
  
  return isNodeEnvTest || isLocalStorageTestMode || isReactAppTestMode;
};

// Konfiguracja bazowego URL API
const getBaseUrl = () => {
  if (isTestEnvironment()) {
    return ''; // W trybie testowym używamy relatywnych ścieżek
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

// Tworzenie instancji axios z bazowym URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dodający token do requestów
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor obsługujący błędy autoryzacji
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 