// Simple test file that always passes
describe('Dummy Test', () => {
  it('should pass', () => {
    // This test will always pass
    const result = true;
    if (!result) {
      throw new Error('Test failed');
    }
  });
}); 