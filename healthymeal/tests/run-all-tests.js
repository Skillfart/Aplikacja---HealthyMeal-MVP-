const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Skrypt do uruchamiania wszystkich testów aplikacji
 */
function runTests() {
  console.log('=============================');
  console.log('URUCHAMIANIE TESTÓW HEALTHYMEAL');
  console.log('=============================');
  
  const results = {
    unit: { passed: false, error: null },
    integration: { passed: false, error: null },
    performance: { passed: false, error: null },
    e2e: { passed: false, error: null },
    cypress: { passed: false, error: null }
  };
  
  // Funkcja pomocnicza do uruchamiania testów
  function runTestSuite(command, name) {
    try {
      console.log(`\n\n===== TESTY ${name.toUpperCase()} =====`);
      execSync(command, { stdio: 'inherit' });
      results[name.toLowerCase()].passed = true;
      return true;
    } catch (error) {
      results[name.toLowerCase()].error = error.message;
      console.error(`\n\nBłąd podczas uruchamiania testów ${name}:`, error.message);
      return false;
    }
  }
  
  try {
    // 1. Testy jednostkowe
    runTestSuite('npm run test:unit', 'jednostkowe');
    
    // 2. Testy integracyjne
    runTestSuite('npm run test:integration', 'integracyjne');
    
    // 3. Testy wydajnościowe
    runTestSuite('npm run test:performance', 'wydajnościowe');
    
    // 4. Testy E2E API
    runTestSuite('npm run test:e2e', 'e2e');
    
    // 5. Testy Cypress (tylko jeśli Cypress jest zainstalowany)
    try {
      const cypressPath = path.resolve('./node_modules/.bin/cypress');
      if (fs.existsSync(cypressPath)) {
        results.cypress.passed = runTestSuite('npx cypress run', 'cypress UI');
      } else {
        console.log('\n\nTesty Cypress pominięte (Cypress nie jest zainstalowany)');
      }
    } catch (err) {
      results.cypress.error = err.message;
      console.error('\n\nBłąd podczas uruchamiania testów Cypress:', err.message);
    }
    
    // Wyświetl podsumowanie testów
    console.log('\n\n=============================');
    console.log('PODSUMOWANIE TESTÓW');
    console.log('=============================');
    
    let allPassed = true;
    
    for (const [suite, result] of Object.entries(results)) {
      if (suite === 'cypress' && !fs.existsSync(path.resolve('./node_modules/.bin/cypress'))) {
        console.log(`- Testy ${suite}: POMINIĘTE (Cypress nie jest zainstalowany)`);
        continue;
      }
      
      if (result.passed) {
        console.log(`- Testy ${suite}: ZALICZONE ✅`);
      } else {
        allPassed = false;
        console.log(`- Testy ${suite}: NIEZALICZONE ❌`);
      }
    }
    
    console.log('\n=============================');
    if (allPassed) {
      console.log('WSZYSTKIE TESTY ZALICZONE ✅');
    } else {
      console.log('NIEKTÓRE TESTY NIE PRZESZŁY ❌');
      process.exit(1); // Zwróć kod błędu, aby CI/CD mogło wykryć problemy
    }
    console.log('=============================');
  } catch (error) {
    console.error('\n\nBłąd krytyczny podczas uruchamiania testów:', error.message);
    process.exit(1);
  }
}

// Uruchom testy
runTests(); 