import crypto from 'crypto';

export function generateHash(input) {
  const stringInput = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('sha256').update(stringInput).digest('hex');
}

export default {
  generateHash
}; 