import { initializeConfig } from './utils/setup-env.js';

// Inicjalizuj konfigurację dla testów
const config = initializeConfig('tests');

// Eksportuj potencjalnie przydatne funkcje i obiekty
export { config }; 