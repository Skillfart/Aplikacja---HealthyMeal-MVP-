# Architektura UI dla HealthyMeal

## 1. Przegląd struktury UI

HealthyMeal to aplikacja webowa zaprojektowana dla osób z problemami gospodarki węglowodanowej, szczególnie insulinoopornością i cukrzycą typu 2. Interfejs użytkownika zapewnia intuicyjną nawigację i efektywne zarządzanie przepisami kulinarnymi, umożliwiając ich dostosowanie do indywidualnych potrzeb dietetycznych przy pomocy AI.

Główna struktura UI bazuje na układzie z menu bocznym (sidebar) dla nawigacji oraz obszarem roboczym zajmującym większość ekranu. Kluczowym aspektem architektury jest wyraźne oznaczenie modyfikacji przepisów dokonanych przez AI (kolorystyka zmian, tooltips z wyjaśnieniami) oraz prosty monitoring dziennego limitu modyfikacji.

Interfejs został zaprojektowany z myślą o podstawowej responsywności (MVP), z pełną optymalizacją doświadczenia na urządzeniach mobilnych planowaną w przyszłych iteracjach.

## 2. Lista widoków

### Strona startowa (niezalogowany użytkownik)
- **Ścieżka widoku**: `/`
- **Główny cel**: Prezentacja wartości aplikacji, zachęcenie do rejestracji
- **Kluczowe informacje**: Opis korzyści z używania aplikacji, informacja o dopasowywaniu przepisów do potrzeb osób z insulinoopornością, demo funkcjonalności
- **Kluczowe komponenty**:
  - Hero section z głównym przekazem wartości
  - Przykładowe porównanie oryginalnego i zmodyfikowanego przepisu
  - Przyciski CTA (Rejestracja/Logowanie)
  - Prezentacja procesu modyfikacji przepisu
- **UX i dostępność**: Czytelne wyjaśnienie wartości aplikacji, jasne CTA, responsywny design

### Rejestracja
- **Ścieżka widoku**: `/auth/register`
- **Główny cel**: Umożliwienie utworzenia konta w aplikacji
- **Kluczowe informacje**: Pola formularza (email, hasło), informacje o polityce prywatności
- **Kluczowe komponenty**:
  - Formularz rejestracyjny z walidacją pól
  - Informacja o wymaganiach dot. hasła
  - Link do strony logowania
- **UX i dostępność**: Wyraźne komunikaty walidacyjne, minimalna liczba wymaganych pól, dostępność z klawiatury
- **Bezpieczeństwo**: CSRF protection, walidacja hasła (min. 8 znaków), reCAPTCHA

### Logowanie
- **Ścieżka widoku**: `/auth/login`
- **Główny cel**: Umożliwienie zalogowania się do systemu
- **Kluczowe informacje**: Pola formularza (email, hasło), opcja "Zapomniałem hasła"
- **Kluczowe komponenty**:
  - Formularz logowania
  - Link do rejestracji
  - Link do odzyskiwania hasła
- **UX i dostępność**: Jasne komunikaty błędów, zapamiętywanie adresu email, dostępność z klawiatury
- **Bezpieczeństwo**: Blokada po kilku nieudanych próbach, CSRF protection

### Onboarding (konfiguracja preferencji)
- **Ścieżka widoku**: `/onboarding`
- **Główny cel**: Konfiguracja preferencji żywieniowych po pierwszej rejestracji
- **Kluczowe informacje**: Opcje dotyczące diety, limitu węglowodanów, wykluczonych produktów, alergenów
- **Kluczowe komponenty**:
  - Formularz krokowy (wizard)
  - Dropdown z typami diet
  - Suwak dla maksymalnej ilości węglowodanów
  - Multiselect dla alergenów
  - Pole z tagami dla wykluczonych produktów
- **UX i dostępność**: Możliwość pominięcia i uzupełnienia później, zapisywanie postępu, jasne etykiety pól
- **Bezpieczeństwo**: Walidacja danych wejściowych

### Dashboard użytkownika
- **Ścieżka widoku**: `/dashboard`
- **Główny cel**: Centrum kontrolne z szybkim dostępem do kluczowych informacji i funkcji
- **Kluczowe informacje**: Przepis dnia, ostatnie przepisy, wskaźnik wykorzystania AI, szybki dostęp do edycji preferencji
- **Kluczowe komponenty**:
  - Karta z przepisem dnia
  - Sekcja z ostatnio dodanymi/zmodyfikowanymi przepisami
  - Wskaźnik wykorzystania dziennego limitu AI (pasek postępu + licznik)
  - Karta szybkiego dostępu do preferencji żywieniowych
- **UX i dostępność**: Logiczny układ informacji, wyraźne rozróżnienie sekcji, responsywność
- **Bezpieczeństwo**: Wyświetlanie tylko danych zalogowanego użytkownika

### Lista przepisów
- **Ścieżka widoku**: `/recipes`
- **Główny cel**: Przeglądanie wszystkich przepisów użytkownika z opcjami filtrowania i wyszukiwania
- **Kluczowe informacje**: Lista przepisów z podstawowymi informacjami, filtry, wyszukiwarka
- **Kluczowe komponenty**:
  - Przełącznik widoku (karty/tabela)
  - Pasek wyszukiwania
  - Filtry podstawowe (zawsze widoczne)
  - Rozwijany panel filtrów zaawansowanych
  - Karty przepisów z miniaturkami i podstawowymi informacjami
  - Paginacja lub nieskończone przewijanie
- **UX i dostępność**: Zapamiętywanie ustawień filtrów, responsywny układ kart/listy, wskaźniki ładowania
- **Bezpieczeństwo**: Filtrowanie wyników tylko do przepisów użytkownika

### Szczegóły przepisu
- **Ścieżka widoku**: `/recipes/:id`
- **Główny cel**: Wyświetlenie pełnych informacji o wybranym przepisie
- **Kluczowe informacje**: Nazwa przepisu, składniki, kroki przygotowania, wartości odżywcze, tagi
- **Kluczowe komponenty**:
  - Nagłówek z tytułem i podstawowymi informacjami (czas, trudność, porcje)
  - Lista składników z ilościami
  - Numerowana lista kroków przygotowania
  - Panel wartości odżywczych
  - Przyciski akcji (Edytuj, Usuń, Modyfikuj przez AI, Drukuj)
- **UX i dostępność**: Sticky nagłówki dla długich list, responsywny układ, czytelna typografia
- **Bezpieczeństwo**: Weryfikacja dostępu do przepisu

### Dodawanie/edycja przepisu
- **Ścieżka widoku**: `/recipes/new` lub `/recipes/:id/edit`
- **Główny cel**: Dodanie nowego lub edycja istniejącego przepisu
- **Kluczowe informacje**: Formularz z wszystkimi polami przepisu
- **Kluczowe komponenty**:
  - Formularz krokowy (wizard) z sekcjami:
    1. Informacje podstawowe (nazwa, czas, trudność, porcje)
    2. Składniki (dynamiczny formularz dodawania składników)
    3. Kroki przygotowania (dynamiczny formularz)
    4. Tagi i dodatkowe informacje
  - Dynamiczne pola do dodawania/usuwania składników i kroków
  - Autouzupełnianie dla nazw składników
- **UX i dostępność**: Automatyczne zapisywanie wersji roboczej, walidacja pól, możliwość cofania się między krokami
- **Bezpieczeństwo**: Sanityzacja danych wejściowych, CSRF protection

### Modyfikacja przepisu przez AI
- **Ścieżka widoku**: `/recipes/:id/modify`
- **Główny cel**: Inicjacja i monitoring procesu modyfikacji przepisu przez AI
- **Kluczowe informacje**: Status procesu modyfikacji, preferencje użytkownika uwzględniane przy modyfikacji
- **Kluczowe komponenty**:
  - Informacja o dziennym limicie modyfikacji AI
  - Podgląd preferencji uwzględnianych przy modyfikacji
  - Wskaźnik postępu z dynamicznymi komunikatami
  - Przycisk do anulowania procesu
- **UX i dostępność**: Wyraźne komunikaty o postępie, szacowany czas oczekiwania
- **Bezpieczeństwo**: Weryfikacja limitu modyfikacji AI, ochrona przed CSRF

### Porównanie przepisów (oryginalny vs. zmodyfikowany)
- **Ścieżka widoku**: `/recipes/compare?originalId=:id1&modifiedId=:id2`
- **Główny cel**: Wyświetlenie różnic między oryginalnym a zmodyfikowanym przepisem
- **Kluczowe informacje**: Oba przepisy obok siebie, oznaczone zmiany, podsumowanie zmian
- **Kluczowe komponenty**:
  - Układ side-by-side dla desktopa lub zakładki dla urządzeń mobilnych
  - Kolorowe oznaczenia zmian w składnikach i krokach
  - Tooltips z wyjaśnieniami zmian
  - Wskaźnik redukcji węglowodanów
  - Przyciski akcji (Zapisz modyfikację, Odrzuć)
- **UX i dostępność**: Wyraźne oznaczenia zmian, możliwość przełączania się między widokami
- **Bezpieczeństwo**: Weryfikacja dostępu do obu przepisów

### Lista zmodyfikowanych przepisów
- **Ścieżka widoku**: `/recipes/modified`
- **Główny cel**: Przeglądanie wszystkich zmodyfikowanych przepisów
- **Kluczowe informacje**: Lista zmodyfikowanych przepisów z informacją o oryginale, datą modyfikacji i redukcją węglowodanów
- **Kluczowe komponenty**:
  - Filtry (podobne jak w standardowej liście przepisów)
  - Karty zmodyfikowanych przepisów
  - Powiązania z oryginalnymi przepisami
  - Wskaźniki redukcji węglowodanów
- **UX i dostępność**: Możliwość szybkiego porównania z oryginałem, podobny układ jak standardowa lista przepisów
- **Bezpieczeństwo**: Filtrowanie wyników tylko do zmodyfikowanych przepisów użytkownika

### Profil użytkownika i preferencje
- **Ścieżka widoku**: `/profile` i `/profile/preferences`
- **Główny cel**: Zarządzanie kontem i preferencjami żywieniowymi
- **Kluczowe informacje**: Dane konta, preferencje żywieniowe
- **Kluczowe komponenty**:
  - Formularz zmiany hasła
  - Formularz preferencji żywieniowych (typ diety, maks. węglowodany, wykluczone produkty, alergeny)
  - Historia modyfikacji przepisów
- **UX i dostępność**: Jasny podział na sekcje, automatyczne zapisywanie zmian w preferencjach
- **Bezpieczeństwo**: Walidacja hasła, potwierdzenie przy zmianie istotnych danych

### System zgłaszania błędów
- **Ścieżka widoku**: `/feedback` i `/feedback/new`
- **Główny cel**: Zgłaszanie błędów w przepisach lub sugestii dla aplikacji
- **Kluczowe informacje**: Formularz zgłoszenia, lista wysłanych zgłoszeń
- **Kluczowe komponenty**:
  - Formularz zgłoszenia z wyborem typu (błąd, sugestia)
  - Pole wyboru przepisu (jeśli zgłoszenie dotyczy przepisu)
  - Pole opisowe
  - Lista wysłanych zgłoszeń ze statusami
- **UX i dostępność**: Prosty i szybki proces zgłaszania, komunikaty potwierdzające
- **Bezpieczeństwo**: Sanityzacja danych wejściowych, ograniczenia na liczbę zgłoszeń

### Widok drukowania
- **Ścieżka widoku**: `/recipes/:id/print`
- **Główny cel**: Zoptymalizowana wersja przepisu do druku
- **Kluczowe informacje**: Przepis bez elementów interfejsu, zoptymalizowany do druku
- **Kluczowe komponenty**:
  - Czysta wersja przepisu (tylko zawartość)
  - Automatyczna optymalizacja dla drukarki (print media)
  - Opcja wyboru formatu (HTML/PDF)
- **UX i dostępność**: Zoptymalizowany do druku, opcja wyboru zakresu drukowanych informacji
- **Bezpieczeństwo**: Weryfikacja dostępu do przepisu

## 3. Mapa podróży użytkownika

### Pierwszy kontakt z aplikacją
1. Użytkownik trafia na stronę startową z opisem wartości aplikacji
2. Decyduje się zarejestrować, wypełnia formularz rejestracyjny
3. Po rejestracji jest automatycznie zalogowany
4. Pojawia się opcjonalny onboarding do konfiguracji preferencji żywieniowych
5. Po ukończeniu (lub pominięciu) onboardingu trafia na dashboard

### Dodawanie przepisu
1. Z dashboardu lub menu użytkownik wybiera "Dodaj przepis"
2. Przechodzi przez formularz krokowy (wizard):
   - Wprowadza podstawowe informacje (nazwa, czas, trudność, porcje)
   - Dodaje składniki (dynamicznie może dodawać kolejne pola)
   - Dodaje kroki przygotowania
   - Dodaje tagi i dodatkowe informacje
3. Po zapisaniu trafia do widoku szczegółów nowego przepisu

### Modyfikacja przepisu przez AI
1. Z widoku szczegółów przepisu użytkownik wybiera opcję "Modyfikuj przez AI"
2. System sprawdza dostępny limit dziennych modyfikacji (5/dzień)
3. Użytkownik widzi ekran z informacją o postępie modyfikacji
4. Po zakończeniu procesu, użytkownik widzi porównanie przepisów (side-by-side)
5. Może zapisać zmodyfikowaną wersję lub odrzucić
6. Po zapisaniu trafia do listy przepisów lub widoku zapisanej modyfikacji

### Zarządzanie preferencjami
1. Z menu lub dashboardu użytkownik przechodzi do sekcji profilu/preferencji
2. Edytuje ustawienia diety, maksymalnej ilości węglowodanów
3. Zarządza listą wykluczonych produktów i alergenów
4. Zapisuje zmiany, które będą uwzględniane przy kolejnych modyfikacjach przez AI

### Zgłaszanie błędu
1. Z widoku przepisu lub menu użytkownik wybiera opcję zgłoszenia błędu
2. Wypełnia formularz, wybierając typ zgłoszenia i opisując problem
3. Wysyła zgłoszenie i otrzymuje potwierdzenie
4. Może później sprawdzić status zgłoszenia w sekcji "Moje zgłoszenia"

## 4. Układ i struktura nawigacji

### Główna nawigacja (menu boczne)
- **Logo/Nazwa aplikacji** (link do dashboardu)
- **Dashboard** - centrum kontrolne
- **Przepisy**
  - Lista przepisów
  - Dodaj przepis
  - Zmodyfikowane przepisy
- **Preferencje żywieniowe**
- **Zgłoszenia**
- **Konto**
  - Profil
  - Ustawienia
  - Wyloguj

### Nawigacja górna (navbar)
- **Wyszukiwarka globalna** - szybkie wyszukiwanie przepisów
- **Licznik modyfikacji AI** - wskaźnik wykorzystania dziennego limitu (np. "3/5 pozostało")
- **Menu użytkownika** (dropdown)
  - Profil
  - Preferencje
  - Wyloguj

### Logika nawigacji
- Dashboard jest centrum kontrolnym i punktem startowym po zalogowaniu
- Z każdego widoku użytkownik może wrócić do dashboardu (logo/home)
- Struktura przepisów jest hierarchiczna (lista > szczegóły > modyfikacja)
- Profil i preferencje są dostępne z menu bocznego i górnego dropdownu
- Z widoku szczegółów przepisu dostępne są akcje: edycja, modyfikacja przez AI, drukowanie

## 5. Kluczowe komponenty

### Karta przepisu
- **Cel**: Spójna prezentacja przepisu na listach i w widoku szczegółowym
- **Warianty**:
  - Wersja kompaktowa (na listach, dashboardzie)
  - Wersja rozszerzona (w widoku szczegółowym)
- **Zawartość**: Tytuł, podstawowe informacje (czas, trudność, tagi), wartości odżywcze
- **Interakcje**: Kliknięcie przenosi do widoku szczegółowego

### Komponent porównania przepisów
- **Cel**: Wizualizacja różnic między oryginałem a zmodyfikowaną wersją
- **Warianty**:
  - Side-by-side (desktop)
  - Zakładki przełączane (mobile)
- **Zawartość**: Oba przepisy z oznaczonymi zmianami, podsumowanie zmian
- **Interakcje**: Hover/kliknięcie na zmieniony element pokazuje tooltip z wyjaśnieniem zmiany

### Wskaźnik limitu AI
- **Cel**: Informowanie o wykorzystaniu dziennego limitu modyfikacji AI
- **Warianty**:
  - Wersja pełna (pasek postępu + licznik)
  - Wersja mini (tylko licznik, np. w navbar)
- **Zawartość**: Wskaźnik wizualny, liczba wykorzystanych/dostępnych modyfikacji
- **Interakcje**: Hover pokazuje tooltip z informacją o resecie o północy

### Dynamiczny formularz składników
- **Cel**: Intuicyjne zarządzanie składnikami w przepisie
- **Zawartość**: Pola dla składnika, ilości, jednostki, opcjonalności
- **Interakcje**:
  - Dodawanie/usuwanie wierszy
  - Autouzupełnianie nazw składników
  - Sortowanie składników (drag & drop)

### Wizard dodawania przepisu
- **Cel**: Podzielenie złożonego formularza na logiczne, zarządzalne kroki
- **Warianty**: 3-4 kroki (informacje podstawowe, składniki, kroki, meta)
- **Zawartość**: Formularz z nawigacją między krokami, wskaźnik postępu
- **Interakcje**: Nawigacja (wstecz/dalej), automatyczne zapisywanie wersji roboczej

### System notyfikacji
- **Cel**: Informowanie użytkownika o wynikach akcji i błędach
- **Warianty**:
  - Toasty dla globalnych komunikatów
  - Inline dla błędów walidacji
- **Zawartość**: Komunikat tekstowy, ikona statusu, opcjonalnie przycisk akcji
- **Interakcje**: Automatyczne znikanie, możliwość ręcznego zamknięcia

### Komponenty filtrowania
- **Cel**: Efektywne przeszukiwanie listy przepisów
- **Warianty**:
  - Podstawowe (zawsze widoczne)
  - Zaawansowane (w rozwijanym panelu)
- **Zawartość**: Wyszukiwarka, dropdown z kategoriami, filtry zakresowe
- **Interakcje**: Automatyczne aplikowanie filtrów, zapamiętywanie ustawień 