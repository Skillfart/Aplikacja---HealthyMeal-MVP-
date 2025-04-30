const { expect } = require('chai');
const sinon = require('sinon');
const aiController = require('../mocks/controllers/aiController');

describe('AI Integration Tests', () => {
  let req, res, statusStub, jsonStub;

  beforeEach(() => {
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    req = {
      params: { recipeId: '123456789' },
      body: {
        preferences: {
          dietType: 'keto',
          maxCarbs: 20,
          excludedProducts: ['sugar'],
          allergens: ['gluten']
        }
      },
      user: { _id: 'user123', email: 'test@example.com' }
    };
    res = { status: statusStub };
  });

  describe('modifyRecipe', () => {
    it('should return a modified recipe', async () => {
      await aiController.modifyRecipe(req, res);
      
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      
      const responseData = jsonStub.firstCall.args[0];
      expect(responseData).to.have.property('success', true);
      expect(responseData).to.have.property('modifiedRecipe');
      expect(responseData.modifiedRecipe).to.have.property('title');
      expect(responseData.modifiedRecipe).to.have.property('ingredients').that.is.an('array');
      expect(responseData).to.have.property('aiUsage');
      expect(responseData.aiUsage).to.have.property('used');
      expect(responseData.aiUsage).to.have.property('limit');
      expect(responseData.aiUsage).to.have.property('remaining');
    });
  });

  describe('checkUsageLimit', () => {
    it('should return AI usage info', async () => {
      await aiController.checkUsageLimit(req, res);
      
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      
      const responseData = jsonStub.firstCall.args[0];
      expect(responseData).to.have.property('usage');
      expect(responseData.usage).to.have.property('used');
      expect(responseData.usage).to.have.property('limit');
      expect(responseData.usage).to.have.property('remaining');
      expect(responseData).to.have.property('canUse');
    });
  });
});