// diagnostic.test.js - Test diagnostyczny setup i mocków

describe('🔧 Diagnostic Tests', () => {
  test('Environment variables are mocked correctly', () => {
    // Test import.meta.env
    expect(global.import?.meta?.env?.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(global.import?.meta?.env?.NODE_ENV).toBe('test');
    
    // Test process.env backup
    expect(process.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(process.env.NODE_ENV).toBe('test');
    
    console.log('✅ Environment variables test passed');
  });

  test('Supabase is mocked correctly', () => {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient('test-url', 'test-key');
    
    expect(client.auth).toBeDefined();
    expect(client.auth.getSession).toBeDefined();
    expect(client.auth.signInWithPassword).toBeDefined();
    
    console.log('✅ Supabase mock test passed');
  });

  test('Axios is mocked correctly', () => {
    const axios = require('axios');
    
    expect(axios.default).toBeDefined();
    expect(axios.default.get).toBeDefined();
    expect(axios.default.post).toBeDefined();
    
    console.log('✅ Axios mock test passed');
  });

  test('DOM globals are available', () => {
    expect(localStorage).toBeDefined();
    expect(sessionStorage).toBeDefined();
    expect(window.matchMedia).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
    
    console.log('✅ DOM globals test passed');
  });

  test('React Testing Library works', () => {
    const { render } = require('@testing-library/react');
    expect(render).toBeDefined();
    
    console.log('✅ React Testing Library test passed');
  });
}); 