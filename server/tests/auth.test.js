import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { env } from '../src/config/env.js';
import { createAuthRateLimiter } from '../src/middleware/rateLimiter.js';
import express from 'express';

describe('Auth Endpoints & Security (Milestone 1)', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('AUTH-1: POST /api/v1/auth/register', () => {
    it('creates a user and returns 201 with user object and no passwordHash', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(res.body.user.id).toBeDefined();

      // Non-negotiable security: Never return passwordHash, _id, or __v
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.user._id).toBeUndefined();
      expect(res.body.user.__v).toBeUndefined();

      // Verify cookie is set on register
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('token='))).toBe(true);
      expect(cookies.some((c) => c.toLowerCase().includes('httponly'))).toBe(true);

      // Verify persisted user in DB has bcrypt hashed password
      const savedUser = await User.findOne({ email: 'jane@example.com' }).select('+passwordHash');
      expect(savedUser).not.toBeNull();
      expect(savedUser.passwordHash).not.toBe('Password123!');
      expect(savedUser.passwordHash.startsWith('$2')).toBe(true);
    });
  });

  describe('AUTH-2: Duplicate email handling', () => {
    it('returns 409 CONFLICT when email is already registered', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      const duplicateRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Duplicate',
        email: 'JANE@example.com', // Case-insensitive duplicate
        password: 'Password456!',
      });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.error).toBeDefined();
      expect(duplicateRes.body.error.code).toBe('CONFLICT');
      expect(duplicateRes.body.error.message).toBe('Email already registered');
      expect(duplicateRes.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'email' }),
        ])
      );
    });
  });

  describe('AUTH-3: Weak password validation', () => {
    it('returns 400 VALIDATION_ERROR if password is shorter than 8 characters', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: 'Pass1',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.path === 'password')).toBe(true);
    });

    it('returns 400 VALIDATION_ERROR if password has no number', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'No Number',
        email: 'nonumber@example.com',
        password: 'PasswordOnly',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.path === 'password')).toBe(true);
    });

    it('returns 400 VALIDATION_ERROR for invalid email format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'Password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.path === 'email')).toBe(true);
    });
  });

  describe('AUTH-4: POST /api/v1/auth/login sets httpOnly cookie', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
      });
    });

    it('logs in successfully and sets httpOnly SameSite cookie', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body.user.passwordHash).toBeUndefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie.toLowerCase()).toContain('httponly');
      expect(tokenCookie.toLowerCase()).toContain('samesite=lax');
    });
  });

  describe('AUTH-5: Wrong credentials timing & generic error message', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!',
      });
    });

    it('returns generic 401 for wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'existing@example.com',
        password: 'WrongPassword999!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('returns identical generic 401 for non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'AnyPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('AUTH-6: Token verification & Session lifecycle', () => {
    let authCookie;
    let userId;

    beforeEach(async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        name: 'Session User',
        email: 'session@example.com',
        password: 'Password123!',
      });
      authCookie = reg.headers['set-cookie'];
      userId = reg.body.user.id;
    });

    it('GET /api/v1/auth/me returns 200 with current user when authenticated with cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        id: userId,
        email: 'session@example.com',
        name: 'Session User',
      });
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('GET /api/v1/auth/me returns 401 when no token provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Authentication required');
    });

    it('GET /api/v1/auth/me returns 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { id: userId, email: 'session@example.com' },
        env.JWT_SECRET,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${expiredToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Session expired');
    });

    it('GET /api/v1/auth/me returns 401 for malformed/tampered token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=forged.invalid.token']);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/logout clears auth cookie and returns 204', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', authCookie);

      expect(res.status).toBe(204);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies.find((c) => c.startsWith('token='));
      expect(clearedCookie).toBeDefined();
      // Cookie is cleared with max-age=0 or expires in the past
      expect(clearedCookie).toMatch(/Max-Age=0|Expires=/i);
    });

    it('POST /api/v1/auth/logout returns 401 if unauthenticated', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('Rate Limiter', () => {
    it('returns 429 RATE_LIMITED after exceeding max limit', async () => {
      const testApp = express();
      testApp.use(express.json());

      const strictLimiter = createAuthRateLimiter({
        windowMs: 60 * 1000,
        max: 3,
        skip: () => false, // Force enforcement in test
      });

      testApp.post('/test-limit', strictLimiter, (_req, res) => {
        res.status(200).json({ ok: true });
      });

      // 3 successful requests
      for (let i = 0; i < 3; i++) {
        const res = await request(testApp).post('/test-limit');
        expect(res.status).toBe(200);
      }

      // 4th request must be rate limited
      const limitedRes = await request(testApp).post('/test-limit');
      expect(limitedRes.status).toBe(429);
      expect(limitedRes.body.error.code).toBe('RATE_LIMITED');
      expect(limitedRes.body.error.message).toContain('Too many requests');
    });
  });
});
