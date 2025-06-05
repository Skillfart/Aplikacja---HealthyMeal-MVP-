# HealthyMeal Backend

Backend dla aplikacji HealthyMeal, napisany w Node.js z Express i MongoDB.

## Wymagania

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Supabase (dla autoryzacji)
- OpenAI API (dla generowania przepisów)

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/twoje-repo/healthymeal.git
cd healthymeal/backend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skopiuj plik `.env.example` do `.env` i uzupełnij zmienne środowiskowe:
```bash
cp .env.example .env
```

4. Uruchom serwer w trybie deweloperskim:
```bash
npm run dev
```

## Struktura projektu

```
src/
├── app.js              # Główny plik aplikacji
├── config/             # Konfiguracja
│   ├── database.js     # Konfiguracja MongoDB
│   └── env.js         # Zmienne środowiskowe
├── controllers/        # Kontrolery
│   └── recipeController.js
├── middleware/         # Middleware
│   └── auth.js        # Autoryzacja
├── models/            # Modele MongoDB
│   ├── User.js
│   ├── Recipe.js
│   └── AiResponse.js
├── routes/            # Trasy
│   └── recipeRoutes.js
└── utils/             # Narzędzia
    └── logger.js      # Logger
```

## API Endpoints

### Przepisy

- `GET /api/recipes` - Pobierz wszystkie przepisy użytkownika
- `GET /api/recipes/search` - Wyszukaj przepisy
- `GET /api/recipes/:id` - Pobierz pojedynczy przepis
- `POST /api/recipes` - Utwórz nowy przepis
- `PUT /api/recipes/:id` - Zaktualizuj przepis
- `DELETE /api/recipes/:id` - Usuń przepis
- `POST /api/recipes/:id/modify-with-ai` - Modyfikuj przepis za pomocą AI

## Autoryzacja

Aplikacja używa Supabase do autoryzacji. Token JWT musi być przekazany w nagłówku `Authorization` w formacie:
```
Authorization: Bearer <token>
```

## Limity

- Limit zapytań API: 100 na 15 minut
- Limit zapytań AI: 5 na dzień na użytkownika
- Maksymalny rozmiar żądania: 10MB

## Cache

Odpowiedzi AI są cachowane przez 7 dni.

## Testy

```bash
# Uruchom wszystkie testy
npm test

# Uruchom linter
npm run lint

# Formatuj kod
npm run format
```

## Środowiska

- Development: `.env.development`
- Production: `.env`

## Zmienne środowiskowe

- `NODE_ENV` - Środowisko (development/production)
- `PORT` - Port serwera
- `MONGODB_URI` - URI do MongoDB
- `SUPABASE_URL` - URL do Supabase
- `SUPABASE_SERVICE_KEY` - Klucz serwisowy Supabase
- `OPENAI_API_KEY` - Klucz API OpenAI
- `CORS_ORIGIN` - Dozwolone pochodzenie dla CORS
- `AI_DAILY_LIMIT` - Dzienny limit zapytań AI
- `CACHE_ENABLED` - Włącz/wyłącz cache
- `CACHE_TTL` - Czas życia cache w sekundach
- `LOG_LEVEL` - Poziom logowania
- `SECURITY_ENABLED` - Włącz/wyłącz zabezpieczenia

## Bezpieczeństwo

- Helmet dla zabezpieczeń HTTP
- Rate limiting
- Sanityzacja danych MongoDB
- CORS
- Kompresja odpowiedzi

## Logowanie

Logi są zapisywane w katalogu `logs/`:
- `error.log` - Błędy
- `combined.log` - Wszystkie logi

W trybie deweloperskim logi są również wyświetlane w konsoli.

## Licencja

ISC 