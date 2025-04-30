const User = require('../models/User');

// Pobierz profil użytkownika
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      id: user._id,
      email: user.email,
      preferences: user.preferences,
      aiUsage: user.aiUsage,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Błąd pobierania profilu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobierz preferencje użytkownika
exports.getPreferences = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      console.error('Nie znaleziono użytkownika');
      return res.status(404).json({ error: { message: 'Użytkownik nie znaleziony' } });
    }
    
    // Jeśli użytkownik nie ma preferencji, utwórz domyślne
    if (!user.preferences) {
      user.preferences = {
        dietType: 'normal',
        maxCarbs: 0,
        excludedProducts: [],
        allergens: []
      };
      await user.save();
      console.log(`Utworzono domyślne preferencje dla użytkownika: ${user._id}`);
    }
    
    console.log(`Pobrano preferencje dla użytkownika: ${user._id}`);
    res.status(200).json(user.preferences);
  } catch (error) {
    console.error('Błąd pobierania preferencji:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Aktualizuj preferencje użytkownika
exports.updatePreferences = async (req, res) => {
  try {
    const { dietType, maxCarbs, excludedProducts, allergens } = req.body;
    const user = req.user;
    
    // Aktualizuj preferencje
    user.preferences = {
      dietType: dietType || user.preferences.dietType,
      maxCarbs: maxCarbs !== undefined ? maxCarbs : user.preferences.maxCarbs,
      excludedProducts: excludedProducts || user.preferences.excludedProducts,
      allergens: allergens || user.preferences.allergens
    };
    
    await user.save();
    
    res.status(200).json({
      message: 'Preferencje zaktualizowane pomyślnie',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Błąd aktualizacji preferencji:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Zmień hasło użytkownika
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Sprawdź obecne hasło
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Obecne hasło jest nieprawidłowe' });
    }
    
    // Aktualizuj hasło
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Hasło zmienione pomyślnie' });
  } catch (error) {
    console.error('Błąd zmiany hasła:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
}; 