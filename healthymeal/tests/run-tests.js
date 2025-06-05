const { execSync } = require('child_process');
const path = require('path');
const { initializeConfig } = require('./utils/config-loader');

/**
 * Uruchamia wybrane testy z odpowiednią konfiguracją
 * @param {string} testType - Typ testów do uruchomienia (unit, integration, recipe, itp.)
 */
function runTests(testType = 'unit') {
  try {
    console.log(`===== URUCHAMIANIE TESTÓW: ${testType.toUpperCase()} =====`);
    
    // Załaduj konfigurację
    initializeConfig('tests');
    
    // Mapowanie typów testów na komendy
    const commandMap = {
      unit: 'npx mocha unit/**/*.test.js',
      integration: 'npx mocha integration/**/*.test.js',
      recipe: 'npx mocha integration/**/recipe*.test.js',
      auth: 'npx mocha unit/**/auth*.test.js integration/**/auth*.test.js',
      performance: 'npx mocha performance/**/*.test.js',
      vitest: 'npx vitest run',
      all: 'npx mocha unit/**/*.test.js integration/**/*.test.js performance/**/*.test.js'
    };
    
    // Pobierz odpowiednią komendę
    const command = commandMap[testType] || commandMap.unit;
    
    // Uruchom komendę
    console.log(`Wykonywanie: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log(`\n===== TESTY ${testType.toUpperCase()} ZAKOŃCZONE POMYŚLNIE =====`);
  } catch (error) {
    console.error(`\n===== BŁĄD PODCZAS URUCHAMIANIA TESTÓW ${testType.toUpperCase()} =====`);
    console.error(error.message);
    process.exit(1);
  }
}

// Pobierz typ testów z argumentów wiersza poleceń
const testType = process.argv[2] || 'unit';

// Uruchom testy
runTests(testType); 