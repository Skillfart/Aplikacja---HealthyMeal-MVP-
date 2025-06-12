import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Załaduj zmienne środowiskowe
const envPath = process.env.DOTENV_CONFIG_PATH || path.join(__dirname, '../.env.development');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`Błąd ładowania pliku ${envPath}:`, result.error);
  process.exit(1);
}

console.log(`Załadowano konfigurację z pliku: ${envPath}`);
console.log('Zmienne środowiskowe:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL || '❌ Brak');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Ustawiony' : '❌ Brak');
console.log('- MONGODB_URI:', process.env.MONGODB_URI || '❌ Brak');
console.log('- PORT:', process.env.PORT || '❌ Brak');
console.log('- ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || '❌ Brak'); 