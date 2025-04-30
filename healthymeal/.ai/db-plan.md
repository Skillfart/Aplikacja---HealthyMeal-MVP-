## Schemat bazy danych MongoDB dla aplikacji HealthyMeal

## 1. Definicje kolekcji

### User
```javascript
{
  _id: ObjectId,                     // automatycznie generowane przez MongoDB
  email: String,                     // unikalny, wymagany
  password: String,                  // wymagany, hashowany (bcrypt)
  createdAt: Date,                   // data utworzenia konta
  updatedAt: Date,                   // data ostatniej aktualizacji
  preferences: {
    dietType: String,                // enum: ['keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'normal', ...]
    maxCarbs: Number,                // maksymalna ilość węglowodanów na posiłek (w gramach)
    excludedProducts: [String],      // lista produktów do wykluczenia
    allergens: [String]              // lista alergenów do wykluczenia
  },
  aiUsage: {
    date: Date,                      // data ostatniego resetowania licznika
    count: Number                    // liczba użyć AI danego dnia (limit: 5)
  },
  isActive: Boolean,                 // flaga aktywności konta
  lastLogin: Date                    // data ostatniego logowania
}
```

### Ingredient
```javascript
{
  _id: ObjectId,                     // automatycznie generowane przez MongoDB
  name: String,                      // wymagany, unikatowy
  alternativeNames: [String],        // alternatywne nazwy składnika
  nutritionalValues: {
    calories: Number,                // kcal na 100g
    carbs: Number,                   // węglowodany na 100g
    protein: Number,                 // białko na 100g
    fat: Number,                     // tłuszcz na 100g
    fiber: Number,                   // błonnik na 100g
    sugar: Number                    // cukier na 100g
  },
  glycemicIndex: Number,             // indeks glikemiczny (opcjonalny)
  allergens: [String],               // lista alergenów zawartych w składniku
  category: String,                  // kategoria składnika (np. 'dairy', 'meat', 'vegetable')
  createdAt: Date,
  updatedAt: Date
}
```

### Recipe
```javascript
{
  _id: ObjectId,                     // automatycznie generowane przez MongoDB
  title: String,                     // wymagany
  user: {
    _id: ObjectId,                   // referencja do użytkownika, który utworzył przepis
    email: String                    // denormalizacja dla szybszego dostępu
  },
  ingredients: [{
    ingredient: {
      _id: ObjectId,                 // referencja do składnika
      name: String                   // denormalizacja dla szybszego dostępu
    },
    quantity: Number,                // ilość składnika
    unit: String,                    // jednostka (g, ml, sztuki, itp.)
    isOptional: Boolean,             // czy składnik jest opcjonalny
    alternatives: [{
      ingredient: {
        _id: ObjectId,               // referencja do alternatywnego składnika
        name: String                 // denormalizacja dla szybszego dostępu
      },
      quantity: Number,              // ilość alternatywnego składnika
      unit: String                   // jednostka alternatywnego składnika
    }]
  }],
  steps: [{
    number: Number,                  // numer porządkowy kroku
    description: String,             // opis kroku
    estimatedTime: Number            // szacowany czas w minutach (opcjonalny)
  }],
  preparationTime: Number,           // całkowity czas przygotowania w minutach
  difficulty: String,                // enum: ['easy', 'medium', 'hard']
  servings: Number,                  // liczba porcji
  tags: [String],                    // tagi (np. 'breakfast', 'dinner', 'quick', 'lowCarb')
  nutritionalValues: {
    totalCalories: Number,           // suma kalorii z wszystkich składników
    totalCarbs: Number,              // suma węglowodanów z wszystkich składników
    totalProtein: Number,            // suma białka z wszystkich składników
    totalFat: Number,                // suma tłuszczu z wszystkich składników
    totalFiber: Number,              // suma błonnika z wszystkich składników
    caloriesPerServing: Number,      // kalorie na porcję
    carbsPerServing: Number          // węglowodany na porcję
  },
  isDeleted: Boolean,                // flaga soft delete
  createdAt: Date,
  updatedAt: Date
}
```

### ModifiedRecipe
```javascript
{
  _id: ObjectId,                     // automatycznie generowane przez MongoDB
  originalRecipe: {
    _id: ObjectId,                   // referencja do oryginalnego przepisu
    title: String                    // denormalizacja dla szybszego dostępu
  },
  title: String,                     // może być zmodyfikowany względem oryginału
  user: {
    _id: ObjectId,                   // referencja do użytkownika, który zmodyfikował przepis
    email: String                    // denormalizacja dla szybszego dostępu
  },
  ingredients: [{
    ingredient: {
      _id: ObjectId,                 // referencja do składnika
      name: String                   // denormalizacja dla szybszego dostępu
    },
    quantity: Number,                // ilość składnika
    unit: String,                    // jednostka (g, ml, sztuki, itp.)
    isOptional: Boolean,             // czy składnik jest opcjonalny
    isModified: Boolean,             // czy składnik został zmodyfikowany względem oryginału
    substitutionReason: String       // powód zmiany składnika (opcjonalny)
  }],
  steps: [{
    number: Number,                  // numer porządkowy kroku
    description: String,             // opis kroku
    estimatedTime: Number,           // szacowany czas w minutach (opcjonalny)
    isModified: Boolean,             // czy krok został zmodyfikowany względem oryginału
    modificationReason: String       // powód modyfikacji kroku (opcjonalny)
  }],
  preparationTime: Number,           // całkowity czas przygotowania w minutach
  difficulty: String,                // enum: ['easy', 'medium', 'hard']
  servings: Number,                  // liczba porcji
  tags: [String],                    // tagi (mogą być różne od oryginalnego przepisu)
  nutritionalValues: {
    totalCalories: Number,           // suma kalorii z wszystkich składników
    totalCarbs: Number,              // suma węglowodanów z wszystkich składników
    totalProtein: Number,            // suma białka z wszystkich składników
    totalFat: Number,                // suma tłuszczu z wszystkich składników
    totalFiber: Number,              // suma błonnika z wszystkich składników
    caloriesPerServing: Number,      // kalorie na porcję
    carbsPerServing: Number,         // węglowodany na porcję
    carbsReduction: Number,          // procentowa redukcja węglowodanów względem oryginału
    caloriesReduction: Number        // procentowa redukcja kalorii względem oryginału
  },
  changesDescription: String,        // tekstowy opis wprowadzonych zmian
  aiPrompt: String,                  // zachowany prompt wysłany do AI (opcjonalny)
  isDeleted: Boolean,                // flaga soft delete
  createdAt: Date,
  updatedAt: Date
}
```

### RecipeFeedback
```javascript
{
  _id: ObjectId,                     // automatycznie generowane przez MongoDB
  user: {
    _id: ObjectId,                   // referencja do użytkownika zgłaszającego
    email: String                    // denormalizacja dla szybszego dostępu
  },
  recipeType: String,                // enum: ['original', 'modified']
  recipe: {
    _id: ObjectId,                   // referencja do przepisu (oryginalnego lub zmodyfikowanego)
    title: String                    // denormalizacja dla szybszego dostępu
  },
  feedbackType: String,              // enum: ['error', 'suggestion', 'improvement']
  description: String,               // treść zgłoszenia
  status: String,                    // enum: ['pending', 'resolved', 'rejected']
  adminNotes: String,                // notatki administratora (opcjonalne)
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date                   // data rozwiązania zgłoszenia (opcjonalna)
}
```

### AICache
```javascript
{
  _id: ObjectId,                     // automatycznie generowane przez MongoDB
  inputHash: String,                 // hash bazujący na recipeId i preferencjach użytkownika
  recipeId: ObjectId,                // referencja do oryginalnego przepisu
  userPreferences: {                 // zapisane preferencje użytkownika
    dietType: String,
    maxCarbs: Number,
    excludedProducts: [String],
    allergens: [String]
  },
  response: {                        // zapisana odpowiedź AI
    ingredients: Array,              // zmodyfikowane składniki
    steps: Array,                    // zmodyfikowane kroki
    nutritionalValues: Object,       // zmodyfikowane wartości odżywcze
    changesDescription: String       // opis wprowadzonych zmian
  },
  createdAt: Date,                   // data utworzenia wpisu (używana do TTL)
  expiresAt: Date                    // data wygaśnięcia wpisu (używana do TTL)
}
```

## 2. Relacje między kolekcjami

### User -> Recipe
- Jeden użytkownik może mieć wiele przepisów (1:N)
- Realizacja przez pole `user._id` w kolekcji Recipe

### User -> ModifiedRecipe
- Jeden użytkownik może mieć wiele zmodyfikowanych przepisów (1:N)
- Realizacja przez pole `user._id` w kolekcji ModifiedRecipe

### Recipe -> ModifiedRecipe
- Jeden oryginalny przepis może mieć wiele zmodyfikowanych wersji (1:N)
- Realizacja przez pole `originalRecipe._id` w kolekcji ModifiedRecipe

### Ingredient -> Recipe
- Jeden składnik może być używany w wielu przepisach (1:N)
- Realizacja przez tablicę `ingredients` zawierającą referencje do Ingredient w kolekcji Recipe

### User -> RecipeFeedback
- Jeden użytkownik może zgłosić wiele uwag (1:N)
- Realizacja przez pole `user._id` w kolekcji RecipeFeedback

### Recipe/ModifiedRecipe -> RecipeFeedback
- Jeden przepis (oryginalny lub zmodyfikowany) może mieć wiele zgłoszeń (1:N)
- Realizacja przez pole `recipe._id` oraz `recipeType` w kolekcji RecipeFeedback

## 3. Indeksy

### User
```javascript
// Unikalny indeks dla adresu email (zapobiega duplikatom)
db.user.createIndex({ "email": 1 }, { unique: true })

// Indeks dla śledzenia wykorzystania AI
db.user.createIndex({ "aiUsage.date": 1 })
```

### Ingredient
```javascript
// Unikalny indeks dla nazwy składnika (zapobiega duplikatom)
db.ingredient.createIndex({ "name": 1 }, { unique: true })

// Indeks tekstowy dla wyszukiwania składników
db.ingredient.createIndex({ name: "text", alternativeNames: "text" })

// Indeks dla alergenów (częste filtrowanie)
db.ingredient.createIndex({ "allergens": 1 })

// Indeks dla kategorii składników
db.ingredient.createIndex({ "category": 1 })
```

### Recipe
```javascript
// Indeks dla szybkiego wyszukiwania przepisów użytkownika
db.recipe.createIndex({ "user._id": 1, "isDeleted": 1 })

// Indeks tekstowy dla wyszukiwania przepisów po nazwie
db.recipe.createIndex({ "title": "text" })

// Indeks dla tagów (częste filtrowanie)
db.recipe.createIndex({ "tags": 1 })

// Złożony indeks dla częstych kryteriów filtrowania
db.recipe.createIndex({ 
  "preparationTime": 1, 
  "difficulty": 1, 
  "tags": 1, 
  "nutritionalValues.carbsPerServing": 1 
})

// Indeks dla soft delete
db.recipe.createIndex({ "isDeleted": 1 })
```

### ModifiedRecipe
```javascript
// Indeks dla szybkiego wyszukiwania zmodyfikowanych przepisów użytkownika
db.modifiedRecipe.createIndex({ "user._id": 1, "isDeleted": 1 })

// Indeks dla szybkiego znajdowania modyfikacji oryginalnego przepisu
db.modifiedRecipe.createIndex({ "originalRecipe._id": 1 })

// Indeks tekstowy dla wyszukiwania przepisów po nazwie
db.modifiedRecipe.createIndex({ "title": "text" })

// Indeks dla tagów (częste filtrowanie)
db.modifiedRecipe.createIndex({ "tags": 1 })

// Złożony indeks dla częstych kryteriów filtrowania
db.modifiedRecipe.createIndex({ 
  "nutritionalValues.carbsPerServing": 1,
  "nutritionalValues.carbsReduction": 1
})

// Indeks dla soft delete
db.modifiedRecipe.createIndex({ "isDeleted": 1 })
```

### RecipeFeedback
```javascript
// Indeks dla szybkiego znajdowania zgłoszeń użytkownika
db.recipeFeedback.createIndex({ "user._id": 1 })

// Indeks dla szybkiego znajdowania zgłoszeń dla konkretnego przepisu
db.recipeFeedback.createIndex({ "recipeType": 1, "recipe._id": 1 })

// Indeks dla filtrowania po statusie
db.recipeFeedback.createIndex({ "status": 1 })
```

### AICache
```javascript
// Unikalny indeks dla klucza cache'a
db.aiCache.createIndex({ "inputHash": 1 }, { unique: true })

// TTL indeks usuwający wpisy po 24 godzinach
db.aiCache.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

## 4. Zasoby MongoDB

### Walidacja schematów
Implementacja walidacji schematów w MongoDB dla zapewnienia integralności danych:

```javascript
db.createCollection("user", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "preferences", "aiUsage"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^.+@.+\\..+$"
        },
        password: {
          bsonType: "string",
          minLength: 8
        },
        // Inne wymagane pola...
      }
    }
  }
})
```

Podobne walidatory należy zaimplementować dla wszystkich kolekcji.

### Middleware (Mongoose)

Middleware dla modelu User do zarządzania licznikiem dziennych modyfikacji AI:

```javascript
// Aktualizacja licznika AI przed zapisem dokumentu
userSchema.pre('save', function(next) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Resetowanie licznika jeśli data jest starsza niż dzisiaj
  if (!this.aiUsage.date || this.aiUsage.date < today) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
  }
  
  next();
});

// Metoda pomocnicza sprawdzająca dostępność dziennych modyfikacji
userSchema.methods.hasRemainingAIModifications = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Resetowanie licznika jeśli data jest starsza niż dzisiaj
  if (!this.aiUsage.date || this.aiUsage.date < today) {
    this.aiUsage.date = today;
    this.aiUsage.count = 0;
    return true;
  }
  
  return this.aiUsage.count < 5; // Limit 5 modyfikacji dziennie
};
```

Middleware dla modelu Recipe do aktualizacji wartości odżywczych:

```javascript
// Aktualizacja wartości odżywczych przed zapisem dokumentu
recipeSchema.pre('save', async function(next) {
  if (this.isModified('ingredients') || this.isModified('servings')) {
    try {
      // Obliczenie wartości odżywczych na podstawie składników
      const totalValues = {
        calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0
      };
      
      for (const item of this.ingredients) {
        const ingredient = await Ingredient.findById(item.ingredient._id);
        if (ingredient) {
          // Przeliczenie wartości dla danej ilości składnika
          const factor = item.quantity / 100; // wartości są na 100g
          totalValues.calories += ingredient.nutritionalValues.calories * factor;
          totalValues.carbs += ingredient.nutritionalValues.carbs * factor;
          totalValues.protein += ingredient.nutritionalValues.protein * factor;
          totalValues.fat += ingredient.nutritionalValues.fat * factor;
          totalValues.fiber += ingredient.nutritionalValues.fiber * factor;
        }
      }
      
      // Aktualizacja wartości w przepisie
      this.nutritionalValues = {
        totalCalories: totalValues.calories,
        totalCarbs: totalValues.carbs,
        totalProtein: totalValues.protein,
        totalFat: totalValues.fat,
        totalFiber: totalValues.fiber,
        caloriesPerServing: totalValues.calories / this.servings,
        carbsPerServing: totalValues.carbs / this.servings
      };
    } catch (error) {
      next(error);
    }
  }
  next();
});
```

## 5. Uwagi dotyczące decyzji projektowych

### Denormalizacja
Wybraliśmy umiarkowaną denormalizację w kluczowych miejscach dla zwiększenia wydajności i ograniczenia ilości zapytań:
- Kopiowanie nazw składników do przepisów dla szybszego dostępu bez potrzeby joinów
- Przechowywanie pełnych kopii zmodyfikowanych przepisów zamiast tylko różnic
- Kopiowanie informacji o użytkowniku (email) do dokumentów przepisów dla łatwiejszej identyfikacji

### Strategia zarządzania użyciem AI
- Połączenie sprawdzania przy żądaniu oraz mechanizmu resetowania w middleware
- Przechowywanie daty ostatniego resetowania licznika oraz aktualnego stanu
- Weryfikacja limitu przed każdym żądaniem modyfikacji przepisu

### Podejście do soft delete
- Implementacja flag isDeleted zamiast faktycznego usuwania danych
- Dołączanie warunku isDeleted: false do wszystkich standardowych zapytań
- Umożliwienie odzyskania przypadkowo usuniętych danych

### Struktura składników w przepisach
- Przepisy zawierają tablicę składników z referencjami do kolekcji Ingredient
- Dodatkowo przechowują ilość i jednostkę miary dla każdego składnika
- W przypadku ModifiedRecipe dodatkowe flagi isModified ułatwiają porównywanie zmian

### Obsługa tagów
- Przechowywanie tagów jako prostej tablicy stringów - wystarczające dla MVP
- Indeksowanie tablicy tagów dla wydajnego filtrowania
- Możliwość rozszerzenia do osobnej kolekcji Tags w przyszłości

### Cachowanie AI
- Implementacja TTL indeksu (time-to-live) automatycznie usuwającego stare wpisy
- Generowanie unikalnego hasha na podstawie ID przepisu i preferencji użytkownika
- Przechowywanie pełnej odpowiedzi AI dla szybkiego dostępu

### Skalowalność
- Struktura kolekcji przygotowana do potencjalnego shardowania (np. po userId)
- Strategiczne indeksowanie wspierające typowe wzorce zapytań
- Denormalizacja w miejscach krytycznych dla wydajności