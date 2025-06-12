import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';

// Konfiguracja zmiennych środowiskowych
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Połączono z MongoDB'))
  .catch(err => {
    console.error('❌ Błąd połączenia z MongoDB:', err);
    process.exit(1);
  });

// Indeksy dla kolekcji recipes
const Recipe = mongoose.model('Recipe');
Recipe.collection.createIndex({ author: 1 });
Recipe.collection.createIndex({ createdAt: -1 });
Recipe.collection.createIndex({ tags: 1 });

// Middleware autoryzacji dla wszystkich endpointów API
app.use('/api', authMiddleware);

// Routery
app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error('❌ Błąd serwera:', err);
  res.status(500).json({ error: 'Błąd serwera' });
});

// Nasłuchiwanie
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serwer uruchomiony na porcie ${PORT}`);
});

export default app; 