const Ingredient = require('../models/Ingredient');

// Pobierz wszystkie składniki
exports.getAllIngredients = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Dodaj filtr wyszukiwania, jeśli podano
    if (search) {
      query.$text = { $search: search };
    }
    
    // Dodaj filtr kategorii, jeśli podano
    if (category) {
      query.category = category;
    }
    
    // Pobierz składniki z paginacją
    const ingredients = await Ingredient.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name alternativeNames nutritionalValues glycemicIndex allergens category');
    
    // Pobierz całkowitą liczbę składników spełniających kryteria
    const total = await Ingredient.countDocuments(query);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      ingredients
    });
  } catch (error) {
    console.error('Błąd pobierania składników:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobierz jeden składnik
exports.getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ingredient = await Ingredient.findById(id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Składnik nie znaleziony' });
    }
    
    res.status(200).json(ingredient);
  } catch (error) {
    console.error('Błąd pobierania składnika:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Utwórz nowy składnik (tylko dla administratorów - implementacja sprawdzania roli użytkownika byłaby potrzebna)
exports.createIngredient = async (req, res) => {
  try {
    const { name, alternativeNames, nutritionalValues, glycemicIndex, allergens, category } = req.body;
    
    // Sprawdź, czy składnik już istnieje
    const existingIngredient = await Ingredient.findOne({ name });
    if (existingIngredient) {
      return res.status(409).json({ message: 'Składnik o tej nazwie już istnieje' });
    }
    
    // Utwórz nowy składnik
    const ingredient = new Ingredient({
      name,
      alternativeNames,
      nutritionalValues,
      glycemicIndex,
      allergens,
      category
    });
    
    await ingredient.save();
    
    res.status(201).json({
      message: 'Składnik dodany pomyślnie',
      ingredient
    });
  } catch (error) {
    console.error('Błąd tworzenia składnika:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
}; 