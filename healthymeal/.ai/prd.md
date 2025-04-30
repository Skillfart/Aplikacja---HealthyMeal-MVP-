# Dokument wymagań produktu (PRD) - HealthyMeal

## 1. Przegląd produktu
HealthyMeal to aplikacja webowa, która rozwiązuje problem dostosowywania przepisów kulinarnych do indywidualnych potrzeb żywieniowych. MVP (Minimum Viable Product) aplikacji pozwala użytkownikom na zapisywanie własnych przepisów oraz modyfikowanie ich przy pomocy sztucznej inteligencji (AI) zgodnie z preferencjami żywieniowymi i ograniczeniami dietetycznymi.

Główną grupą docelową aplikacji są osoby z problemami gospodarki węglowodanowej, w szczególności osoby z insulinoopornością i cukrzycą typu 2. HealthyMeal umożliwia im bezpieczne korzystanie z ulubionych przepisów poprzez automatyczne dostosowanie składników i proporcji do ich potrzeb zdrowotnych.

Produkt wykorzystuje model AI (Claude 3 Sonnet) do analizy przepisów i proponowania zmian zgodnych z preferencjami użytkownika, takimi jak ograniczenia węglowodanowe, wykluczenie alergenów czy przestrzeganie określonego typu diety.

## 2. Problem użytkownika
Osoby z problemami zdrowotnymi związanymi z gospodarką węglowodanową (insulinooporność, cukrzyca typu 2) napotykają znaczące trudności w adaptacji ogólnodostępnych przepisów kulinarnych do swoich potrzeb:

1. Konieczność ręcznego przeliczania wartości odżywczych i modyfikowania składników jest czasochłonna i wymaga specjalistycznej wiedzy.
2. Modyfikacja przepisów często prowadzi do utraty walorów smakowych potraw.
3. Znalezienie alternatywnych składników o niskim indeksie glikemicznym, które zachowają charakter dania, jest wyzwaniem.
4. Dostępne przepisy rzadko uwzględniają ograniczenia węglowodanowe lub inne specjalne wymagania dietetyczne.
5. Dostosowanie przepisu wymaga jednoczesnego uwzględnienia wielu czynników: poziom węglowodanów, alergeny, preferencje smakowe.

HealthyMeal rozwiązuje te problemy, automatyzując proces modyfikacji przepisów przy jednoczesnym zachowaniu walorów smakowych i wartości odżywczych. Aplikacja eliminuje potrzebę samodzielnego szukania alternatyw dla składników i pozwala użytkownikom cieszyć się ulubionymi potrawami bez pogarszania stanu zdrowia.

## 3. Wymagania funkcjonalne
1. System zarządzania kontem użytkownika:
   - Rejestracja użytkownika poprzez formularz z polami: adres e-mail i hasło (min. 8 znaków).
   - Logowanie do systemu z walidacją zgodności danych z bazą.
   - Profil użytkownika z możliwością wyboru typu diety, określenia maksymalnej ilości węglowodanów, listy produktów do wykluczenia oraz wyboru alergenów.

2. Zarządzanie przepisami:
   - Dodawanie przepisów poprzez formularz z obowiązkowymi polami: nazwa dania, składniki, instrukcja przygotowania.
   - Przeglądanie listy zapisanych przepisów i podgląd szczegółów przepisu.
   - Edycja i usuwanie przepisów z możliwością modyfikacji wszystkich pól.
   - Wyszukiwanie przepisów po tytule lub składnikach oraz filtrowanie według czasu przygotowania, poziomu trudności i typu diety.

3. Modyfikacja przepisów z pomocą AI:
   - Dostosowywanie istniejących przepisów do preferencji użytkownika.
   - Wyświetlanie oryginalnego i zmodyfikowanego przepisu z oznaczeniem zmian.
   - Limit 5 modyfikacji przepisów dziennie na użytkownika.
   - Zapisywanie zmodyfikowanych przepisów do własnej biblioteki.

4. Dashboard użytkownika:
   - "Przepis dnia" dopasowany do preferencji żywieniowych użytkownika.
   - Lista zapisanych przepisów z szybkim dostępem.
   - Licznik wykorzystanych modyfikacji AI.
   - Szybki dostęp do edycji preferencji żywieniowych.

5. System zgłaszania błędów:
   - Możliwość zgłaszania błędów w przepisach poprzez dedykowany formularz.
   - Zgłaszanie sugestii dotyczących funkcjonalności aplikacji.

6. Drukowanie przepisów:
   - Funkcja drukowania przepisów z wykorzystaniem możliwości przeglądarki.
   - Optymalizacja widoku do druku (usunięcie elementów interfejsu).

## 4. Granice produktu
1. Poza zakresem MVP:
   - Import przepisów z adresu URL.
   - Obsługa multimediów (zdjęcia przepisów, filmy instruktażowe).
   - Udostępnianie przepisów innym użytkownikom.
   - Funkcje społecznościowe (komentarze, polubienia).
   - Aplikacja mobilna (tylko wersja webowa).
   - Integracja z zewnętrznymi bazami danych wartości odżywczych.
   - System ocen/recenzji przepisów.
   - Automatyczna weryfikacja poprawności przepisów generowanych przez AI.
   - Logowanie przez zewnętrzne serwisy (Google, Facebook).
   - Zaawansowana analityka składników i wartości odżywczych.

## 5. Historyjki użytkowników

ID: US-001
Tytuł: Rejestracja nowego konta
Opis: Jako nowy użytkownik, chcę utworzyć konto w aplikacji, aby móc korzystać z jej funkcji.
Kryteria akceptacji:
- Użytkownik może wprowadzić adres e-mail i hasło (min. 8 znaków)
- System waliduje poprawność adresu e-mail i siłę hasła
- Po poprawnej rejestracji użytkownik jest automatycznie zalogowany
- Użytkownik jest przekierowany do ekranu początkowego/dashboardu

ID: US-002
Tytuł: Logowanie do aplikacji
Opis: Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji, aby uzyskać dostęp do moich przepisów i preferencji.
Kryteria akceptacji:
- Użytkownik może wprowadzić adres e-mail i hasło
- System weryfikuje poprawność danych logowania
- Po poprawnym zalogowaniu użytkownik jest przekierowany do dashboardu
- W przypadku błędnych danych system wyświetla odpowiedni komunikat

ID: US-003
Tytuł: Konfiguracja preferencji żywieniowych
Opis: Jako nowy użytkownik, chcę skonfigurować moje preferencje żywieniowe, aby otrzymywać przepisy dostosowane do moich potrzeb.
Kryteria akceptacji:
- Użytkownik może wybrać typ diety z predefiniowanej listy
- Użytkownik może określić maksymalną ilość węglowodanów w posiłku/dziennie
- Użytkownik może dodać listę produktów do wykluczenia
- Użytkownik może wybrać alergeny z predefiniowanej listy
- System zapisuje preferencje w profilu użytkownika

ID: US-004
Tytuł: Dodawanie nowego przepisu
Opis: Jako użytkownik, chcę dodać własny przepis do systemu, aby móc go później modyfikować za pomocą AI.
Kryteria akceptacji:
- Użytkownik może wprowadzić nazwę dania, listę składników i instrukcję przygotowania
- Użytkownik może opcjonalnie dodać czas przygotowania, liczbę porcji i poziom trudności
- Użytkownik może przypisać tagi żywieniowe do przepisu
- System zapisuje przepis w bazie danych i wiąże go z kontem użytkownika
- Po zapisaniu użytkownik widzi przepis na liście swoich przepisów

ID: US-010
Tytuł: Modyfikacja przepisu przez AI
Opis: Jako osoba z insulinoopornością, chcę dostosować przepis do moich potrzeb dietetycznych za pomocą AI, aby bezpiecznie cieszyć się ulubionymi potrawami.
Kryteria akceptacji:
- Użytkownik może wybrać istniejący przepis do modyfikacji
- System automatycznie uwzględnia preferencje z profilu użytkownika
- Użytkownik może zainicjować proces modyfikacji przyciskiem "Modyfikuj przepis"
- System komunikuje się z AI i przetwarza przepis zgodnie z preferencjami
- System wyświetla zmodyfikowany przepis obok oryginalnego

ID: US-011
Tytuł: Porównanie oryginalnego i zmodyfikowanego przepisu
Opis: Jako osoba na diecie niskowęglowodanowej, chcę zobaczyć jakie dokładnie zmiany zostały wprowadzone w przepisie, aby rozumieć, dlaczego dana zmiana jest korzystna.
Kryteria akceptacji:
- System wyświetla oryginalny i zmodyfikowany przepis obok siebie
- Zmienione składniki są oznaczone kolorem lub tooltipem
- System wyświetla podsumowanie wprowadzonych zmian
- Użytkownik może przełączać się między widokiem oryginalnym a zmodyfikowanym

ID: US-009
Tytuł: Bezpieczny dostęp i autoryzacja
Opis: Jako zalogowany użytkownik, chcę mieć pewność, że moje przepisy i preferencje żywieniowe są bezpieczne i prywatne.
Kryteria akceptacji:
- Dostęp do aplikacji wymaga poprawnego zalogowania
- Użytkownik ma dostęp tylko do własnych przepisów i danych
- Dane użytkownika są zabezpieczone zgodnie z najlepszymi praktykami
- Sesja użytkownika jest automatycznie zamykana po okresie nieaktywności

## 6. Metryki sukcesu
1. Efektywność wypełniania profilu:
   - 90% użytkowników posiada wypełnioną sekcję preferencji żywieniowych w swoim profilu
   - Pomiar: (Liczba użytkowników z wypełnionymi preferencjami / Całkowita liczba użytkowników) * 100%

2. Zaangażowanie w generowanie przepisów:
   - 75% użytkowników generuje jeden lub więcej przepisów w tygodniu
   - Pomiar: (Liczba użytkowników generujących przepisy w ciągu tygodnia / Całkowita liczba użytkowników) * 100%

3. Jakość modyfikacji przepisów:
   - Monitorowanie liczby zgłoszonych błędów w przepisach
   - Średnia liczba zmian wprowadzanych przez AI na przepis
   - Procent użytkowników zapisujących zmodyfikowane przepisy

## 7. Szczegółowe wymagania dotyczące autentykacji użytkownika

### 7.1 Technologia autentykacji
1. **Metoda autentykacji:** 
   - JWT (JSON Web Token) jako standard autentykacji
   - Tokeny przechowywane w localStorage przeglądarki
   - Czas ważności tokena: 24 godziny

2. **Bezpieczeństwo danych:**
   - Hashowanie haseł z użyciem bcrypt z saltingiem
   - Minimalna długość hasła: 8 znaków, wymagane co najmniej 1 duża litera i 1 cyfra
   - Weryfikacja tokena przy każdym żądaniu do chronionego API

### 7.2 Przepływ autentykacji
1. **Rejestracja użytkownika:**
   - Formularz wymagający: email, hasło i imię
   - Walidacja unikalności emaila
   - Automatyczne logowanie po pomyślnej rejestracji
   - Przekierowanie do dashboardu po rejestracji

2. **Logowanie użytkownika:**
   - Formularz zbierający email i hasło
   - Zwracanie tokena JWT po pomyślnym logowaniu
   - Zapisanie tokena w localStorage
   - Przekierowanie do dashboardu po zalogowaniu

3. **Wylogowanie:**
   - Usunięcie tokena z localStorage
   - Przekierowanie do strony głównej
   - Blokada dostępu do chronionych zasobów

4. **Odzyskiwanie hasła:**
   - *[Przyszła funkcjonalność]* Mechanizm resetowania hasła przez email

### 7.3 Architektura dostępu do chronionych zasobów
1. **Zabezpieczenie stron:**
   - Komponent PrivateRoute opakowujący chronione strony
   - Weryfikacja tokena przed renderowaniem chronionych komponentów
   - Automatyczne przekierowanie do strony logowania przy braku/wygaśnięciu tokena

2. **Chronione zasoby aplikacji:**
   - Dashboard (`/dashboard`)
   - Zarządzanie przepisami (`/recipes/*`)
   - Profil użytkownika (`/profile/*`)
   - System zgłoszeń (`/feedback`)

3. **Publiczne zasoby:**
   - Strona główna (`/`)
   - Strona błędu 404 (`/404`)
   - Strony informacyjne (FAQ, O nas, Kontakt)

### 7.4 Interfejs użytkownika autentykacji
1. **Nawigacja dla niezalogowanych użytkowników:**
   - Przyciski "Zaloguj się" i "Zarejestruj się" w nagłówku strony głównej
   - Modalne okna logowania/rejestracji
   - Przejrzyste komunikaty o błędach

2. **Nawigacja dla zalogowanych użytkowników:**
   - Spójny pasek nawigacyjny na wszystkich chronionych stronach zawierający:
     - Logo/nazwę aplikacji
     - Menu nawigacyjne z linkami do głównych sekcji
     - Informację o zalogowanym użytkowniku (imię/email)
     - Przycisk wylogowania
     - Wskaźnik wykorzystania dziennego limitu AI

3. **Komunikacja statusu:**
   - Toast/powiadomienia o pomyślnym zalogowaniu/wylogowaniu
   - Komunikat o wygaśnięciu sesji z możliwością ponownego zalogowania
   - Informacja o pozostałym czasie sesji

### 7.5 Wymagania bezpieczeństwa
1. **Ochrona API:**
   - Wszystkie chronione endpointy API wymagają ważnego tokena JWT
   - Walidacja uprawnień użytkownika dla każdego żądania
   - Blokowanie dostępu do zasobów innych użytkowników

2. **Zabezpieczenia przed typowymi atakami:**
   - Ochrona przed CSRF (Cross-Site Request Forgery)
   - Limity prób logowania (3 próby przed tymczasową blokadą)
   - Sanityzacja danych wejściowych

3. **Monitorowanie bezpieczeństwa:**
   - Logowanie nieudanych prób logowania
   - Monitorowanie nietypowych wzorców dostępu
   - System powiadomień o potencjalnych naruszeniach bezpieczeństwa