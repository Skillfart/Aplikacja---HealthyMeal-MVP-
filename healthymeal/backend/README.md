# HealthyMeal Backend

Backend aplikacji HealthyMeal zapewniający API RESTful dla aplikacji frontendowej.

## Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Utwórz plik `.env` na podstawie `.env.example`:
```bash
cp .env.example .env
```

3. Dostosuj zmienne środowiskowe w pliku `.env`:
```
PORT=3030
MONGODB_URI=mongodb://localhost:27017/healthymeal
JWT_SECRET=twój-sekretny-klucz
OPENROUTER_API_KEY=klucz-api-openrouter
```

## Integracja z OpenRouter API

Aplikacja korzysta z OpenRouter API do generowania modyfikacji przepisów i sugerowania alternatywnych składników. Aby ta funkcjonalność działała poprawnie, należy:

1. Zarejestrować się na [OpenRouter](https://openrouter.ai/) i uzyskać klucz API

2. Ustawić klucz API w pliku `.env`:
```
OPENROUTER_API_KEY=twój-klucz-openrouter
```

3. Upewnić się, że pakiet OpenAI jest zainstalowany:
```bash
npm install openai
```

W przypadku braku klucza API lub problemów z połączeniem, aplikacja będzie działać w trybie symulacji, zwracając przykładowe dane.

## Uruchamianie

### Tryb deweloperski
```bash
npm run dev
```

### Tryb produkcyjny
```bash
npm start
```

## Testy

### Uruchamianie testów jednostkowych
```bash
npm test
```

### Uruchamianie testów e2e
```bash
npm run test:e2e
```

## Struktura projektu

- `src/` - Kod źródłowy
  - `controllers/` - Kontrolery dla różnych zasobów
  - `models/` - Modele danych Mongoose
  - `routes/` - Definicje tras API
  - `middleware/` - Middleware Express (np. autentykacja)
  - `services/` - Serwisy (np. OpenRouter, limity API)
  - `errors/` - Klasy obsługi błędów
  - `app.js` - Konfiguracja aplikacji Express
  - `server.js` - Punkt wejściowy aplikacji

## Dokumentacja API

### Endpointy API

#### Autoryzacja
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/login` - Logowanie użytkownika

#### Użytkownicy
- `GET /api/users/me` - Pobranie danych aktualnego użytkownika
- `PUT /api/users/me` - Aktualizacja danych użytkownika
- `PUT /api/users/me/preferences` - Aktualizacja preferencji dietetycznych

#### Przepisy
- `GET /api/recipes` - Pobranie listy przepisów
- `GET /api/recipes/:id` - Pobranie szczegółów przepisu
- `POST /api/recipes` - Utworzenie nowego przepisu
- `PUT /api/recipes/:id` - Aktualizacja przepisu
- `DELETE /api/recipes/:id` - Usunięcie przepisu

#### AI
- `GET /api/ai/usage` - Pobranie informacji o limitach AI
- `GET /api/ai/status` - Sprawdzenie statusu API OpenRouter
- `POST /api/ai/modify/:recipeId` - Modyfikacja przepisu na podstawie preferencji
- `GET /api/ai/alternatives/:recipeId` - Sugestie alternatyw dla składników
- `POST /api/ai/alternatives` - Sugestie alternatyw dla wybranych składników 