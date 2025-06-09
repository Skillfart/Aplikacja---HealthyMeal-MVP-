import { createClient } from '@supabase/supabase-js';

// Sprawdzenie zmiennych środowiskowych
console.log('Konfiguracja Supabase:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Ustawiony' : '❌ Brak');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Brak konfiguracji Supabase. Sprawdź zmienne środowiskowe:');
  console.error('- SUPABASE_URL:', process.env.SUPABASE_URL || '❌ Brak');
  console.error('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Ustawiony' : '❌ Brak');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Nieprawidłowy format tokenu' });
    }

    const token = parts[1];

    if (token.split('.').length !== 3) {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Błąd weryfikacji tokenu:', error);
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Użytkownik nie znaleziony' });
    }

    // Dodaj dane użytkownika do obiektu request
    req.user = user;
    next();
  } catch (error) {
    console.error('Błąd autoryzacji:', error);
    res.status(500).json({ error: 'Błąd serwera podczas autoryzacji' });
  }
};
