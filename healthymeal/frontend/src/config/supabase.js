import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak kluczy Supabase w zmiennych środowiskowych!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 