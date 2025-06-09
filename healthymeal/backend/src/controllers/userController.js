const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    let user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      // Jeśli użytkownik nie istnieje, tworzymy nowy profil
      user = await User.create({
        email: req.user.email,
        supabaseId: req.user.id,
        preferences: {
          dietType: 'balanced',
          maxCarbs: 300
        },
        aiUsage: {
          count: 0,
          date: new Date()
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania profilu' });
  }
};
