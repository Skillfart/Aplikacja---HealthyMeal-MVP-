export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
}; 