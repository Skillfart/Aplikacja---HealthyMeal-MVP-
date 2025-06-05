const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Inicjalizacja klienta Supabase
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey
);

async function runMigrations() {
  try {
    console.log('Rozpoczynam uruchamianie migracji...');
    
    // Ścieżka do katalogu z migracjami
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
    
    // Pobierz listę plików migracji
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sortuj alfabetycznie, aby zachować kolejność
    
    console.log(`Znaleziono ${migrationFiles.length} plików migracji`);
    
    // Uruchom każdą migrację
    for (const file of migrationFiles) {
      console.log(`\nUruchamianie migracji: ${file}`);
      
      // Wczytaj zawartość pliku SQL
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Wykonaj migrację
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Błąd podczas wykonywania migracji ${file}:`, error);
        throw error;
      }
      
      console.log(`Migracja ${file} wykonana pomyślnie`);
    }
    
    console.log('\nWszystkie migracje zostały wykonane pomyślnie!');
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
    process.exit(1);
  }
}

// Uruchom migracje
runMigrations(); 