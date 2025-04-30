import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Pobieranie zmiennych środowiskowych używając formatu Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Sprawdzenie czy klucze są dostępne
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Brak kluczy Supabase! Sprawdź zmienne środowiskowe REACT_APP_SUPABASE_URL i REACT_APP_SUPABASE_ANON_KEY w pliku .env'
  );
}

/**
 * Klient Supabase zainicjalizowany z kluczami środowiskowymi
 * Używaj tego klienta do wszystkich operacji związanych z Supabase
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Funkcja pomocnicza do sprawdzenia czy użytkownik jest zalogowany
 * @returns Obiekt z informacją czy użytkownik jest zalogowany (boolean)
 */
export const getAuthStatus = async () => {
  const { data } = await supabase.auth.getSession();
  return {
    isAuthenticated: !!data?.session,
  };
};

export default supabase; 