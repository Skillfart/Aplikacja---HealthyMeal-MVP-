import axios from 'axios';

// Konfiguracja domyślnych nagłówków
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor do dodawania tokena autoryzacji
axios.interceptors.request.use(
  (config) => {
    // Szukaj tokenu w różnych miejscach
    let token = null;
    
    // 1. Sprawdź localStorage (używane przez config/axios.js)
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    if (session?.access_token) {
      token = session.access_token;
      console.log('🔑 Token znaleziony w localStorage:', token.substring(0, 20) + '...');
    }
    
    // 2. Sprawdź sessionStorage (Supabase)
    const supabaseSession = sessionStorage.getItem('supabase.auth.token');
    if (!token && supabaseSession) {
      token = supabaseSession;
      console.log('🔑 Token znaleziony w sessionStorage:', token.substring(0, 20) + '...');
    }
    
    // 3. Sprawdź window.supabaseSession (globalny context)
    if (!token && window.supabaseSession?.access_token) {
      token = window.supabaseSession.access_token;
      console.log('🔑 Token znaleziony w window.supabaseSession:', token.substring(0, 20) + '...');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📡 Request:', config.method?.toUpperCase(), config.url, 'z tokenem');
    } else {
      console.warn('❌ Brak tokenu autoryzacji dla:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Błąd interceptora request:', error);
    return Promise.reject(error);
  }
);

// Interceptor do obsługi błędów
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('🔄 Przekierowanie do logowania...');
      // Przekieruj do strony logowania w przypadku błędu autoryzacji
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 