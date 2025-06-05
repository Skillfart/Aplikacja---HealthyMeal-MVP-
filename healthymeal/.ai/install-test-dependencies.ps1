# Skrypt do instalacji zależności testowych dla projektu HealthyMeal w środowisku Windows

Write-Host "===== INSTALACJA ZALEŻNOŚCI TESTOWYCH =====" -ForegroundColor Cyan

# Sprawdzenie, czy jesteśmy w katalogu głównym projektu
if (-not (Test-Path "healthymeal")) {
    Write-Host "Błąd: Skrypt musi być uruchomiony z katalogu głównego projektu." -ForegroundColor Red
    exit 1
}

# Instalacja zależności testowych
Write-Host "[1/5] Instalacja zależności głównych..." -ForegroundColor Cyan
Set-Location healthymeal
npm install

# Instalacja zależności dla testów
Write-Host "[2/5] Instalacja zależności testowych..." -ForegroundColor Cyan
Set-Location tests
npm install

# Instalacja Playwright
Write-Host "[3/5] Instalacja Playwright..." -ForegroundColor Cyan
npm install --save-dev @playwright/test
npx playwright install --with-deps chromium

# Instalacja zależności dla backendu
Write-Host "[4/5] Instalacja zależności backendu..." -ForegroundColor Cyan
Set-Location ..\backend
npm install

# Instalacja zależności dla frontendu
Write-Host "[5/5] Instalacja zależności frontendu..." -ForegroundColor Cyan
Set-Location ..\frontend
npm install

# Powrót do katalogu głównego
Set-Location ..

Write-Host "===== INSTALACJA ZAKOŃCZONA SUKCESEM =====" -ForegroundColor Green
Write-Host ""
Write-Host "Aby uruchomić testy, użyj jednego z poniższych poleceń:" -ForegroundColor White
Write-Host "cd tests; npm test             # Wszystkie testy" -ForegroundColor White
Write-Host "cd tests; npm run test:unit    # Testy jednostkowe" -ForegroundColor White
Write-Host "cd tests; npm run test:e2e     # Testy E2E (Playwright)" -ForegroundColor White
Write-Host "cd tests; npm run test:e2e:ui  # Testy E2E w trybie UI" -ForegroundColor White
Write-Host "" -ForegroundColor White 