# Instrukcje wdrożenia - POST /api/ai/modify/:recipeId

## Wymagania

- Node.js v14 lub nowszy (zalecana wersja 18.18.2 z pliku .nvmrc)
- MongoDB 4.4 lub nowszy
- Dostęp do OpenAI API lub OpenRouter API

## Zmienne środowiskowe

Przed wdrożeniem należy skonfigurować następujące zmienne środowiskowe:

```
MONGODB_URI=mongodb://localhost:27017/healthymeal  # URL do bazy MongoDB
PORT=3030                                          # Port serwera backend
JWT_SECRET=wygeneruj-unikalny-klucz                # Tajny klucz do podpisywania tokenów JWT
JWT_EXPIRES_IN=24h                                 # Czas ważności tokenów JWT

# Konfiguracja API AI
AI_API_KEY=twój-klucz-api                          # Klucz API OpenAI lub innego dostawcy AI
AI_API_URL=https://api.openai.com/v1/chat/completions  # URL API
AI_MODEL=openai/gpt-4o-mini                        # Model AI do wykorzystania
AI_TIMEOUT=30000                                   # Timeout dla zapytań AI w ms

# Limity użycia AI
AI_DAILY_LIMIT=5                                   # Limit dziennych zapytań AI per użytkownik

# Konfiguracja cache
CACHE_TTL_HOURS=24                                 # Czas ważności cache w godzinach

# OpenRouter API (alternatywny dostawca AI)
OPENROUTER_API_KEY=twój-klucz-openrouter           # Klucz API OpenRouter
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o             # Domyślny model OpenRouter
APP_URL=http://localhost:3000                      # URL Twojej aplikacji
APP_NAME=HealthyMeal                               # Nazwa aplikacji
```

## Instrukcje instalacji

### Backend

1. Przejdź do katalogu backend:
```bash
cd healthymeal/backend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj plik .env (utwórz go na podstawie powyższych zmiennych środowiskowych)

4. Uruchom serwer:
```bash
npm start
```
Serwer powinien uruchomić się na porcie 3030 (lub innym skonfigurowanym w .env).

### Frontend

1. Przejdź do katalogu frontend:
```bash
cd healthymeal/frontend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom serwer deweloperski:
```bash
npm start
```
Aplikacja frontendowa powinna uruchomić się na porcie 3000.

## Uruchamianie obu części aplikacji jednocześnie

Aby uruchomić backend i frontend jednocześnie w środowisku Windows PowerShell:

```powershell
# Terminal 1
cd healthymeal/backend
npm start

# Terminal 2
cd healthymeal/frontend
npm start
```

## Wdrożenie produkcyjne

### Backend

1. Zbuduj aplikację (jeśli używasz TypeScript):
```bash
npm run build
```

2. Skonfiguruj zmienne środowiskowe na serwerze produkcyjnym, pamiętając aby:
   - Użyć silnego JWT_SECRET
   - Skonfigurować poprawny MONGODB_URI do produkcyjnej bazy danych
   - Ustawić rzeczywiste klucze API AI
   - Zmienić NODE_ENV na "production"

3. Uruchom aplikację:
```bash
npm start
```

### Frontend

1. Zbuduj aplikację frontendową:
```bash
cd healthymeal/frontend
npm run build
```

2. Wdróż statyczne pliki z katalogu `build` na serwer statycznych plików (np. Netlify, Vercel)
   lub serwuj je z backendu (skonfigurowane w app.js).
