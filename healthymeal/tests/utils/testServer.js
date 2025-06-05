import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { vi } from 'vitest';

export class TestServer {
  constructor(port = 3030) {
    this.app = express();
    this.port = port;
    this.server = null;

    this.app.use(cors());
    this.app.use(express.json());
  }

  start() {
    return new Promise((resolve) => {
      this.server = createServer(this.app);
      this.server.listen(this.port, () => {
        console.log(`Test server running on port ${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Test server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  addRoute(method, path, handler) {
    this.app[method.toLowerCase()](path, handler);
  }

  getApp() {
    return this.app;
  }
}

export default TestServer;

// Serwer testowy dla testów API
export const createServer = () => {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cors({ origin: '*' }));
  
  // Mockowe endpointy dla testów
  
  // Endpoint zdrowia API
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: 'test' });
  });
  
  // Endpointy przepisów
  app.get('/api/recipes', (req, res) => {
    res.status(200).json([
      { id: 'recipe-1', title: 'Przepis testowy 1' },
      { id: 'recipe-2', title: 'Przepis testowy 2' }
    ]);
  });
  
  app.get('/api/recipes/:id', (req, res) => {
    res.status(200).json({ id: req.params.id, title: 'Przepis testowy' });
  });
  
  // Endpointy użytkownika
  app.get('/api/user/profile', (req, res) => {
    res.status(200).json({ id: 'user-1', name: 'Test User' });
  });
  
  // Endpointy dla AI
  app.post('/api/ai/generate', (req, res) => {
    res.status(200).json({ 
      response: 'Wygenerowana odpowiedź AI',
      recipe: { title: 'Wygenerowany przepis', ingredients: [] }
    });
  });
  
  return app;
};

/**
 * Uruchamia serwer na danym porcie
 * @param {express.Application} app - Instancja Express
 * @param {number} port - Port do nasłuchiwania
 * @returns {Promise<Server>} - Uruchomiony serwer
 */
export const startServer = (app, port = 0) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}; 