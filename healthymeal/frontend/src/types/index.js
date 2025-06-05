/**
 * @typedef {import('./supabase').User} User
 * @typedef {import('./supabase').UserPreferences} UserPreferences
 * @typedef {import('./supabase').Session} Session
 * @typedef {import('./supabase').AuthError} AuthError
 * @typedef {import('./supabase').AuthResponse} AuthResponse
 */

/**
 * @typedef {Object} Recipe
 * @property {string} _id - ID przepisu
 * @property {string} title - Tytuł przepisu
 * @property {Array<Ingredient>} ingredients - Lista składników
 * @property {Array<Step>} steps - Lista kroków przygotowania
 * @property {number} preparationTime - Czas przygotowania w minutach
 * @property {('easy'|'medium'|'hard')} difficulty - Poziom trudności
 * @property {number} servings - Liczba porcji
 * @property {Array<string>} tags - Tagi przepisu
 * @property {NutritionalValues} nutritionalValues - Wartości odżywcze
 * @property {boolean} isDeleted - Czy przepis został usunięty
 * @property {Date} createdAt - Data utworzenia
 * @property {Date} updatedAt - Data aktualizacji
 */

/**
 * @typedef {Object} Ingredient
 * @property {string} _id - ID składnika
 * @property {string} name - Nazwa składnika
 * @property {number} quantity - Ilość
 * @property {string} unit - Jednostka miary
 * @property {boolean} isOptional - Czy składnik jest opcjonalny
 * @property {Array<Alternative>} alternatives - Lista alternatyw
 */

/**
 * @typedef {Object} Alternative
 * @property {string} _id - ID alternatywnego składnika
 * @property {string} name - Nazwa alternatywnego składnika
 * @property {number} quantity - Ilość
 * @property {string} unit - Jednostka miary
 */

/**
 * @typedef {Object} Step
 * @property {number} number - Numer kroku
 * @property {string} description - Opis kroku
 * @property {number} [estimatedTime] - Szacowany czas w minutach
 */

/**
 * @typedef {Object} NutritionalValues
 * @property {number} totalCalories - Suma kalorii
 * @property {number} totalCarbs - Suma węglowodanów
 * @property {number} totalProtein - Suma białka
 * @property {number} totalFat - Suma tłuszczu
 * @property {number} totalFiber - Suma błonnika
 * @property {number} caloriesPerServing - Kalorie na porcję
 * @property {number} carbsPerServing - Węglowodany na porcję
 */

/**
 * @typedef {Object} ModifiedRecipe
 * @property {string} _id - ID zmodyfikowanego przepisu
 * @property {Recipe} originalRecipe - Oryginalny przepis
 * @property {string} title - Nowy tytuł
 * @property {Array<ModifiedIngredient>} ingredients - Zmodyfikowane składniki
 * @property {Array<ModifiedStep>} steps - Zmodyfikowane kroki
 * @property {NutritionalValues} nutritionalValues - Nowe wartości odżywcze
 * @property {string} changesDescription - Opis wprowadzonych zmian
 * @property {string} [aiPrompt] - Prompt wysłany do AI
 */

/**
 * @typedef {Object} ModifiedIngredient
 * @property {Ingredient} ingredient - Składnik
 * @property {boolean} isModified - Czy składnik został zmodyfikowany
 * @property {string} [substitutionReason] - Powód zmiany składnika
 */

/**
 * @typedef {Object} ModifiedStep
 * @property {Step} step - Krok
 * @property {boolean} isModified - Czy krok został zmodyfikowany
 * @property {string} [modificationReason] - Powód modyfikacji kroku
 */

/**
 * @typedef {Object} RecipeFormData
 * @property {string} title - Tytuł przepisu
 * @property {Array<Ingredient>} ingredients - Lista składników
 * @property {Array<Step>} steps - Lista kroków
 * @property {number} preparationTime - Czas przygotowania
 * @property {string} difficulty - Poziom trudności
 * @property {number} servings - Liczba porcji
 * @property {Array<string>} tags - Tagi
 */

/**
 * @template T
 * @typedef {Object} APIResponse
 * @property {T} [data] - Dane odpowiedzi
 * @property {string} [error] - Komunikat błędu
 * @property {string} [message] - Komunikat
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {number} total - Całkowita liczba wyników
 * @property {number} page - Numer strony
 * @property {number} limit - Limit wyników na stronę
 * @property {Array<T>} data - Lista wyników
 */

/**
 * @typedef {Object} RecipeFeedback
 * @property {string} _id - Identyfikator zgłoszenia
 * @property {User} user - Informacje o użytkowniku zgłaszającym
 * @property {'original'|'modified'} recipeType - Typ przepisu
 * @property {Recipe|ModifiedRecipe} recipe - Przepis, którego dotyczy zgłoszenie
 * @property {'error'|'suggestion'|'improvement'} feedbackType - Typ zgłoszenia
 * @property {string} description - Treść zgłoszenia
 * @property {'pending'|'resolved'|'rejected'} status - Status zgłoszenia
 */

export {}; 