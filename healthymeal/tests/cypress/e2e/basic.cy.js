describe('HealthyMeal aplikacja', () => {
  beforeEach(() => {
    // Odwiedź stronę główną aplikacji
    cy.visit('http://localhost:3000');
  });

  it('Wyświetla tytuł aplikacji', () => {
    // Sprawdź czy nagłówek strony jest widoczny
    cy.contains('HealthyMeal').should('be.visible');
  });

  it('Pozwala na rejestrację nowego użytkownika', () => {
    // Kliknij przycisk rejestracji, jeśli już nie jesteś zalogowany
    cy.contains('Zarejestruj się').click();
    
    // Wygeneruj unikalną nazwę użytkownika
    const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
    
    // Wypełnij formularz rejestracji
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type(randomEmail);
    cy.get('input[name="password"]').type('Test123456');
    cy.get('input[name="confirmPassword"]').type('Test123456');
    
    // Kliknij przycisk potwierdzenia rejestracji
    cy.contains('Zarejestruj').click();
    
    // Po rejestracji powinniśmy zostać przekierowani do dashboard
    cy.url().should('include', '/dashboard');
  });

  it('Pozwala na dodanie nowego przepisu', () => {
    // Logowanie (jeśli nie jesteśmy zalogowani)
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('Test123456');
    cy.contains('Zaloguj').click();
    
    // Przejdź do strony dodawania przepisu
    cy.contains('Dodaj przepis').click();
    
    // Wypełnij formularz przepisu
    cy.get('input[name="title"]').type('Test Recipe');
    cy.get('input[name="preparationTime"]').type('30');
    cy.get('select[name="difficulty"]').select('Łatwy');
    cy.get('input[name="servings"]').type('4');
    
    // Dodaj składniki
    cy.get('input[name="ingredients[0].name"]').type('Mąka pszenna');
    cy.get('input[name="ingredients[0].quantity"]').type('200');
    cy.get('input[name="ingredients[0].unit"]').type('g');
    
    // Dodaj kolejny składnik
    cy.contains('Dodaj składnik').click();
    cy.get('input[name="ingredients[1].name"]').type('Cukier');
    cy.get('input[name="ingredients[1].quantity"]').type('100');
    cy.get('input[name="ingredients[1].unit"]').type('g');
    
    // Dodaj kroki przygotowania
    cy.get('textarea[name="steps[0]"]').type('Wymieszać wszystkie składniki');
    cy.contains('Dodaj krok').click();
    cy.get('textarea[name="steps[1]"]').type('Piec w 180°C przez 30 minut');
    
    // Dodaj tagi
    cy.get('input[name="tags"]').type('deser, ciasto');
    
    // Wyślij formularz
    cy.contains('Dodaj przepis').click();
    
    // Po dodaniu przepisu powinniśmy zostać przekierowani do listy przepisów
    cy.url().should('include', '/recipes');
    
    // Sprawdź, czy przepis pojawił się na liście
    cy.contains('Test Recipe').should('be.visible');
  });

  it('Pozwala na modyfikację przepisu przy użyciu AI', () => {
    // Logowanie (jeśli nie jesteśmy zalogowani)
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('Test123456');
    cy.contains('Zaloguj').click();
    
    // Przejdź do listy przepisów
    cy.contains('Moje przepisy').click();
    
    // Kliknij pierwszy przepis na liście
    cy.get('.recipe-card').first().click();
    
    // Kliknij przycisk modyfikacji przepisu
    cy.contains('Modyfikuj z AI').click();
    
    // Wybierz preferencje dietetyczne
    cy.get('select[name="dietType"]').select('lowCarb');
    
    // Kliknij przycisk rozpoczęcia modyfikacji
    cy.contains('Rozpocznij modyfikację').click();
    
    // Poczekaj na wynik modyfikacji (może to zająć chwilę)
    cy.contains('Porównaj zmiany', { timeout: 30000 }).should('be.visible');
    
    // Kliknij przycisk zapisania zmodyfikowanego przepisu
    cy.contains('Zapisz zmodyfikowany przepis').click();
    
    // Po zapisaniu powinniśmy zostać przekierowani do listy przepisów
    cy.url().should('include', '/recipes');
  });
}); 