import { jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import authMiddleware from '../../../../backend/src/middleware/auth.js';
import User from '../../../../backend/src/models/User.js';

// Mock Supabase
jest.mock('@supabase/supabase-js');

// Mock User model
jest.mock('../../../../backend/src/models/User.js');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
      mongoUser: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Token validation', () => {
    test('should return 401 when no authorization header', async () => {
      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Brak autoryzacji' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when authorization header is malformed', async () => {
      req.headers.authorization = 'InvalidToken';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Brak autoryzacji' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' }
          })
        }
      };
      
      createClient.mockReturnValue(mockSupabase);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nieprawidłowy token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should pass valid token and set user data', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        aud: 'authenticated'
      };

      const mockMongoUser = {
        _id: 'mongo123',
        supabaseId: 'user123',
        email: 'test@example.com',
        preferences: {
          dietType: 'vegetarian',
          allergens: ['gluten']
        },
        aiUsage: {
          count: 2,
          date: new Date()
        }
      };

      req.headers.authorization = 'Bearer valid-token';
      
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      
      createClient.mockReturnValue(mockSupabase);
      User.findOneAndUpdate.mockResolvedValue(mockMongoUser);

      await authMiddleware(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(req.mongoUser).toEqual(mockMongoUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('User synchronization', () => {
    test('should create new MongoDB user if not exists', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        aud: 'authenticated'
      };

      const mockNewMongoUser = {
        _id: 'mongo123',
        supabaseId: 'user123',
        email: 'test@example.com',
        preferences: {
          dietType: 'normal',
          allergens: []
        },
        aiUsage: {
          count: 0,
          date: new Date()
        }
      };

      req.headers.authorization = 'Bearer valid-token';
      
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      
      createClient.mockReturnValue(mockSupabase);
      User.findOneAndUpdate.mockResolvedValue(mockNewMongoUser);

      await authMiddleware(req, res, next);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { supabaseId: mockUser.id },
        {
          supabaseId: mockUser.id,
          email: mockUser.email,
          $setOnInsert: {
            preferences: {
              dietType: 'normal',
              maxCarbs: 0,
              excludedProducts: [],
              allergens: []
            },
            aiUsage: {
              count: 0,
              date: expect.any(Date)
            }
          }
        },
        { upsert: true, new: true }
      );

      expect(req.mongoUser).toEqual(mockNewMongoUser);
      expect(next).toHaveBeenCalled();
    });

    test('should handle MongoDB connection errors', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        aud: 'authenticated'
      };

      req.headers.authorization = 'Bearer valid-token';
      
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      
      createClient.mockReturnValue(mockSupabase);
      User.findOneAndUpdate.mockRejectedValue(new Error('MongoDB connection failed'));

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Błąd serwera' });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 