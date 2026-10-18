import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

import { generateAllFixtures } from './fixtures/createFixtures.js';

describe('Resume Upload and Parsing API (Milestone 2 - UPL-1..UPL-6)', () => {
  let mongoServer;
  let authCookie;

  beforeAll(async () => {
    // Generate fresh binary fixtures to guarantee exact xref byte offsets regardless of git checkout CRLF
    generateAllFixtures(fixturesDir);

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register a test user and obtain auth session cookie
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Resume Tester',
      email: 'resumetester@example.com',
      password: 'Password123!',
    });

    authCookie = res.headers['set-cookie'];
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('UPL-6: Authentication requirement', () => {
    it('returns 401 UNAUTHORIZED when no authentication session exists', async () => {
      const goodPdfPath = path.join(fixturesDir, 'resume-good.pdf');
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .attach('resume', goodPdfPath);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Authentication required');
    });
  });

  describe('UPL-1: Valid text PDF', () => {
    it('extracts text, page count, and charCount from a valid PDF', async () => {
      const goodPdfPath = path.join(fixturesDir, 'resume-good.pdf');
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie)
        .attach('resume', goodPdfPath);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('text');
      expect(res.body).toHaveProperty('pages');
      expect(res.body).toHaveProperty('charCount');

      expect(typeof res.body.text).toBe('string');
      expect(res.body.pages).toBe(1);
      expect(res.body.charCount).toBeGreaterThan(200);
      expect(res.body.text).toContain('Alex Morgan');
      expect(res.body.text).toContain('Senior Full Stack Software Engineer');
      expect(res.body.text).toContain('Technical Skills');
    });
  });

  describe('UPL-2: Non-PDF content validation', () => {
    it('returns 400 VALIDATION_ERROR for non-PDF content renamed with .pdf extension', async () => {
      const notPdfPath = path.join(fixturesDir, 'not-a-pdf.pdf');
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie)
        .attach('resume', notPdfPath);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('%PDF-');
    });

    it('returns 400 VALIDATION_ERROR when non-pdf extension is uploaded', async () => {
      const textBuffer = Buffer.from('Plain text content');
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie)
        .attach('resume', textBuffer, 'document.txt');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 VALIDATION_ERROR if no file is uploaded', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('Resume file is required');
    });
  });

  describe('UPL-3: File size limits (>5MB)', () => {
    it('returns 413 PAYLOAD_TOO_LARGE when file exceeds 5MB limit', async () => {
      // Create a buffer larger than 5MB with %PDF- header
      const largeBufferSize = 5.2 * 1024 * 1024;
      const largeBuffer = Buffer.alloc(largeBufferSize, 'a');
      largeBuffer.write('%PDF-1.4', 0, 'ascii');

      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie)
        .attach('resume', largeBuffer, 'large-resume.pdf');

      expect(res.status).toBe(413);
      expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
      expect(res.body.error.message).toContain('5MB');
    });
  });

  describe('UPL-4: Scanned or image-only PDF detection (<200 chars)', () => {
    it('returns 422 UNPROCESSABLE for scanned PDF with insufficient readable text', async () => {
      const scannedPdfPath = path.join(fixturesDir, 'resume-scanned.pdf');
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie)
        .attach('resume', scannedPdfPath);

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('UNPROCESSABLE');
      expect(res.body.error.message).toContain('fewer than 200 characters');
      expect(res.body.error.message.toLowerCase()).toContain('scanned');
    });
  });

  describe('UPL-5: Page limit cap (>10 pages)', () => {
    it('returns 422 UNPROCESSABLE when PDF exceeds 10 page limit', async () => {
      const elevenPdfPath = path.join(fixturesDir, 'resume-11pages.pdf');
      const res = await request(app)
        .post('/api/v1/resumes/parse')
        .set('Cookie', authCookie)
        .attach('resume', elevenPdfPath);

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('UNPROCESSABLE');
      expect(res.body.error.message).toContain('10 pages');
      expect(res.body.error.message).toContain('11');
    });
  });
});
