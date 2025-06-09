import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { authMiddleware } from './middleware/auth.js';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';
import aiRoutes from './routes/ai.js';

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
