import dotenv from 'dotenv';

// Wczytaj zmienne środowiskowe z pliku .env lub .env.development
let envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath) {
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    envPath = '.env.development';
  } else {
    envPath = '.env';
  }
}
dotenv.config({ path: envPath });
console.log(`Wczytano konfigurację z ${envPath}`);
const express = (await import('express')).default;
const cors = (await import('cors')).default;
const mongoose = (await import('mongoose')).default;
const { authMiddleware } = await import('./middleware/auth.js');
const userRoutes = (await import('./routes/users.js')).default;
const recipeRoutes = (await import('./routes/recipes.js')).default;
const aiRoutes = (await import('./routes/ai.js')).default;

const app = express();
const port = process.env.PORT || 3031;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/recipes', authMiddleware, recipeRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Wystąpił błąd serwera'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Połączono z MongoDB');
    app.listen(port, () => {
      console.log(`Serwer uruchomiony na porcie ${port}`);
    });
  })
  .catch((error) => {
    console.error('Błąd połączenia z MongoDB:', error);
    process.exit(1);
  });
