/**
 * Middleware do limitowania zapytań do API AI
 * Zapobiega nadużyciom i kontroluje wykorzystanie zasobów modeli AI
 */

const ApiLimitManager = require('../services/apiLimitManager');
const logger = require('../utils/logger');

// Cache'owanie limitów w pamięci (nie wymaga bazy danych)
const limitsCache = {};

// Czyszczenie cache co 24h
setInterval(() => {
  const date = new Date().toISOString().split('T')[0]; // Obecna data
  Object.keys(limitsCache).forEach(key => {
    // Jeśli klucz nie zawiera dzisiejszej daty, usuń go
    if (!key.includes(date)) {
      delete limitsCache[key];
    }
  });
}, 1000 * 60 * 60); // Co godzinę

/**
 * Middleware do sprawdzania limitów API dla użytkownika
 * @param {Object} options - Opcje konfiguracyjne
 * @param {number} options.maxDailyRequests - Maksymalna liczba zapytań na dzień (domyślnie: AI_DAILY_LIMIT z .env)
 * @param {boolean} options.strictMode - Czy ściśle odrzucać zapytania powyżej limitu (domyślnie: false)
 * @param {string} options.mockModePath - Ścieżka do wykorzystania mocków (domyślnie: 'useMockAI')
 * @returns {Function} Funkcja middleware Express
 */
function apiLimitMiddleware(options = {}) {
  const apiLimitManager = new ApiLimitManager();
  
  // Mapa IP do czasu ostatniego żądania - ochrona przed atakami
  const ipRequestMap = new Map();
  
  // Maksymalna liczba zapytań na minutę z jednego IP
  const MAX_REQUESTS_PER_MINUTE = 30;
  
  return async (req, res, next) => {
    try {
      // Pobierz IP i sprawdź, czy nie ma zbyt wielu żądań z tego samego źródła
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Sprawdź, czy IP nie przekracza limitu na minutę
      if (ipRequestMap.has(clientIp)) {
        const { count, timestamp } = ipRequestMap.get(clientIp);
        const now = Date.now();
        
        // Jeśli minęła minuta, zresetuj licznik
        if (now - timestamp > 60000) {
          ipRequestMap.set(clientIp, { count: 1, timestamp: now });
        } else if (count >= MAX_REQUESTS_PER_MINUTE) {
          // Zbyt wiele żądań w krótkim czasie
          logger.warn(`Zbyt wiele żądań z IP ${clientIp} - możliwy atak`);
          return res.status(429).json({
            success: false,
            error: 'TOO_MANY_REQUESTS',
            message: 'Zbyt wiele żądań w krótkim czasie. Spróbuj ponownie za chwilę.'
          });
        } else {
          // Zwiększ licznik
          ipRequestMap.set(clientIp, { count: count + 1, timestamp });
        }
      } else {
        // Nowe IP - dodaj do mapy
        ipRequestMap.set(clientIp, { count: 1, timestamp: Date.now() });
      }
      
      // Pobierz ID użytkownika z tokenu lub sesji
      const userId = req.user?.id || req.user?._id || 'anonymous';
      
      // Ignoruj limity dla administratorów
      if (req.user?.role === 'admin' || req.user?.isAdmin === true) {
        logger.debug(`Użytkownik ${userId} ma uprawnienia administratora - ignoruję limity AI`);
        req.aiUsage = {
          unlimited: true,
          isAdmin: true,
          dailyLimit: Number.POSITIVE_INFINITY,
          used: 0,
          remaining: Number.POSITIVE_INFINITY
        };
        return next();
      }
      
      // Maksymalna liczba zapytań na dzień
      const maxDailyRequests = options.maxDailyRequests || 
                             parseInt(process.env.AI_DAILY_LIMIT, 10) || 
                             10;
      
      // Konfiguracja trybu ścisłego (domyślnie: false - w przypadku przekroczenia limitu używaj mocków)
      const strictMode = options.strictMode === true;
      
      // Ścieżka do ustawienia trybu mock (domyślnie: useMockAI)
      const mockModePath = options.mockModePath || 'useMockAI';
      
      // Pobierz aktualną datę w formacie YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `${userId}_${today}`;
      
      // Jeśli nie ma w cache, zainicjuj
      if (!limitsCache[cacheKey]) {
        try {
          const userLimits = await apiLimitManager.getUserLimits(userId);
          limitsCache[cacheKey] = userLimits.usedToday || 0;
        } catch (error) {
          logger.error(`Błąd podczas pobierania limitów dla użytkownika ${userId}:`, error);
          limitsCache[cacheKey] = 0; // Założenie, że użytkownik nie wykorzystał limitów w razie błędu
        }
      }
      
      // Informacje o wykorzystaniu AI do wysłania do frontendu
      const aiUsageInfo = {
        dailyLimit: maxDailyRequests,
        used: limitsCache[cacheKey],
        remaining: Math.max(0, maxDailyRequests - limitsCache[cacheKey]),
        limitExceeded: limitsCache[cacheKey] >= maxDailyRequests
      };
      
      // Dodaj informacje do obiektu żądania
      req.aiUsage = aiUsageInfo;
      
      // Sprawdź limit użytkownika
      if (limitsCache[cacheKey] >= maxDailyRequests) {
        // Przekroczono limit dzienny
        logger.warn(`Użytkownik ${userId} przekroczył dzienny limit zapytań AI (${maxDailyRequests})`);
        
        if (strictMode) {
          // W trybie ścisłym odrzucamy zapytanie
          return res.status(429).json({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Przekroczono dzienny limit zapytań AI. Spróbuj ponownie jutro.',
            aiUsage: aiUsageInfo
          });
        } else {
          // W trybie normalnym pozwalamy, ale dodajemy flagę do używania mockowych danych
          req[mockModePath] = true;
          req.aiLimitExceeded = true;
          
          // Zapisz informacje o przekroczeniu limitu w odpowiedzi HTTP
          res.set('X-AI-Limit-Exceeded', 'true');
          res.set('X-AI-Limit-Mode', 'mock');
          
          return next();
        }
      }
      
      // Wszystko w porządku, zwiększamy licznik i kontynuujemy
      limitsCache[cacheKey]++;
      
      // Zaktualizuj licznik w bazie danych (asynchronicznie)
      apiLimitManager.incrementUsage(userId).catch(err => {
        logger.error(`Błąd podczas aktualizacji limitu AI: ${err.message}`);
      });
      
      // Aktualizuj informacje o wykorzystaniu AI po inkrementacji
      req.aiUsage = {
        dailyLimit: maxDailyRequests,
        used: limitsCache[cacheKey],
        remaining: Math.max(0, maxDailyRequests - limitsCache[cacheKey]),
        limitExceeded: false
      };
      
      // Dodaj nagłówki z informacjami o wykorzystaniu API
      res.set('X-AI-Usage-Limit', maxDailyRequests.toString());
      res.set('X-AI-Usage-Used', limitsCache[cacheKey].toString());
      res.set('X-AI-Usage-Remaining', Math.max(0, maxDailyRequests - limitsCache[cacheKey]).toString());
      
      // Kontynuuj obsługę zapytania
      next();
    } catch (error) {
      logger.error(`Błąd podczas sprawdzania limitu API: ${error.message}`, error);
      
      // W przypadku błędu pozwalamy na żądanie (fail open), ale logujemy błąd
      req.aiUsage = {
        error: true,
        message: 'Wystąpił błąd podczas sprawdzania limitu API'
      };
      
      // W trybie produkcyjnym wciąż dopuszczamy żądanie
      if (process.env.NODE_ENV === 'production') {
        next();
      } else {
        // W trybie deweloperskim lub testowym zwracamy szczegóły błędu
        res.status(500).json({
          success: false,
          error: 'API_LIMIT_ERROR',
          message: 'Wystąpił błąd podczas sprawdzania limitu API',
          details: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
      }
    }
  };
}

module.exports = apiLimitMiddleware; 