import { createClient } from '@supabase/supabase-js';
import User from '../models/User.js';

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
    // Sprawdź czy jest nagłówek autoryzacji
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? '✅ Present' : '❌ Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    // Sprawdź format tokenu
    const token = authHeader.split(' ')[1];
    const isValidJWT = token && token.split('.').length === 3;
    console.log('Token format:', isValidJWT ? '✅ Valid JWT' : '❌ Invalid format');

    if (!isValidJWT) {
      return res.status(401).json({ error: 'Nieprawidłowy format tokenu' });
    }

    // Zweryfikuj token w Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('Auth result:', {
      user: user ? '✅ User found' : '❌ No user',
      error: error ? `❌ ${error.message}` : '✅ No error'
    });

    if (error || !user) {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }

    // Znajdź lub utwórz użytkownika w MongoDB
    try {
      let mongoUser = await User.findOne({ supabaseId: user.id });
      
      if (!mongoUser) {
        console.log('Tworzenie/aktualizacja użytkownika:', {
          supabaseId: user.id,
          email: user.email
        });

        // Użyj findOneAndUpdate z upsert:true aby uniknąć race condition
        mongoUser = await User.findOneAndUpdate(
          { supabaseId: user.id },
          {
            $setOnInsert: {
              email: user.email,
              createdAt: new Date()
            },
            $set: {
              updatedAt: new Date()
            }
          },
          {
            upsert: true,
            new: true,
            runValidators: true
          }
        );

        console.log('✅ Użytkownik utworzony/zaktualizowany:', mongoUser._id);
      } else {
        console.log('✅ Znaleziono istniejącego użytkownika:', mongoUser._id);
      }

      // Dodaj użytkownika do obiektu request
      req.user = user;
      req.mongoUser = mongoUser;
      next();
    } catch (dbError) {
      console.error('❌ Błąd bazy danych:', dbError);
      
      // Obsługa duplikatów
      if (dbError.code === 11000) {
        console.log('Znaleziono duplikat, próba ponownego pobrania...');
        try {
          const existingUser = await User.findOne({ supabaseId: user.id });
          if (existingUser) {
            req.user = user;
            req.mongoUser = existingUser;
            return next();
          }
        } catch (retryError) {
          console.error('❌ Błąd podczas próby ponownego pobrania:', retryError);
        }
      }
      
      // Szczegółowe logowanie błędów walidacji
      if (dbError.name === 'ValidationError') {
        console.error('Szczegóły błędu walidacji:');
        Object.keys(dbError.errors).forEach(key => {
          console.error(`- ${key}:`, dbError.errors[key].message);
        });
      }
      
      return res.status(500).json({ error: 'Błąd serwera podczas autoryzacji' });
    }
  } catch (error) {
    console.error('❌ Błąd autoryzacji:', error);
    return res.status(500).json({ error: 'Błąd serwera podczas autoryzacji' });
  }
};
