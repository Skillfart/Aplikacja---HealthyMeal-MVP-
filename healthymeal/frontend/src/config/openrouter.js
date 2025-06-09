const OPENROUTER_CONFIG = {
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  defaultModel: import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || 'gpt-4o-mini',
  referer: import.meta.env.VITE_OPENROUTER_REFERER,
  dailyLimit: parseInt(import.meta.env.VITE_DAILY_LIMIT) || 5
};

export const getOpenRouterHeaders = () => ({
  'HTTP-Referer': OPENROUTER_CONFIG.referer,
  'X-Title': 'HealthyMeal App',
  Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`
});

export default OPENROUTER_CONFIG; 