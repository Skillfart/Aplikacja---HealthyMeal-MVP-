# HealthyMeal

Aplikacja do zarządzania przepisami kulinarnymi z funkcjami modyfikacji przez AI i preferencjami żywieniowymi.

## 🚀 Funkcje

- ✅ Tworzenie i zarządzanie przepisami
- 🔒 Autentykacja użytkowników (Supabase)
- 🥗 Preferencje żywieniowe i diety
- 🤖 Modyfikacje przepisów przez AI
- 📱 Responsywny interfejs

## 🛠️ Technologie

- Frontend:
  - React 18
  - React Router 6
  - Supabase Client
  - React Toastify
  - CSS Modules

- Backend:
  - Supabase (baza danych i autentykacja)
  - OpenRouter API (modyfikacje AI)

## 📦 Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/twoje-repo/healthymeal.git
cd healthymeal
```

2. Zainstaluj zależności:
```bash
# Frontend
cd frontend
npm install

# Backend (jeśli potrzebny)
cd ../backend
npm install
```

3. Skonfiguruj zmienne środowiskowe:
```bash
# Frontend
cd frontend
cp src/config/env.example.js src/config/env.js
# Uzupełnij wartości w env.js
```

4. Uruchom aplikację:
```bash
# Frontend
npm start

# Backend (jeśli potrzebny)
cd ../backend
npm start
```

## 🔧 Konfiguracja

### Supabase

1. Utwórz projekt w [Supabase](https://supabase.com)
2. Skopiuj URL i klucz anonimowy do konfiguracji
3. Uruchom skrypty SQL z folderu `database/`

### OpenRouter (AI)

1. Utwórz konto w [OpenRouter](https://openrouter.ai)
2. Wygeneruj klucz API
3. Dodaj klucz do konfiguracji

## 📝 Dokumentacja

Pełna dokumentacja znajduje się w folderze `.ai/`:

- `prd.md` - Wymagania produktowe
- `techstack.md` - Stack technologiczny
- `api-plan.md` - Plan API
- `db-plan.md` - Schema bazy danych
- `view-implementation-plan.md` - Plan implementacji widoków
- `openrouter-usage.md` - Integracja z OpenRouter

## 🤝 Współpraca

1. Utwórz fork repozytorium
2. Stwórz branch z funkcjonalnością (`git checkout -b feature/nazwa`)
3. Zatwierdź zmiany (`git commit -am 'Dodano funkcję X'`)
4. Wypchnij do brancha (`git push origin feature/nazwa`)
5. Utwórz Pull Request

## 📄 Licencja

Ten projekt jest licencjonowany pod MIT License - zobacz plik [LICENSE](LICENSE) po szczegóły.

# HealthyMeal - Dokumentacja Struktury Projektu

## Struktura projektu

Projekt HealthyMeal ma następującą strukturę folderów:

```
healthymeal/
  ├── frontend/               # Kod aplikacji frontendowej React
  │   ├── build/              # Skompilowana wersja aplikacji
  │   ├── node_modules/       # Zależności npm
  │   ├── public/             # Zasoby statyczne
  │   │   ├── images/         # Obrazy i inne pliki medialne
  │   │   └── ...
  │   ├── src/                # Kod źródłowy aplikacji
  │   │   ├── components/     # Komponenty React
  │   │   ├── contexts/       # Konteksty React (np. AuthContext)
  │   │   ├── db/             # Konfiguracja bazy danych
  │   │   ├── lib/            # Biblioteki pomocnicze
  │   │   ├── services/       # Serwisy aplikacji
  │   │   ├── types/          # Definicje typów
  │   │   ├── utils/          # Funkcje pomocnicze
  │   │   ├── views/          # Widoki/strony aplikacji
  │   │   └── ...
  │   ├── .env                # Zmienne środowiskowe dla frontendu
  │   └── ...
  ├── backend/                # Kod backendu (Node.js)
  │   ├── src/                # Kod źródłowy backendu
  │   │   ├── controllers/    # Kontrolery API
  │   │   ├── middleware/     # Middleware Express
  │   │   ├── routes/         # Definicje tras API
  │   │   ├── services/       # Serwisy backendu
  │   │   └── ...
  │   ├── .env                # Zmienne środowiskowe dla backendu
  │   └── ...
  ├── .ai/                    # Dokumentacja AI
  │   ├── api-plan.md
  │   ├── auth-spec.md
  │   ├── openrouter-service-implementation-plan.md
  │   ├── prd.md
  │   ├── test-plan.md
  │   └── test-tasks.md
  └── tests/                  # Testy aplikacji
      ├── cypress/            # Testy Cypress
      ├── e2e/                # Testy end-to-end
      ├── integration/        # Testy integracyjne
      ├── unit/               # Testy jednostkowe
      ├── .env                # Zmienne środowiskowe dla testów
      └── ...
```

## Ważne pliki konfiguracyjne

### Frontend (.env)


### Backend (.env)

### Testy (.env)


## Ścieżki importu

W projekcie używamy względnych ścieżek importu:

```javascript
// Przykłady
import Component from '../../components/Component';
import { useAuth } from '../../contexts/AuthContext';
```

## Zasoby statyczne

Wszystkie obrazy i zasoby statyczne powinny być przechowywane w folderze `frontend/public/images`.
Dostęp do nich w kodzie:

```javascript
// Przykład użycia obrazu
<img src="/images/logo.svg" alt="Logo HealthyMeal" />
```

## Konwencje nazewnictwa

- Pliki komponentów React: `PascalCase.jsx` lub `PascalCase.tsx`
- Pliki stylów: `nazwa.module.css` 
- Funkcje pomocnicze: `camelCase.js`

