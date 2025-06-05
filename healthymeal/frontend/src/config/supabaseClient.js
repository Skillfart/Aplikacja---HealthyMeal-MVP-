import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak konfiguracji Supabase. Sprawdź zmienne środowiskowe.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 