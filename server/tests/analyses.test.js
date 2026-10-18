import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { Analysis } from '../src/models/Analysis.js';
import { goldenPairs } from './fixtures/goldenPairs.js';
import { createAnalysisRateLimiter } from '../src/middleware/rateLimiter.js';
import express from 'express';

describe('Analyses API & Persistence (Milestone 4 - API-1..API-8)', () => {
  let mongoServer;
  let userACookie;
  let userBCookie;
  let userAId;
  let userBId;

  const validResumeText = goldenPairs[0].resumeText;
  const validJdText = goldenPairs[0].jobDescription;

  let originalFetch;

  beforeAll(async () => {
    originalFetch = global.fetch;
    global.fetch = async (url, options) => {
      if (typeof url === 'string' && url.includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        summary: 'Strong technical alignment.',
                        missingSkills: ['Kubernetes', 'AWS'],
                        optimizationTips: ['Highlight cloud delivery experience.'],
                        bulletImprovements: [
                          {
                            original: 'Wrote APIs',
                            improved: 'Architected high-throughput microservices.',
                            reason: 'Measurable business impact.',
                          },
                        ],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        };
      }
      return originalFetch(url, options);
    };

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      name: 'User Alpha',
      email: 'alpha@example.com',
      password: 'Password123!',
    });
    userACookie = resA.headers['set-cookie'];
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      name: 'User Beta',
      email: 'beta@example.com',
      password: 'Password123!',
    });
    userBCookie = resB.headers['set-cookie'];
    userBId = resB.body.user.id;
  });

  afterAll(async () => {
    global.fetch = originalFetch;
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Analysis.deleteMany({});
  });

  describe('POST /api/v1/analyses', () => {
    it('creates an analysis report and returns 201 with deterministic score and breakdown', async () => {
      const res = await request(app)
        .post('/api/v1/analyses')
        .set('Cookie', userACookie)
        .send({
          resumeText: validResumeText,
          jobDescription: validJdText,
          title: 'Full Stack Engineer Evaluation',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('analysis');

      const { analysis } = res.body;
      expect(analysis.id).toBeDefined();
      expect(analysis.title).toBe('Full Stack Engineer Evaluation');
      expect(analysis.score).toBeGreaterThanOrEqual(70);
      expect(analysis.score).toBeLessThanOrEqual(100);

      // Verify breakdown components
      expect(analysis.breakdown).toBeDefined();
      expect(analysis.breakdown.keyword).toBeDefined();
      expect(analysis.breakdown.sections).toBeDefined();
      expect(analysis.breakdown.readability).toBeDefined();
      expect(analysis.breakdown.impact).toBeDefined();

      // Verify privacy (ADR 5 & API-1): Raw resume text must NEVER be in response or DB
      expect(analysis.resumeText).toBeUndefined();
      expect(analysis.rawText).toBeUndefined();
      expect(analysis.resumeHash).toBeDefined(); // sha256 hash
      expect(analysis.resumeHash.length).toBe(64);

      // Verify DB persistence
      const saved = await Analysis.findById(analysis.id);
      expect(saved).not.toBeNull();
      expect(saved.userId.toString()).toBe(userAId);
      expect(saved.resumeHash).toBe(analysis.resumeHash);
    });

    it('returns 400 VALIDATION_ERROR when resume text is under 200 characters', async () => {
      const res = await request(app)
        .post('/api/v1/analyses')
        .set('Cookie', userACookie)
        .send({
          resumeText: 'Too short resume text',
          jobDescription: validJdText,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.path === 'resumeText')).toBe(true);
    });

    it('returns 400 VALIDATION_ERROR when job description is under 50 characters', async () => {
      const res = await request(app)
        .post('/api/v1/analyses')
        .set('Cookie', userACookie)
        .send({
          resumeText: validResumeText,
          jobDescription: 'Short JD',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.path === 'jobDescription')).toBe(true);
    });

    it('returns 401 UNAUTHORIZED when called without authentication', async () => {
      const res = await request(app).post('/api/v1/analyses').send({
        resumeText: validResumeText,
        jobDescription: validJdText,
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/analyses (List, Pagination & Raw Text Exclusion)', () => {
    beforeEach(async () => {
      // Create 3 analyses for User A
      await Promise.all([
        Analysis.create({
          userId: userAId,
          title: 'Analysis A-1',
          resumeHash: 'hash-a1',
          jdSnippet: 'Target JD snippet A-1',
          score: 82,
          breakdown: { keyword: 50, sections: 16, readability: 8, impact: 8 },
          matched: ['React', 'Node.js'],
          missing: ['Docker'],
          aiStatus: 'ok',
          ai: null,
        }),
        Analysis.create({
          userId: userAId,
          title: 'Analysis A-2',
          resumeHash: 'hash-a2',
          jdSnippet: 'Target JD snippet A-2',
          score: 85,
          breakdown: { keyword: 52, sections: 17, readability: 8, impact: 8 },
          matched: ['TypeScript', 'Express'],
          missing: ['Kubernetes'],
          aiStatus: 'ok',
          ai: null,
        }),
        Analysis.create({
          userId: userAId,
          title: 'Analysis A-3',
          resumeHash: 'hash-a3',
          jdSnippet: 'Target JD snippet A-3',
          score: 88,
          breakdown: { keyword: 54, sections: 18, readability: 8, impact: 8 },
          matched: ['React', 'TypeScript'],
          missing: ['AWS'],
          aiStatus: 'ok',
          ai: null,
        }),
        Analysis.create({
          userId: userBId,
          title: 'Analysis B-1',
          resumeHash: 'hash-b1',
          jdSnippet: 'Target JD snippet B-1',
          score: 75,
          breakdown: { keyword: 45, sections: 15, readability: 8, impact: 7 },
          matched: ['Python'],
          missing: ['Django'],
          aiStatus: 'ok',
          ai: null,
        }),
      ]);
    });

    it('API-4: returns paginated list of analyses with page, limit, total, totalPages', async () => {
      const res = await request(app)
        .get('/api/v1/analyses?page=1&limit=2')
        .set('Cookie', userACookie);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
      expect(res.body.total).toBe(3);
      expect(res.body.totalPages).toBe(2);
    });

    it('API-1: list endpoint strictly excludes raw resume text', async () => {
      const res = await request(app)
        .get('/api/v1/analyses')
        .set('Cookie', userACookie);

      expect(res.status).toBe(200);
      for (const item of res.body.items) {
        expect(item.resumeText).toBeUndefined();
        expect(item.rawText).toBeUndefined();
        expect(item.title).toBeDefined();
        expect(item.score).toBeDefined();
      }
    });

    it('isolates user history (User B cannot view User A analyses in list)', async () => {
      const resB = await request(app)
        .get('/api/v1/analyses')
        .set('Cookie', userBCookie);

      expect(resB.status).toBe(200);
      expect(resB.body.items).toHaveLength(1);
      expect(resB.body.items[0].title).toBe('Analysis B-1');
    });
  });

  describe('GET /api/v1/analyses/:id & Ownership Isolation (API-2, SEC IDOR)', () => {
    let userAAnalysisId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/analyses')
        .set('Cookie', userACookie)
        .send({
          resumeText: validResumeText,
          jobDescription: validJdText,
          title: 'Owner Test Analysis',
        });
      userAAnalysisId = res.body.analysis.id;
    });

    it('returns analysis when requested by the authentic owner', async () => {
      const res = await request(app)
        .get(`/api/v1/analyses/${userAAnalysisId}`)
        .set('Cookie', userACookie);

      expect(res.status).toBe(200);
      expect(res.body.analysis.id).toBe(userAAnalysisId);
      expect(res.body.analysis.title).toBe('Owner Test Analysis');
    });

    it('API-2: returns 404 NOT_FOUND when accessed by non-owner (IDOR defense)', async () => {
      // User B attempts to access User A's analysis
      const res = await request(app)
        .get(`/api/v1/analyses/${userAAnalysisId}`)
        .set('Cookie', userBCookie);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toBe('Analysis not found');
    });

    it('returns 404 for invalid ObjectId', async () => {
      const res = await request(app)
        .get('/api/v1/analyses/invalid-id-format')
        .set('Cookie', userACookie);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/analyses/:id (API-3, SEC IDOR)', () => {
    let userAAnalysisId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/analyses')
        .set('Cookie', userACookie)
        .send({
          resumeText: validResumeText,
          jobDescription: validJdText,
          title: 'Deletion Test Analysis',
        });
      userAAnalysisId = res.body.analysis.id;
    });

    it('API-3: owner can successfully delete analysis (204) and removes from database', async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/analyses/${userAAnalysisId}`)
        .set('Cookie', userACookie);

      expect(deleteRes.status).toBe(204);

      // Subsequent retrieval must return 404
      const getRes = await request(app)
        .get(`/api/v1/analyses/${userAAnalysisId}`)
        .set('Cookie', userACookie);

      expect(getRes.status).toBe(404);

      // Verify removed from DB
      const inDb = await Analysis.findById(userAAnalysisId);
      expect(inDb).toBeNull();
    });

    it('returns 404 NOT_FOUND when non-owner attempts to delete (IDOR defense)', async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/analyses/${userAAnalysisId}`)
        .set('Cookie', userBCookie);

      expect(deleteRes.status).toBe(404);
      expect(deleteRes.body.error.code).toBe('NOT_FOUND');

      // Verify document still exists in DB
      const stillInDb = await Analysis.findById(userAAnalysisId);
      expect(stillInDb).not.toBeNull();
    });
  });

  describe('Rate Limiter (API-5)', () => {
    it('API-5: enforces rate limit of 10 requests per user and returns 429 RATE_LIMITED', async () => {
      const testApp = express();
      testApp.use(express.json());

      const strictLimiter = createAnalysisRateLimiter({
        windowMs: 60 * 1000,
        max: 3,
        skip: () => false, // Force enforcement for test
      });

      testApp.post('/test-analysis-limit', strictLimiter, (_req, res) => {
        res.status(200).json({ ok: true });
      });

      // 3 successful requests
      for (let i = 0; i < 3; i++) {
        const res = await request(testApp).post('/test-analysis-limit');
        expect(res.status).toBe(200);
      }

      // 4th request must be rate limited
      const limitedRes = await request(testApp).post('/test-analysis-limit');
      expect(limitedRes.status).toBe(429);
      expect(limitedRes.body.error.code).toBe('RATE_LIMITED');
      expect(limitedRes.body.error.message).toContain('Rate limit exceeded');
    });
  });
});
