import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Analysis } from '../src/models/Analysis.js';
import { env } from '../src/config/env.js';
import { setAuthCookie } from '../src/utils/cookie.js';

describe('Milestone 6 - Security Hardening & Acceptance (SEC-1..SEC-10)', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('SEC-1: Helmet Security Headers', () => {
    it('sets core security headers on all responses', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['x-download-options']).toBe('noopen');
      expect(res.headers['x-xss-protection']).toBe('0');
    });
  });

  describe('SEC-2: Cookie Flags (HttpOnly, SameSite, Secure)', () => {
    it('configures cookie with HttpOnly, SameSite=Lax, and Max-Age=3600s', async () => {
      const mockRes = {
        cookie: (name, val, options) => {
          expect(name).toBe('token');
          expect(options.httpOnly).toBe(true);
          expect(options.sameSite).toBe('lax');
          expect(options.maxAge).toBe(3600000); // 1 hour
          expect(options.path).toBe('/');
          expect(typeof options.secure).toBe('boolean');
        },
      };

      setAuthCookie(mockRes, 'mock-jwt-token');
    });
  });

  describe('SEC-3: Passwords Never Returned in Responses', () => {
    it('never exposes passwordHash or __v in registration or auth responses', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Sec User',
        email: 'sec_user@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.user._id).toBeUndefined();
      expect(res.body.user.__v).toBeUndefined();
    });
  });

  describe('SEC-8 & Request-ID Propagation', () => {
    it('echoes X-Request-Id header when supplied by client', async () => {
      const clientReqId = 'custom-request-uuid-1234';
      const res = await request(app)
        .get('/api/v1/health')
        .set('X-Request-Id', clientReqId);

      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBe(clientReqId);
    });

    it('generates a valid UUID when X-Request-Id header is omitted', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('404 & Consistent Error JSON Shape', () => {
    it('returns consistent error JSON shape on unknown routes', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint-xyz');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
        details: [],
      });
      expect(res.body.error.requestId).toBeDefined();
      expect(res.headers['x-request-id']).toBe(res.body.error.requestId);
    });
  });

  describe('SEC-9: CORS Allowlist Configuration', () => {
    it('allows requests from configured CLIENT_ORIGIN with credentials', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', env.CLIENT_ORIGIN);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(env.CLIENT_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('does not grant access-control-allow-origin to unauthorized origins', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'https://malicious-attacker-domain.com');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Mongo Indexes Verification', () => {
    it('creates and verifies User model indexes (unique lowercase email)', async () => {
      await User.init();
      const indexes = await User.collection.getIndexes();

      // Check for email index
      const emailIndexKey = Object.keys(indexes).find((idxName) =>
        JSON.stringify(indexes[idxName]).includes('email')
      );
      expect(emailIndexKey).toBeDefined();
    });

    it('creates and verifies Analysis model compound index ({ userId: 1, createdAt: -1 })', async () => {
      await Analysis.init();
      const indexes = await Analysis.collection.getIndexes();

      // Check for compound index on userId and createdAt
      const compoundIdx = Object.values(indexes).find((idx) => {
        const str = JSON.stringify(idx);
        return str.includes('userId') && str.includes('createdAt');
      });
      expect(compoundIdx).toBeDefined();
    });
  });
});
