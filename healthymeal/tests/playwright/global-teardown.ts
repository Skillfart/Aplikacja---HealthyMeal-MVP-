import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Rozwiązanie problemu z __dirname w ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Globalny teardown po zakończeniu testów Playwright
 * - Usuwa tymczasowe pliki
 * - Resetuje stan środowiska
 */
async function globalTeardown(config: FullConfig) {
  try {
    console.log('Czyszczenie środowiska testowego...');
    
    // Usuwanie tymczasowych plików (opcjonalne)
    const tmpFiles = [
      // Lista plików tymczasowych do usunięcia, jeśli takie są
    ];
    
    for (const file of tmpFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
    
    console.log('Środowisko testowe zostało wyczyszczone.');
  } catch (error) {
    console.error('Błąd podczas czyszczenia środowiska testowego:', error.message);
  }
}

export default globalTeardown; 