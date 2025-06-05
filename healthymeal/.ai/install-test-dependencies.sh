#!/bin/bash

# Skrypt do instalacji zależności testowych dla projektu HealthyMeal

echo "===== INSTALACJA ZALEŻNOŚCI TESTOWYCH ====="

# Sprawdzenie, czy jesteśmy w katalogu głównym projektu
if [ ! -d "healthymeal" ]; then
  echo "Błąd: Skrypt musi być uruchomiony z katalogu głównego projektu."
  exit 1
fi

# Instalacja zależności testowych
echo "[1/5] Instalacja zależności głównych..."
cd healthymeal && npm install

# Instalacja zależności dla testów
echo "[2/5] Instalacja zależności testowych..."
cd tests && npm install

# Instalacja Playwright
echo "[3/5] Instalacja Playwright..."
npm install --save-dev @playwright/test
npx playwright install --with-deps chromium

# Instalacja zależności dla backendu
echo "[4/5] Instalacja zależności backendu..."
cd ../backend && npm install

# Instalacja zależności dla frontendu
echo "[5/5] Instalacja zależności frontendu..."
cd ../frontend && npm install

echo "===== INSTALACJA ZAKOŃCZONA SUKCESEM ====="
echo ""
echo "Aby uruchomić testy, użyj jednego z poniższych poleceń:"
echo "cd tests && npm test             # Wszystkie testy"
echo "cd tests && npm run test:unit    # Testy jednostkowe"
echo "cd tests && npm run test:e2e     # Testy E2E (Playwright)"
echo "cd tests && npm run test:e2e:ui  # Testy E2E w trybie UI"
echo "" 