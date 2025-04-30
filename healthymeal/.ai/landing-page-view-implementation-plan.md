# Plan wdrożenia - widok strony startowej

## 1. Specyfikacja widoku

### Podstawowe informacje
- **Nazwa widoku**: Strona startowa (landing page)
- **Ścieżka URL**: `/`
- **Użytkownik**: Niezalogowany
- **Cel biznesowy**: Zdobycie nowych użytkowników poprzez prezentację wartości aplikacji

### Kluczowe funkcje
- Prezentacja wartości aplikacji HealthyMeal
- Demonstracja funkcji modyfikacji przepisów przez AI
- Zachęcenie do rejestracji/logowania
- Wyjaśnienie procesu działania aplikacji

## 2. Struktura komponentów

```
LandingPage
├── Header
├── HeroSection
├── FeatureShowcase
├── RecipeComparison
├── HowItWorks
├── CTASection
├── Footer
├── LoginModal (warunkowy)
└── RegisterModal (warunkowy)
```

## 3. Szczegółowy opis komponentów

### Header
- **Cel**: Nawigacja i dostęp do logowania/rejestracji
- **Elementy**:
  - Logo aplikacji (po lewej)
  - Przyciski "Zaloguj się" i "Zarejestruj się" (po prawej)
- **Interakcje**: 
  - Kliknięcie przycisków otwiera odpowiednie modale
- **Responsywność**: Menu hamburger na urządzeniach mobilnych

### HeroSection
- **Cel**: Przedstawienie głównej wartości produktu
- **Elementy**:
  - Nagłówek ("Zdrowe przepisy dostosowane do Twoich potrzeb")
  - Podtytuł opisujący korzyści dla osób z insulinoopornością/cukrzycą
  - Duży przycisk CTA "Rozpocznij za darmo"
  - Ilustracja pokazująca przykład modyfikacji przepisu
- **Interakcje**: 
  - Kliknięcie przycisku CTA otwiera modal rejestracji

### FeatureShowcase
- **Cel**: Prezentacja głównych funkcji aplikacji
- **Elementy**:
  - 3-4 karty z ikonami i krótkim opisem funkcji:
    1. Modyfikacja przepisów przez AI
    2. Osobiste preferencje żywieniowe
    3. Śledzenie wartości odżywczych
    4. Łatwe zarządzanie przepisami
- **Rozmieszczenie**: Karty w układzie rzędowym (desktop) lub kolumnowym (mobile)

### RecipeComparison
- **Cel**: Demonstracja działania funkcji modyfikacji przepisów
- **Elementy**:
  - Nagłówek sekcji
  - Porównanie przepisów przed/po w układzie side-by-side
  - Oznaczenie zmienionych składników i kroków
  - Wskaźnik redukcji węglowodanów
- **Interakcje**:
  - Możliwość przełączania między przykładowymi przepisami
  - Hover nad zmienionymi elementami pokazuje tooltip z wyjaśnieniem zmiany

### HowItWorks
- **Cel**: Wyjaśnienie procesu działania aplikacji
- **Elementy**:
  - Nagłówek sekcji
  - 3-4 kroki z numeracją, ikonami i krótkim opisem:
    1. Dodaj przepis lub wybierz z biblioteki
    2. Ustaw swoje preferencje żywieniowe
    3. Użyj AI do modyfikacji przepisu
    4. Zapisz i korzystaj ze zdrowego przepisu
- **Rozmieszczenie**: Linia czasu z krokami (desktop) lub lista (mobile)

### CTASection
- **Cel**: Finalne wezwanie do rejestracji
- **Elementy**:
  - Mocny nagłówek
  - Krótki tekst o korzyściach
  - Duży przycisk "Zarejestruj się teraz"
  - Informacja o darmowym limicie 5 modyfikacji dziennie
- **Interakcje**:
  - Kliknięcie przycisku otwiera modal rejestracji

### Footer
- **Cel**: Informacje prawne i dodatkowe linki
- **Elementy**:
  - Linki do stron: O nas, Regulamin, Polityka prywatności
  - Prawa autorskie
  - Ikony mediów społecznościowych (jeśli dostępne)

### LoginModal
- **Cel**: Umożliwienie logowania bez opuszczania strony głównej
- **Elementy**:
  - Nagłówek "Zaloguj się"
  - Pola formularza: email, hasło
  - Przycisk logowania
  - Link "Zapomniałem hasła"
  - Link "Nie masz konta? Zarejestruj się"
- **Walidacja**: 
  - Email (format)
  - Hasło (niepuste)
- **Interakcje**:
  - Link do rejestracji zamienia modal logowania na modal rejestracji
  - Poprawne logowanie przekierowuje do dashboardu

### RegisterModal
- **Cel**: Umożliwienie rejestracji bez opuszczania strony głównej
- **Elementy**:
  - Nagłówek "Utwórz konto"
  - Pola formularza: email, hasło, potwierdzenie hasła
  - Checkbox akceptacji regulaminu
  - Przycisk rejestracji
  - Link "Masz już konto? Zaloguj się"
- **Walidacja**:
  - Email (format)
  - Hasło (min. 8 znaków, wielkie/małe litery, cyfra)
  - Zgodność haseł
  - Akceptacja regulaminu
- **Interakcje**:
  - Link do logowania zamienia modal rejestracji na modal logowania
  - Poprawna rejestracja automatycznie loguje i przekierowuje do onboardingu

## 4. Wymagane modele danych i typy

### Modele danych
```typescript
interface IFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

interface IStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  iconName: string;
}

interface ILoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface IRegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}
```

### Przykładowe przepisy do demonstracji
```typescript
// Uproszczone wersje dla demonstracji na stronie głównej
const exampleOriginalRecipe = {
  id: 'example-1',
  name: 'Ciasto czekoladowe',
  ingredients: [
    { name: 'mąka pszenna', amount: 200, unit: 'g' },
    { name: 'cukier', amount: 150, unit: 'g' },
    { name: 'masło', amount: 100, unit: 'g' },
    // ...
  ],
  nutritionalValues: {
    calories: 350,
    carbs: 45,
    protein: 5,
    fat: 18
  }
};

const exampleModifiedRecipe = {
  id: 'example-1-mod',
  name: 'Ciasto czekoladowe (wersja niskowęglowodanowa)',
  ingredients: [
    { name: 'mąka migdałowa', amount: 200, unit: 'g' },
    { name: 'erytrytol', amount: 100, unit: 'g' },
    { name: 'masło', amount: 100, unit: 'g' },
    // ...
  ],
  nutritionalValues: {
    calories: 320,
    carbs: 12,
    protein: 9,
    fat: 26
  },
  modifications: {
    ingredientChanges: [
      { 
        original: 'mąka pszenna', 
        modified: 'mąka migdałowa',
        reason: 'Niższa zawartość węglowodanów, wyższy indeks białkowy'
      },
      { 
        original: 'cukier', 
        modified: 'erytrytol',
        reason: 'Zero kalorii, zero wpływu na poziom cukru we krwi'
      }
    ],
    carbsReduction: 73 // procentowa redukcja węglowodanów
  }
};
```

## 5. Hooki i zarządzanie stanem

### useAuth
```typescript
const useAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = async (data: ILoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Wywołanie API logowania
      // Zapisanie tokenu do localStorage
      // Przekierowanie do dashboardu
    } catch (err) {
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (data: IRegisterFormData) => {
    // Podobna implementacja jak login
  };
  
  return { isLoading, error, login, register };
};
```

### useModal
```typescript
const useModal = () => {
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);
  
  const openLoginModal = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };
  
  const openRegisterModal = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };
  
  const closeModals = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };
  
  return { 
    loginModalOpen, 
    registerModalOpen, 
    openLoginModal, 
    openRegisterModal, 
    closeModals 
  };
};
```

## 6. Integracja z API

### Endpointy
```typescript
// Logowanie
// POST /api/auth/login
// Payload: { email: string, password: string }
// Response: { token: string, userId: string }

// Rejestracja
// POST /api/auth/register
// Payload: { email: string, password: string }
// Response: { token: string, userId: string }

// Przykładowe przepisy (tylko dla strony głównej)
// GET /api/recipes/examples
// Response: { originalRecipe: IRecipe, modifiedRecipe: IModifiedRecipe }
```

## 7. Walidacja i obsługa błędów

### Walidacja formularzy
- Walidacja emaila: Regex dla poprawnego formatu adresu email
- Walidacja hasła: Min. 8 znaków, jedna wielka litera, jedna cyfra
- Walidacja potwierdzenia hasła: Identyczne jak hasło
- Akceptacja regulaminu: Wymagane zaznaczenie

### Komunikaty błędów
- Formatowanie pól: "Niepoprawny format email"
- Siła hasła: "Hasło musi zawierać min. 8 znaków, wielką literę i cyfrę"
- Niezgodność haseł: "Hasła nie są identyczne"
- Błędy API: "Nie udało się zalogować. Spróbuj ponownie."

## 8. Testy

### Testy jednostkowe
- Walidacja formularzy logowania i rejestracji
- Hooki useAuth i useModal
- Renderowanie komponentów z różnymi danymi

### Testy integracyjne
- Poprawne otwieranie/zamykanie modali
- Przesyłanie formularzy i obsługa odpowiedzi
- Nawigacja po stronie głównej

## 9. Dostępność i UX

### Dostępność
- Wszystkie obrazy mają teksty alternatywne
- Formularze dostępne z klawiatury
- Odpowiedni kontrast kolorów
- ARIA atrybuty dla komponentów interaktywnych

### Optymalizacja UX
- Jasne komunikaty o błędach blisko pól formularza
- Dezaktywacja przycisków podczas przetwarzania
- Wskaźniki ładowania (spinner)
- Automatyczne ustawienie fokusu na pierwszym polu formularza

## 10. Responsywność

### Breakpointy
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Zmiany layoutu
- Na mobile HeroSection ma mniejszy rozmiar i uproszczoną grafikę
- FeatureShowcase zmienia układ z rzędowego na kolumnowy
- RecipeComparison zmienia układ side-by-side na zakładki
- HowItWorks zmienia linię czasu na prostą listę

## 11. Bezpieczeństwo

- Walidacja danych wejściowych po stronie klienta i serwera
- Zabezpieczenie przed atakami XSS
- Weryfikacja CSRF przy wysyłaniu formularzy
- Szyfrowany transfer danych (HTTPS)
- Hasła przechowywane w bezpieczny sposób (bcrypt)

## 12. Potencjalne problemy i rozwiązania

- **Problem**: Długi czas ładowania przykładów przepisów
  **Rozwiązanie**: Dodanie placeholderów, ładowanie progresywne

- **Problem**: Niespójna wizualizacja na różnych przeglądarkach
  **Rozwiązanie**: Użycie CSS reset i testowanie cross-browser

- **Problem**: Niska konwersja z odwiedzin na rejestracje
  **Rozwiązanie**: A/B testy różnych wersji HeroSection i CTA 