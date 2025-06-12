import axios from 'axios';

// Konfiguracja domyślnego URL API
axios.defaults.baseURL = 'http://localhost:3031';

// Konfiguracja domyślnych nagłówków
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor do dodawania tokena autoryzacji
axios.interceptors.request.use(
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

export default axios; 