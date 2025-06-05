const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Importuj kontroler i modele
const authController = require('../../../backend/src/controllers/auth');
const User = require('../../../backend/src/models/User');

describe('Auth Controller', () => {
  let req, res, next;
  let supabaseMock;
  
  beforeEach(() => {
    // Mock req, res i next dla każdego testu
    req = {
      body: {}
    };
    
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    
    next = sinon.spy();
    
    // Mock dla createClient Supabase
    supabaseMock = {
      auth: {
        getUser: sinon.stub().resolves({
          data: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              role: 'user'
            }
          },
          error: null
        })
      }
    };
    
    // Zastępujemy oryginalną funkcję createClient naszym mockiem
    sinon.stub(createClient, 'create').returns(supabaseMock);
  });
  
  afterEach(() => {
    // Przywróć wszystkie stuby i mocki po każdym teście
    sinon.restore();
  });
  
  describe('register', () => {
    it('powinien symulować rejestrację przez Supabase', async () => {
      // Mocks
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };
      
      // Wywołaj kontroler
      await authController.register(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('zarejestrowany pomyślnie');
      expect(res.json.args[0][0]).to.have.property('token');
      expect(res.json.args[0][0]).to.have.property('user');
    });
  });
  
  describe('login', () => {
    it('powinien symulować logowanie przez Supabase', async () => {
      // Mocks
      req.body = {
        email: 'test@example.com',
        password: 'Password123'
      };
      
      // Wywołaj kontroler
      await authController.login(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('Zalogowano pomyślnie');
      expect(res.json.args[0][0]).to.have.property('token');
      expect(res.json.args[0][0]).to.have.property('user');
    });
  });
  
  describe('verifyToken', () => {
    it('powinien weryfikować token Supabase', async () => {
      // Mocks
      req.body = {
        token: 'test-supabase-token'
      };
      
      // Wywołaj kontroler
      await authController.verifyToken(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('Token is valid');
    });
    
    it('powinien odrzucić nieprawidłowy token', async () => {
      // Mocks
      req.body = {
        token: 'invalid-token'
      };
      
      // Mock dla Supabase getUser z błędem
      supabaseMock.auth.getUser.resolves({
        data: null,
        error: {
          message: 'Invalid token'
        }
      });
      
      // Wywołaj kontroler
      await authController.verifyToken(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('Invalid or expired token');
    });
  });
}); 