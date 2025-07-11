import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import recipesRoutes from './routes/recipes.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';

// Konfiguracja Mongoose
//mongoose.set('suppressReservedKeysWarning', true);

// Sprawdzenie zmiennych środowiskowych
console.log('Załadowano konfigurację z pliku:', process.env.NODE_ENV === 'development' ? '.env.development' : '.env');
console.log('Zmienne środowiskowe:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Ustawiony' : '❌ Brak');
console.log('- MONGODB_URI:', process.env.MONGODB_URI);
console.log('- PORT:', process.env.PORT);
console.log('- ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);

const app = express();
const port = process.env.PORT || 3031;

// Konfiguracja CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];
console.log('CORS origin:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Konfiguracja parsowania JSON z obsługą błędów
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// Middleware do sprawdzania pustego body dla POST/PUT requestów
app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
    return res.status(400).json({ error: 'Empty request body' });
  }
  next();
});

// Middleware do autoryzacji
import { authMiddleware } from './middleware/auth.js';

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Połączono z MongoDB');
    
    try {
      // Resetowanie kolekcji
      const collections = ['users', 'recipes', 'preferences'];
      for (const collection of collections) {
        try {
          await mongoose.connection.db.dropCollection(collection);
          console.log(`✅ Usunięto kolekcję ${collection}`);
        } catch (error) {
          if (error.code !== 26) { // 26 = kolekcja nie istnieje
            console.error(`❌ Błąd podczas usuwania kolekcji ${collection}:`, error);
          } else {
            console.log(`ℹ️ Kolekcja ${collection} nie istniała`);
          }
        }
      }
      
      // Dodaj indeksy
      await mongoose.connection.db.collection('users').createIndex({ supabaseId: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Dodano indeksy do kolekcji users');
      
    } catch (error) {
      console.error('❌ Błąd podczas konfiguracji bazy danych:', error);
    }
  })
  .catch((error) => {
    console.error('❌ Błąd połączenia z MongoDB:', error);
    process.exit(1);
  });

// Middleware do logowania wszystkich requestów
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint dla CI/CD
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routy
app.use('/api/auth', authRoutes); // Publiczne endpointy autoryzacji
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/recipes', authMiddleware, recipesRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

app.listen(port, () => {
  console.log(`Serwer uruchomiony na porcie ${port}`);
});
