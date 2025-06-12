import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import User from '../models/User.js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Rejestracja
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email i hasło są wymagane' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/login`
      }
    });

    if (error) throw error;

    // Utwórz profil użytkownika w MongoDB
    await User.create({
      supabaseId: data.user.id,
      email: data.user.email,
      preferences: {
        dietType: 'normal',
        maxCarbs: 0,
        allergens: [],
        excludedProducts: []
      },
      aiUsage: {
        count: 0,
        lastReset: new Date()
      }
    });

    res.status(201).json({
      message: 'Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację',
      user: data.user
    });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(400).json({ error: error.message });
  }
});

// Logowanie
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email i hasło są wymagane' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      message: 'Zalogowano pomyślnie',
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(400).json({ error: error.message });
  }
});

// Wylogowanie
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Wylogowano pomyślnie' });
  } catch (error) {
    console.error('Błąd wylogowania:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router; 