// unit/middleware/auth.test.js - Test middleware auth
import jwt from 'jsonwebtoken';
import { auth } from '../../../backend/src/middleware/auth.js';

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Token validation', () => {
    test('przepuszcza prawidłowy token', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockToken = 'valid-jwt-token';

      req.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockReturnValue(mockUser);

      await auth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('odrzuca brak tokena', async () => {
      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied. No token provided.' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('odrzuca nieprawidłowy format tokena', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied. Invalid token format.' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('odrzuca nieprawidłowy token', async () => {
      const invalidToken = 'invalid-jwt-token';
      req.headers.authorization = `Bearer ${invalidToken}`;

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied. Invalid token.' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('obsługuje wygaśnięty token', async () => {
      const expiredToken = 'expired-jwt-token';
      req.headers.authorization = `Bearer ${expiredToken}`;

      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied. Token expired.' 
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Alternative token sources', () => {
    test('pobiera token z query parametru', async () => {
      const mockUser = { id: 'user123' };
      const mockToken = 'query-token';

      req.query = { token: mockToken };
      jwt.verify.mockReturnValue(mockUser);

      await auth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('priorytet header nad query', async () => {
      const mockUser = { id: 'user123' };
      const headerToken = 'header-token';
      const queryToken = 'query-token';

      req.headers.authorization = `Bearer ${headerToken}`;
      req.query = { token: queryToken };
      jwt.verify.mockReturnValue(mockUser);

      await auth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(headerToken, process.env.JWT_SECRET);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });
}); 