// __mocks__/useAIUsage.js - Mock useAIUsage hook dla testów

export const useAIUsage = () => ({
  usageCount: 0,
  maxUsage: 10,
  loading: false,
  error: null,
  incrementUsage: jest.fn(() => Promise.resolve()),
  resetUsage: jest.fn(),
  canUseAI: true
}); 