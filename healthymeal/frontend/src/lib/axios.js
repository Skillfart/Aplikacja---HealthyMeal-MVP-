import axios from 'axios';

// Konfiguracja domyślnych nagłówków
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor do dodawania tokena autoryzacji
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('supabase.auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Przekieruj do strony logowania w przypadku błędu autoryzacji
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 