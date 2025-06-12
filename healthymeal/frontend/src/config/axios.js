import axios from 'axios';

// Konfiguracja bazowego URL
axios.defaults.baseURL = 'http://localhost:3031';

// Konfiguracja domyślnych nagłówków
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor do dodawania tokena autoryzacji
axios.interceptors.request.use(
  (config) => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor do obsługi błędów
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 