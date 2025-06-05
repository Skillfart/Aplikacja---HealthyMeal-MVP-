const User = require('../models/User');
const logger = require('../utils/logger');
const { validatePreferences } = require('../validators/userValidator');

class UserController {
  /**
   * Pobierz profil użytkownika
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        email: user.email,
        preferences: user.preferences,
        aiUsage: {
          count: user.aiUsage.count,
          limit: 5,
          remainingToday: 5 - user.aiUsage.count
        },
        lastLogin: user.lastLogin
      });
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pobierz preferencje użytkownika
   */
  async getPreferences(req, res) {
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
        
        // Sprawdź czy metoda save istnieje przed jej wywołaniem
        if (typeof user.save === 'function') {
          await user.save();
          console.log(`Utworzono domyślne preferencje dla użytkownika: ${user._id}`);
        } else {
          console.log('Używam testowego użytkownika bez metody save');
        }
      }
      
      console.log(`Pobrano preferencje dla użytkownika: ${user._id || user.id || 'nieznanego'}`);
      res.status(200).json(user.preferences);
    } catch (error) {
      console.error('Błąd pobierania preferencji:', error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  }

  /**
   * Aktualizuj preferencje użytkownika
   */
  async updatePreferences(req, res) {
    try {
      const { error, value } = validatePreferences(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedPreferences = await user.updatePreferences(value);

      res.json({
        message: 'Preferences updated successfully',
        preferences: updatedPreferences
      });
    } catch (error) {
      logger.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Sprawdź limit AI
   */
  async checkAILimit(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const hasRemaining = user.hasRemainingAIModifications();
      const nextReset = new Date(user.aiUsage.date);
      nextReset.setHours(24, 0, 0, 0);

      res.json({
        hasRemainingModifications: hasRemaining,
        aiUsage: {
          count: user.aiUsage.count,
          limit: 5,
          remainingToday: 5 - user.aiUsage.count,
          nextReset: nextReset
        }
      });
    } catch (error) {
      logger.error('Error checking AI limit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Inkrementuj licznik użycia AI
   */
  async incrementAIUsage(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newCount = await user.incrementAIUsage();

      res.json({
        message: 'AI usage count incremented',
        aiUsage: {
          count: newCount,
          limit: 5,
          remainingToday: 5 - newCount
        }
      });
    } catch (error) {
      if (error.message === 'Daily AI modification limit exceeded') {
        return res.status(429).json({ error: error.message });
      }
      logger.error('Error incrementing AI usage:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Zmień hasło użytkownika
  async changePassword(req, res) {
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
  }
}

module.exports = new UserController(); 