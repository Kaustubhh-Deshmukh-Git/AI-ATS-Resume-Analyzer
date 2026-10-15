import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'resumeText',
      'jobDescription',
      'geminiApiKey',
      'GEMINI_API_KEY',
      '*.password',
      '*.token',
      '*.resumeText',
      '*.jobDescription',
    ],
    censor: '[REDACTED]',
  },
});
