/**
 * Zbiór przykładowych przepisów do użycia w trybie deweloperskim
 */

/**
 * Generuje przykładowy przepis na podstawie ID
 * @param {string} id - Identyfikator przepisu
 * @param {string} userId - Identyfikator użytkownika
 * @returns {Object} - Przykładowy przepis
 */
function getSampleRecipe(id, userId = 'test-user-id') {
  // Bazowy przepis
  const baseRecipe = {
    _id: id,
    title: `Przykładowy przepis testowy (${id})`,
    description: 'To jest przepis testowy używany do debugowania.',
    user: {
      _id: userId,
      email: 'test@example.com'
    },
    ingredients: [
      {
        ingredient: {
          _id: 'ingredient1',
          name: 'Pomidor'
        },
        quantity: 2,
        unit: 'sztuki'
      },
      {
        ingredient: {
          _id: 'ingredient2',
          name: 'Cebula'
        },
        quantity: 1,
        unit: 'sztuka'
      }
    ],
    steps: [
      {
        number: 1,
        description: 'Pokrój pomidory i cebulę.'
      },
      {
        number: 2,
        description: 'Wymieszaj składniki.'
      }
    ],
    preparationTime: 15,
    difficulty: 'easy',
    servings: 2,
    tags: ['szybkie', 'wegetariańskie'],
    nutritionalValues: {
      totalCalories: 120,
      totalCarbs: 20,
      totalProtein: 5,
      totalFat: 2
    },
    isDeleted: false
  };

  // Modyfikacje w zależności od ID
  switch(id) {
    case 'recipe1':
      return {
        ...baseRecipe,
        title: 'Sałatka grecka',
        description: 'Lekka, orzeźwiająca sałatka z pomidorów, ogórków i fety.',
        ingredients: [
          {
            ingredient: {
              _id: 'tomato',
              name: 'Pomidor'
            },
            quantity: 4,
            unit: 'sztuki'
          },
          {
            ingredient: {
              _id: 'cucumber',
              name: 'Ogórek'
            },
            quantity: 2,
            unit: 'sztuki'
          },
          {
            ingredient: {
              _id: 'feta',
              name: 'Ser feta'
            },
            quantity: 200,
            unit: 'g'
          },
          {
            ingredient: {
              _id: 'olives',
              name: 'Oliwki'
            },
            quantity: 100,
            unit: 'g'
          },
          {
            ingredient: {
              _id: 'oil',
              name: 'Oliwa z oliwek'
            },
            quantity: 2,
            unit: 'łyżki'
          }
        ],
        tags: ['greckie', 'wegetariańskie', 'bezglutenowe']
      };
    case 'recipe2':
      return {
        ...baseRecipe,
        title: 'Omlet z warzywami',
        description: 'Puszysty omlet z dodatkiem świeżych warzyw.',
        ingredients: [
          {
            ingredient: {
              _id: 'eggs',
              name: 'Jajka'
            },
            quantity: 3,
            unit: 'sztuki'
          },
          {
            ingredient: {
              _id: 'milk',
              name: 'Mleko'
            },
            quantity: 50,
            unit: 'ml'
          },
          {
            ingredient: {
              _id: 'pepper',
              name: 'Papryka'
            },
            quantity: 1,
            unit: 'sztuka'
          }
        ],
        tags: ['śniadanie', 'szybkie', 'wegetariańskie']
      };
    case 'recipe3':
      return {
        ...baseRecipe,
        title: 'Smoothie owocowe',
        description: 'Orzeźwiające smoothie z bananem i truskawkami.',
        ingredients: [
          {
            ingredient: {
              _id: 'banana',
              name: 'Banan'
            },
            quantity: 1,
            unit: 'sztuka'
          },
          {
            ingredient: {
              _id: 'strawberry',
              name: 'Truskawki'
            },
            quantity: 200,
            unit: 'g'
          },
          {
            ingredient: {
              _id: 'yogurt',
              name: 'Jogurt naturalny'
            },
            quantity: 150,
            unit: 'ml'
          }
        ],
        preparationTime: 5,
        tags: ['napój', 'owocowe', 'bezglutenowe']
      };
    default:
      return baseRecipe;
  }
}

/**
 * Generuje zmodyfikowany przepis dla testów funkcji AI
 * @param {Object} recipe - Oryginalny przepis
 * @param {Object} preferences - Preferencje użytkownika
 * @returns {Object} - Zmodyfikowany przepis
 */
function getModifiedRecipe(recipe, preferences) {
  // Klonujemy oryginalny przepis
  const modifiedRecipe = JSON.parse(JSON.stringify(recipe));
  
  // Dodajemy oznaczenia modyfikacji
  modifiedRecipe.title = `${modifiedRecipe.title} (zmodyfikowany)`;
  modifiedRecipe.modifiedAt = new Date().toISOString();
  modifiedRecipe.isModified = true;
  
  // Dostosowujemy do preferencji
  if (preferences) {
    if (preferences.dietType === 'vegetarian' || preferences.dietType === 'vegan') {
      modifiedRecipe.tags = [...new Set([...modifiedRecipe.tags, 'wegetariańskie'])];
    }
    
    if (preferences.maxCarbs > 0 && modifiedRecipe.nutritionalValues) {
      modifiedRecipe.nutritionalValues.totalCarbs = Math.min(
        modifiedRecipe.nutritionalValues.totalCarbs, 
        preferences.maxCarbs
      );
    }
    
    // Usuwamy alergeny z składników
    if (preferences.allergens && preferences.allergens.length > 0) {
      const allergens = preferences.allergens.map(a => a.toLowerCase());
      
      modifiedRecipe.ingredients = modifiedRecipe.ingredients.map(ingredient => {
        const name = ingredient.ingredient.name.toLowerCase();
        
        if (allergens.some(allergen => name.includes(allergen))) {
          // Zamiana alergenu na bezpieczny odpowiednik
          return {
            ...ingredient,
            ingredient: {
              ...ingredient.ingredient,
              name: `${ingredient.ingredient.name} (alternatywa)`
            },
            isModified: true,
            substitutionReason: 'Zamieniono ze względu na alergię'
          };
        }
        
        return ingredient;
      });
    }
  }
  
  return modifiedRecipe;
}

module.exports = {
  getSampleRecipe,
  getModifiedRecipe
}; 