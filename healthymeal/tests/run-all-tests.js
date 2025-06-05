import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ustaw zmienne środowiskowe
process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';
process.env.USE_MOCKS = 'true';

// Uruchom testy jednostkowe
console.log('Uruchamianie testów jednostkowych...');
try {
  execSync('vitest run', { stdio: 'inherit' });
} catch (error) {
  console.error('Błąd podczas uruchamiania testów jednostkowych:', error);
  process.exit(1);
}

// Uruchom testy integracyjne
console.log('\nUruchamianie testów integracyjnych...');
try {
  execSync('vitest run integration/**/*.test.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Błąd podczas uruchamiania testów integracyjnych:', error);
  process.exit(1);
}

// Uruchom testy wydajnościowe
console.log('\nUruchamianie testów wydajnościowych...');
try {
  execSync('vitest run performance/**/*.test.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Błąd podczas uruchamiania testów wydajnościowych:', error);
  process.exit(1);
}

// Uruchom testy bezpieczeństwa
console.log('\nUruchamianie testów bezpieczeństwa...');
try {
  execSync('vitest run security/**/*.test.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Błąd podczas uruchamiania testów bezpieczeństwa:', error);
  process.exit(1);
}

console.log('\nWszystkie testy zakończone pomyślnie!');
