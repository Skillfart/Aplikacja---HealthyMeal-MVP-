const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Format dla logów deweloperskich
const devLogFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
});

// Konfiguracja loggera
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devLogFormat)
  ),
  defaultMeta: { service: 'healthymeal-api' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Metrics tracker
class MetricsTracker {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      apiErrors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      responseTimeSum: 0,
      aiResponseTimeSum: 0,
      limitExceeded: 0
    };
    
    // Reset counters every day
    setInterval(() => this.resetDailyMetrics(), 24 * 60 * 60 * 1000);
  }
  
  recordApiCall(duration, success) {
    this.metrics.apiCalls++;
    this.metrics.responseTimeSum += duration;
    
    if (!success) {
      this.metrics.apiErrors++;
    }
    
    logger.debug('API call recorded', { 
      duration, 
      success, 
      errorRate: this.getErrorRate() 
    });
  }
  
  recordAiApiCall(duration, success) {
    this.metrics.aiResponseTimeSum += duration;
    
    logger.debug('AI API call recorded', { 
      duration, 
      success 
    });
  }
  
  recordCacheHit() {
    this.metrics.cacheHits++;
    logger.debug('Cache hit recorded', { 
      hitRate: this.getCacheHitRate() 
    });
  }
  
  recordCacheMiss() {
    this.metrics.cacheMisses++;
    logger.debug('Cache miss recorded', { 
      hitRate: this.getCacheHitRate() 
    });
  }
  
  recordLimitExceeded(userId) {
    this.metrics.limitExceeded++;
    logger.info('AI usage limit exceeded', { 
      userId, 
      limitExceededCount: this.metrics.limitExceeded 
    });
  }
  
  getErrorRate() {
    if (this.metrics.apiCalls === 0) return 0;
    return (this.metrics.apiErrors / this.metrics.apiCalls) * 100;
  }
  
  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total === 0) return 0;
    return (this.metrics.cacheHits / total) * 100;
  }
  
  getAverageResponseTime() {
    if (this.metrics.apiCalls === 0) return 0;
    return this.metrics.responseTimeSum / this.metrics.apiCalls;
  }
  
  getAverageAiResponseTime() {
    if (this.metrics.apiCalls === 0) return 0;
    return this.metrics.aiResponseTimeSum / this.metrics.apiCalls;
  }
  
  resetDailyMetrics() {
    logger.info('Resetting daily metrics', { 
      previousMetrics: { ...this.metrics } 
    });
    
    // Reset all counters
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = 0;
    });
  }
  
  getMetricsSnapshot() {
    return {
      ...this.metrics,
      errorRate: this.getErrorRate(),
      cacheHitRate: this.getCacheHitRate(),
      averageResponseTime: this.getAverageResponseTime(),
      averageAiResponseTime: this.getAverageAiResponseTime()
    };
  }
}

const metricsTracker = new MetricsTracker();

module.exports = {
  logger,
  metricsTracker
}; 