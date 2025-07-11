describe('Simple Test', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should work with arrays', () => {
    const fruits = ['apple', 'banana'];
    expect(fruits).toContain('apple');
    expect(fruits).toHaveLength(2);
  });

  test('should work with objects', () => {
    const user = { name: 'John', age: 30 };
    expect(user).toHaveProperty('name');
    expect(user.name).toBe('John');
  });
}); 