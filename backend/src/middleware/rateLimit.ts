import rateLimit, { MemoryStore } from 'express-rate-limit';
import { config } from '../config/env';
import { TooManyRequestsError } from '../utils/errors';

// Create memory stores that can be reset in tests
export const generalStore = new MemoryStore();
export const authStore = new MemoryStore();

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: generalStore,
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many requests, please try again later');
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.authMax,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: authStore,
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many authentication attempts, please try again later');
  },
});