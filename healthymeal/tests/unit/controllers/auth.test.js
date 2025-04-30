const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importuj kontroler i modele
const authController = require('../../../backend/src/controllers/auth');
const User = require('../../../backend/src/models/User');

describe('Auth Controller', () => {
  let req, res, next;
  
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
  });
  
  afterEach(() => {
    // Przywróć wszystkie stuby i mocki po każdym teście
    sinon.restore();
  });
  
  describe('register', () => {
    it('powinien utworzyć nowego użytkownika i zwrócić token', async () => {
      // Mocks
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };
      
      // Mockuj metodę findOne aby symulować, że użytkownik nie istnieje
      const findOneStub = sinon.stub(User, 'findOne').resolves(null);
      
      // Mockuj bcrypt.hash
      const bcryptStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
      
      // Mockuj User.create
      const userCreateStub = sinon.stub(User, 'create').resolves({
        _id: '123456789',
        email: req.body.email,
        name: req.body.name,
        password: 'hashedPassword'
      });
      
      // Mockuj jwt.sign
      const jwtStub = sinon.stub(jwt, 'sign').returns('test-token');
      
      // Wywołaj kontroler
      await authController.register(req, res, next);
      
      // Asercje
      expect(findOneStub.calledOnce).to.be.true;
      expect(bcryptStub.calledOnce).to.be.true;
      expect(userCreateStub.calledOnce).to.be.true;
      expect(jwtStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('token', 'test-token');
      expect(res.json.args[0][0]).to.have.property('userId', '123456789');
    });
    
    it('powinien zwrócić błąd, gdy email jest już zajęty', async () => {
      // Mocks
      req.body = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User'
      };
      
      // Mockuj metodę findOne aby symulować, że użytkownik już istnieje
      sinon.stub(User, 'findOne').resolves({
        _id: '123456789',
        email: req.body.email
      });
      
      // Wywołaj kontroler
      await authController.register(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('Email jest już zajęty');
    });
  });
  
  describe('login', () => {
    it('powinien zalogować użytkownika i zwrócić token', async () => {
      // Mocks
      req.body = {
        email: 'test@example.com',
        password: 'Password123'
      };
      
      // Mockuj metodę findOne aby symulować, że użytkownik istnieje
      const findOneStub = sinon.stub(User, 'findOne').resolves({
        _id: '123456789',
        email: req.body.email,
        password: 'hashedPassword'
      });
      
      // Mockuj bcrypt.compare
      const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(true);
      
      // Mockuj jwt.sign
      const jwtStub = sinon.stub(jwt, 'sign').returns('test-token');
      
      // Wywołaj kontroler
      await authController.login(req, res, next);
      
      // Asercje
      expect(findOneStub.calledOnce).to.be.true;
      expect(bcryptStub.calledOnce).to.be.true;
      expect(jwtStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('token', 'test-token');
      expect(res.json.args[0][0]).to.have.property('userId', '123456789');
    });
    
    it('powinien zwrócić błąd, gdy użytkownik nie istnieje', async () => {
      // Mocks
      req.body = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };
      
      // Mockuj metodę findOne aby symulować, że użytkownik nie istnieje
      sinon.stub(User, 'findOne').resolves(null);
      
      // Wywołaj kontroler
      await authController.login(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('Nieprawidłowy email');
    });
    
    it('powinien zwrócić błąd, gdy hasło jest nieprawidłowe', async () => {
      // Mocks
      req.body = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };
      
      // Mockuj metodę findOne aby symulować, że użytkownik istnieje
      sinon.stub(User, 'findOne').resolves({
        _id: '123456789',
        email: req.body.email,
        password: 'hashedPassword'
      });
      
      // Mockuj bcrypt.compare aby symulować nieprawidłowe hasło
      sinon.stub(bcrypt, 'compare').resolves(false);
      
      // Wywołaj kontroler
      await authController.login(req, res, next);
      
      // Asercje
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0]).to.have.property('message');
      expect(res.json.args[0][0].message).to.include('Nieprawidłowe hasło');
    });
  });
}); 