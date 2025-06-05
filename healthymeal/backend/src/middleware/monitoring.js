const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Konfiguracja loggera
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    colorize(),
    printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware do monitorowania wydajności
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userAgent: req.get('user-agent')
    });
  });

  next();
};

// Middleware do monitorowania błędów
const errorMonitor = (err, req, res, next) => {
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    status: err.statusCode || 500,
    user: req.user?.id
  });

  next(err);
};

// Middleware do monitorowania użycia AI
const aiUsageMonitor = (req, res, next) => {
  if (req.path.includes('/api/ai/')) {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      logger.info('AI request completed', {
        endpoint: req.path,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`,
        user: req.user?.id,
        model: req.body?.model || 'default'
      });
    });
  }

  next();
};

// Middleware do monitorowania autentykacji
const authMonitor = (req, res, next) => {
  if (req.path.includes('/api/auth/')) {
    logger.info('Authentication attempt', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      success: res.statusCode < 400
    });
  }

  next();
};

module.exports = {
  logger,
  performanceMonitor,
  errorMonitor,
  aiUsageMonitor,
  authMonitor
}; 