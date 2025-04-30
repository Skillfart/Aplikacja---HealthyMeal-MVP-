const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Pobierz wszystkie przepisy użytkownika
exports.getUserRecipes = async (req, res) => {
  try {
    const { search, tags, difficulty, maxPreparationTime, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * limit;
    
    // Podstawowy filtr: przepisy należące do użytkownika i nieusunięte
    let query = {
      'user._id': userId,
      isDeleted: false
    };
    
    // Dodaj filtr wyszukiwania, jeśli podano
    if (search) {
      query.$text = { $search: search };
    }
    
    // Dodaj filtr tagów, jeśli podano
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Dodaj filtr trudności, jeśli podano
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Dodaj filtr czasu przygotowania, jeśli podano
    if (maxPreparationTime) {
      query.preparationTime = { $lte: parseInt(maxPreparationTime) };
    }
    
    console.log("Zapytanie o przepisy:", JSON.stringify(query));
    
    // Pobierz przepisy z paginacją
    const recipes = await Recipe.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title ingredients.ingredient.name preparationTime difficulty servings tags nutritionalValues createdAt');
    
    console.log(`Znaleziono ${recipes.length} przepisów`);
    
    // Pobierz całkowitą liczbę przepisów spełniających kryteria
    const total = await Recipe.countDocuments(query);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      recipes
    });
  } catch (error) {
    console.error('Błąd pobierania przepisów:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobierz jeden przepis
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    console.log(`Pobieranie przepisu o ID: ${id} dla użytkownika: ${userId}`);
    
    // Sprawdzanie czy id jest zdefiniowane i poprawne
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Nieprawidłowy identyfikator przepisu' });
    }
    
    // Sprawdzenie czy id jest poprawnym ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Nieprawidłowy format identyfikatora przepisu' });
    }
    
    const recipe = await Recipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      console.log(`Przepis o ID: ${id} nie znaleziony`);
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    console.log(`Przepis ${recipe.title} znaleziony`);
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Błąd pobierania przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Utwórz nowy przepis
exports.createRecipe = async (req, res) => {
  try {
    // Sprawdź, czy mamy dane użytkownika
    if (!req.user || !req.user._id) {
      console.error('Brak danych użytkownika w żądaniu', req.user);
      return res.status(401).json({ message: 'Brak autoryzacji - brakujące dane użytkownika' });
    }
    
    const { 
      title, 
      ingredients, 
      steps, 
      preparationTime, 
      difficulty, 
      servings, 
      tags, 
      nutritionalValues 
    } = req.body;
    
    // Walidacja wymaganych pól
    if (!title) {
      return res.status(400).json({ message: 'Tytuł przepisu jest wymagany' });
    }
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Wymagany jest co najmniej jeden składnik' });
    }
    
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ message: 'Wymagany jest co najmniej jeden krok' });
    }
    
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    console.log(`Tworzenie przepisu dla użytkownika: ${userId} (${userEmail})`);
    
    // Przetwarzanie składników
    const processedIngredients = [];
    
    for (let i = 0; i < ingredients.length; i++) {
      try {
        const item = ingredients[i];
        
        // Upewnij się, że item ma właściwą strukturę
        if (!item) {
          return res.status(400).json({ 
            message: `Nieprawidłowy format składnika na pozycji ${i+1}` 
          });
        }
        
        let ingredientId;
        let ingredientName;
        
        // Obsługa różnych formatów danych
        if (item.name && typeof item.name === 'string') {
          // Formatowanie nazwy składnika
          const formattedName = item.name.trim().toLowerCase();
          
          // Szukanie istniejącego składnika po nazwie
          const existingIngredient = await Ingredient.findOne({ 
            name: formattedName 
          });
          
          if (existingIngredient) {
            ingredientId = existingIngredient._id;
            ingredientName = existingIngredient.name;
          } else {
            // Tworzenie nowego składnika z domyślnymi wartościami
            const newIngredient = new Ingredient({
              name: formattedName,
              category: 'other',
              nutritionalValues: {
                calories: 0,
                carbs: 0,
                protein: 0,
                fat: 0,
                fiber: 0,
                sugar: 0
              }
            });
            
            await newIngredient.save();
            ingredientId = newIngredient._id;
            ingredientName = formattedName;
          }
        } else if (item.ingredient && item.ingredient.name && typeof item.ingredient.name === 'string') {
          // Obsługa formatu {ingredient: {name: "nazwa"}}
          const formattedName = item.ingredient.name.trim().toLowerCase();
          
          // Szukanie istniejącego składnika po nazwie
          const existingIngredient = await Ingredient.findOne({ 
            name: formattedName 
          });
          
          if (existingIngredient) {
            ingredientId = existingIngredient._id;
            ingredientName = existingIngredient.name;
          } else {
            // Tworzenie nowego składnika z domyślnymi wartościami
            const newIngredient = new Ingredient({
              name: formattedName,
              category: 'other',
              nutritionalValues: {
                calories: 0,
                carbs: 0,
                protein: 0,
                fat: 0,
                fiber: 0,
                sugar: 0
              }
            });
            
            await newIngredient.save();
            ingredientId = newIngredient._id;
            ingredientName = formattedName;
          }
        } else if (item.ingredient && item.ingredient._id) {
          // Sprawdzenie czy składnik z podanym ID istnieje
          const ingredientExists = await Ingredient.findById(item.ingredient._id);
          if (!ingredientExists) {
            return res.status(400).json({ 
              message: `Nie znaleziono składnika o ID ${item.ingredient._id}` 
            });
          }
          ingredientId = item.ingredient._id;
          ingredientName = item.ingredient.name || ingredientExists.name;
        } else {
          return res.status(400).json({ 
            message: `Nieprawidłowy format składnika na pozycji ${i+1}. Podaj nazwę lub ID składnika.` 
          });
        }
        
        // Dodanie przetworzonego składnika
        processedIngredients.push({
          ingredient: {
            _id: ingredientId,
            name: ingredientName
          },
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unit || 'g',
          isOptional: Boolean(item.isOptional)
        });
        
      } catch (err) {
        console.error(`Błąd przetwarzania składnika ${i+1}:`, err);
        return res.status(400).json({ 
          message: `Błąd przetwarzania składnika na pozycji ${i+1}: ${err.message}`
        });
      }
    }
    
    // Przetwarzanie kroków
    const processedSteps = steps.map((step, index) => {
      if (typeof step === 'string') {
        return {
          number: index + 1,
          description: step
        };
      } else if (typeof step === 'object') {
        return {
          number: step.number || index + 1,
          description: step.description || '',
          estimatedTime: step.estimatedTime || 0
        };
      }
      return null;
    }).filter(step => step !== null);
    
    // Tworzenie nowego przepisu
    const recipe = new Recipe({
      title,
      user: {
        _id: userId,
        email: userEmail
      },
      ingredients: processedIngredients,
      steps: processedSteps,
      preparationTime: preparationTime || 0,
      difficulty: difficulty || 'medium',
      servings: servings || 1,
      tags: Array.isArray(tags) ? tags : [],
      nutritionalValues: nutritionalValues || {
        totalCalories: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0
      },
      isDeleted: false
    });
    
    await recipe.save();
    console.log(`Utworzono nowy przepis: ${recipe.title} (${recipe._id})`);
    
    res.status(201).json({ 
      message: 'Przepis dodany pomyślnie',
      recipeId: recipe._id
    });
  } catch (error) {
    console.error('Błąd tworzenia przepisu:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas tworzenia przepisu', 
      error: error.message 
    });
  }
};

// Aktualizuj przepis
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Pobranie aktualizowanych pól
    const {
      title,
      ingredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags,
      nutritionalValues
    } = req.body;
    
    // Szukanie przepisu
    const recipe = await Recipe.findOne({
      _id: id,
      "user._id": userId,
      isDeleted: false
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    console.log(`Aktualizacja przepisu: ${recipe.title} (${recipe._id})`);
    
    // Aktualizacja podstawowych pól
    if (title) recipe.title = title;
    if (preparationTime !== undefined) recipe.preparationTime = preparationTime;
    if (difficulty) recipe.difficulty = difficulty;
    if (servings) recipe.servings = servings;
    if (tags) recipe.tags = tags;
    if (nutritionalValues) recipe.nutritionalValues = {
      ...recipe.nutritionalValues,
      ...nutritionalValues
    };
    
    // Aktualizacja kroków
    if (steps && Array.isArray(steps)) {
      const processedSteps = steps.map((step, index) => {
        if (typeof step === 'string') {
          return {
            number: index + 1,
            description: step
          };
        } else if (typeof step === 'object') {
          return {
            number: step.number || index + 1,
            description: step.description || '',
            estimatedTime: step.estimatedTime || 0
          };
        }
        return null;
      }).filter(step => step !== null);
      
      recipe.steps = processedSteps;
    }
    
    // Aktualizacja składników
    if (ingredients && Array.isArray(ingredients)) {
      const processedIngredients = [];
      
      for (let i = 0; i < ingredients.length; i++) {
        try {
          const item = ingredients[i];
          
          // Upewnij się, że item ma właściwą strukturę
          if (!item) {
            return res.status(400).json({ 
              message: `Nieprawidłowy format składnika na pozycji ${i+1}` 
            });
          }
          
          let ingredientId;
          let ingredientName;
          
          // Obsługa różnych formatów danych
          if (item.name && typeof item.name === 'string') {
            // Formatowanie nazwy składnika
            const formattedName = item.name.trim().toLowerCase();
            
            // Szukanie istniejącego składnika po nazwie
            const existingIngredient = await Ingredient.findOne({ 
              name: formattedName 
            });
            
            if (existingIngredient) {
              ingredientId = existingIngredient._id;
              ingredientName = existingIngredient.name;
            } else {
              // Tworzenie nowego składnika z domyślnymi wartościami
              const newIngredient = new Ingredient({
                name: formattedName,
                category: 'other',
                nutritionalValues: {
                  calories: 0,
                  carbs: 0,
                  protein: 0,
                  fat: 0,
                  fiber: 0,
                  sugar: 0
                }
              });
              
              await newIngredient.save();
              ingredientId = newIngredient._id;
              ingredientName = formattedName;
            }
          } else if (item.ingredient && item.ingredient.name && typeof item.ingredient.name === 'string') {
            // Obsługa formatu {ingredient: {name: "nazwa"}}
            const formattedName = item.ingredient.name.trim().toLowerCase();
            
            // Szukanie istniejącego składnika po nazwie
            const existingIngredient = await Ingredient.findOne({ 
              name: formattedName 
            });
            
            if (existingIngredient) {
              ingredientId = existingIngredient._id;
              ingredientName = existingIngredient.name;
            } else {
              // Tworzenie nowego składnika z domyślnymi wartościami
              const newIngredient = new Ingredient({
                name: formattedName,
                category: 'other',
                nutritionalValues: {
                  calories: 0,
                  carbs: 0,
                  protein: 0,
                  fat: 0,
                  fiber: 0,
                  sugar: 0
                }
              });
              
              await newIngredient.save();
              ingredientId = newIngredient._id;
              ingredientName = formattedName;
            }
          } else if (item.ingredient && item.ingredient._id) {
            // Sprawdzenie czy składnik z podanym ID istnieje
            const ingredientExists = await Ingredient.findById(item.ingredient._id);
            if (!ingredientExists) {
              return res.status(400).json({ 
                message: `Nie znaleziono składnika o ID ${item.ingredient._id}` 
              });
            }
            ingredientId = item.ingredient._id;
            ingredientName = item.ingredient.name || ingredientExists.name;
          } else {
            return res.status(400).json({ 
              message: `Nieprawidłowy format składnika na pozycji ${i+1}. Podaj nazwę lub ID składnika.` 
            });
          }
          
          // Dodanie przetworzonego składnika
          processedIngredients.push({
            ingredient: {
              _id: ingredientId,
              name: ingredientName
            },
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit || 'g',
            isOptional: Boolean(item.isOptional)
          });
          
        } catch (err) {
          console.error(`Błąd przetwarzania składnika ${i+1}:`, err);
          return res.status(400).json({ 
            message: `Błąd przetwarzania składnika na pozycji ${i+1}: ${err.message}`
          });
        }
      }
      
      recipe.ingredients = processedIngredients;
    }
    
    await recipe.save();
    console.log(`Przepis zaktualizowany: ${recipe.title} (${recipe._id})`);
    
    res.status(200).json({
      message: 'Przepis zaktualizowany pomyślnie',
      recipeId: recipe._id
    });
    
  } catch (error) {
    console.error('Błąd aktualizacji przepisu:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas aktualizacji przepisu', 
      error: error.message 
    });
  }
};

// Usuń przepis (soft delete)
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    console.log(`Usuwanie przepisu o ID: ${id} dla użytkownika: ${userId}`);
    
    // Znajdź przepis
    const recipe = await Recipe.findOne({
      _id: id,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      console.log(`Przepis o ID: ${id} nie znaleziony`);
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // Wykonaj soft delete
    recipe.isDeleted = true;
    await recipe.save();
    console.log(`Przepis oznaczony jako usunięty: ${recipe.title} (${recipe._id})`);
    
    res.status(200).json({ message: 'Przepis usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd usuwania przepisu:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
}; 