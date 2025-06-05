/**
 * Skrypt do uruchamiania testów z pokryciem kodu
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfiguracja testu
const config = {
  // Katalogi do przetestowania
  directories: [
    '../frontend/src/utils',
    '../frontend/src/components',
    '../frontend/src/contexts',
    '../frontend/src/hooks',
    '../frontend/src/services',
    '../backend/src/controllers',
    '../backend/src/services',
    '../backend/src/models'
  ],
  // Katalogi z testami
  testDirectories: [
    './unit',
    './integration'
  ],
  // Plik z raportem
  coverageDir: './coverage',
  reportFile: './coverage/coverage-report.md'
};

// Upewnij się, że katalog coverage istnieje
if (!fs.existsSync(config.coverageDir)) {
  fs.mkdirSync(config.coverageDir, { recursive: true });
}

console.log('=== Uruchamianie testów z pokryciem kodu ===');

try {
  // Uruchom testy z pokryciem kodu przy użyciu Vitest
  execSync('npx vitest run --coverage', { stdio: 'inherit' });
  
  // Przygotuj raport z pokryciem kodu w formacie Markdown
  console.log('\n=== Generowanie raportu z pokryciem kodu ===');
  
  // Zbierz dane o plikach w katalogach kodu źródłowego
  const sourceFiles = [];
  
  config.directories.forEach(dir => {
    try {
      const resolvedDir = path.resolve(__dirname, dir);
      if (fs.existsSync(resolvedDir)) {
        const files = findJsFiles(resolvedDir);
        sourceFiles.push(...files);
      }
    } catch (err) {
      console.error(`Błąd podczas skanowania katalogu ${dir}:`, err);
    }
  });
  
  // Zbierz dane o plikach testowych
  const testFiles = [];
  
  config.testDirectories.forEach(dir => {
    try {
      const resolvedDir = path.resolve(__dirname, dir);
      if (fs.existsSync(resolvedDir)) {
        const files = findJsFiles(resolvedDir, ['.test.js', '.spec.js']);
        testFiles.push(...files);
      }
    } catch (err) {
      console.error(`Błąd podczas skanowania katalogu testów ${dir}:`, err);
    }
  });
  
  // Oblicz statystyki
  const totalSourceFiles = sourceFiles.length;
  const totalTestFiles = testFiles.length;
  const coverageRatio = totalSourceFiles > 0 ? (totalTestFiles / totalSourceFiles).toFixed(2) : 'N/A';
  
  // Napisz raport
  const report = `# Raport pokrycia testami dla projektu HealthyMeal

## Statystyki ogólne

- **Liczba plików źródłowych**: ${totalSourceFiles}
- **Liczba plików testowych**: ${totalTestFiles}
- **Współczynnik pokrycia (pliki)**: ${coverageRatio}

## Pliki źródłowe bez testów

${findFilesWithoutTests(sourceFiles, testFiles)}

## Uwagi

Ten raport został wygenerowany automatycznie przez skrypt \`run-coverage.js\`.
Pełny raport pokrycia kodu można znaleźć w katalogu \`./coverage\`.

Wygenerowano: ${new Date().toLocaleString()}
`;

  // Zapisz raport do pliku
  fs.writeFileSync(config.reportFile, report);
  
  console.log(`Raport został zapisany do pliku: ${config.reportFile}`);
  console.log('=== Zakończono generowanie raportu z pokryciem kodu ===');
  
} catch (error) {
  console.error('Wystąpił błąd podczas uruchamiania testów:', error);
  process.exit(1);
}

/**
 * Znajduje pliki JavaScript w katalogu i podkatalogach
 * @param {string} dir - Katalog do przeszukania
 * @param {Array} extensions - Rozszerzenia plików do wyszukania
 * @returns {Array} Lista znalezionych plików
 */
function findJsFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Rekurencyjnie przeszukaj podkatalogi
      files.push(...findJsFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      // Dodaj plik JavaScript do listy
      files.push({
        path: fullPath,
        name: item.name,
        relativePath: path.relative(__dirname, fullPath)
      });
    }
  }
  
  return files;
}

/**
 * Znajduje pliki źródłowe, które nie mają odpowiadających im testów
 * @param {Array} sourceFiles - Lista plików źródłowych
 * @param {Array} testFiles - Lista plików testowych
 * @returns {string} Sformatowany tekst z listą plików bez testów
 */
function findFilesWithoutTests(sourceFiles, testFiles) {
  const filesWithoutTests = sourceFiles.filter(sourceFile => {
    const baseName = path.basename(sourceFile.name, path.extname(sourceFile.name));
    return !testFiles.some(testFile => {
      const testBaseName = path.basename(testFile.name, '.test.js');
      return baseName === testBaseName;
    });
  });
  
  if (filesWithoutTests.length === 0) {
    return 'Wszystkie pliki źródłowe mają odpowiadające im testy. Gratulacje! 🎉';
  }
  
  let result = 'Poniższe pliki źródłowe nie mają odpowiadających im testów:\n\n';
  
  filesWithoutTests.forEach(file => {
    result += `- \`${file.relativePath}\`\n`;
  });
  
  return result;
} 