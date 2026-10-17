import rateLimit from 'express-rate-limit';

/**
 * Factory function to create an authentication rate limiter.
 * Default: 10 requests per 15-minute window per IP.
 * Skips in test environment unless TEST_RATE_LIMIT=true is explicitly set.
 *
 * @param {object} [overrides={}]
 * @returns {import('express').RequestHandler}
 */
export const createAuthRateLimiter = (overrides = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15-minute window per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      res.status(options.statusCode).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests from this IP, please try again after 15 minutes',
          details: [],
          requestId: req.id || req.headers['x-request-id'] || 'unknown',
        },
      });
    },
    skip: () => process.env.NODE_ENV === 'test' && process.env.TEST_RATE_LIMIT !== 'true',
    ...overrides,
  });

export const authRateLimiter = createAuthRateLimiter();

/**
 * Rate limiter for analysis creation: 10 requests per 1 hour per user.
 * Keys on authenticated userId (falls back to IP).
 *
 * @param {object} [overrides={}]
 * @returns {import('express').RequestHandler}
 */
export const createAnalysisRateLimiter = (overrides = {}) =>
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 analyses per hour
    standardHeaders: true,
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false },
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: (req, res, _next, options) => {
      res.status(options.statusCode).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded: Maximum 10 resume analyses per hour per user.',
          details: [],
          requestId: req.id || req.headers['x-request-id'] || 'unknown',
        },
      });
    },
    skip: () => process.env.NODE_ENV === 'test' && process.env.TEST_RATE_LIMIT !== 'true',
    ...overrides,
  });

export const analysisRateLimiter = createAnalysisRateLimiter();

