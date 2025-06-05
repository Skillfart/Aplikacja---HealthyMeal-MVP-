const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const supabaseAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Błąd autoryzacji:', error);
    res.status(500).json({ error: 'Błąd serwera podczas autoryzacji' });
  }
};

module.exports = supabaseAuth; 