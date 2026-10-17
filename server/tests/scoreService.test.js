import { describe, it, expect } from 'vitest';
import {
  calculateSectionsScore,
  calculateReadabilityScore,
  calculateImpactScore,
  scoreResume,
} from '../src/services/scoreService.js';
import { goldenPairs } from './fixtures/goldenPairs.js';

describe('Score Service (ATS Scoring Engine)', () => {
  describe('calculateSectionsScore', () => {
    it('returns 100 when all 5 core sections are present', () => {
      const fullResume = `
        Alex Smith | alex@example.com | (555) 123-4567 | github.com/alex
        Professional Summary:
        Experienced full stack software engineer.
        Technical Skills:
        JavaScript, React, Node.js
        Work Experience:
        Software Engineer at TechCo
        Education:
        B.S. in Computer Science
      `;

      expect(calculateSectionsScore(fullResume)).toBe(100);
    });

    it('returns proportional score (20 pts per section) when sections are missing', () => {
      // Only Contact and Skills (40 pts)
      const sparseResume = `
        Alex Smith | alex@example.com
        Technical Skills:
        React, Node.js
      `;

      expect(calculateSectionsScore(sparseResume)).toBe(40);
    });

    it('returns 0 for empty or non-string input', () => {
      expect(calculateSectionsScore('')).toBe(0);
      expect(calculateSectionsScore(null)).toBe(0);
    });
  });

  describe('calculateReadabilityScore', () => {
    it('returns high score for standard length, well-formed resume text', () => {
      const goodText = `
        Alex Morgan is a senior software engineer with over six years of experience building reliable applications.
        He has architected modern backend systems using Express and Node.js with high availability.
        His expertise includes designing clean REST APIs and database schema migrations in PostgreSQL.
        He collaborates closely with product managers and designers to deliver customer-focused features on schedule.
        Alex conducts regular code reviews and mentors junior engineers in testing practices and architectural patterns.
      `;

      const score = calculateReadabilityScore(goodText);
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('penalizes excessively short or sparse text', () => {
      const tooShort = 'Too short.';
      expect(calculateReadabilityScore(tooShort)).toBeLessThan(80);
    });

    it('returns 0 for empty text', () => {
      expect(calculateReadabilityScore('')).toBe(0);
    });
  });

  describe('calculateImpactScore', () => {
    it('gives high score when bullet lines contain numbers, percentages, and metrics', () => {
      const textWithMetrics = `
        - Scaled distributed database to serve 2.5M daily active users with 99.99% uptime.
        - Reduced query execution latency by 45% through Redis caching and index optimization.
        - Led a team of 8 engineers and increased deployment velocity by 3x across 4 microservices.
        - Cut cloud infrastructure costs by $120,000 annually by consolidating underutilized AWS EC2 instances.
      `;

      const score = calculateImpactScore(textWithMetrics);
      expect(score).toBe(100);
    });

    it('gives low score when bullet lines lack quantifiable metrics', () => {
      const textWithoutMetrics = `
        - Worked on web applications for company clients.
        - Wrote code and fixed bugs in existing repository.
        - Attended standup meetings and talked with stakeholders.
        - Maintained documentation and performed deployments.
      `;

      const score = calculateImpactScore(textWithoutMetrics);
      expect(score).toBe(0);
    });
  });

  describe('scoreResume (Deterministic Engine & Acceptance Criteria)', () => {
    const sampleResume = goldenPairs[0].resumeText;
    const sampleJd = goldenPairs[0].jobDescription;

    it('ENG-1: is strictly deterministic (same input produces identical score and breakdown)', () => {
      const run1 = scoreResume(sampleResume, sampleJd);
      const run2 = scoreResume(sampleResume, sampleJd);
      const run3 = scoreResume(sampleResume, sampleJd);

      expect(run1).toEqual(run2);
      expect(run2).toEqual(run3);
    });

    it('ENG-5: returns score strictly within the [0, 100] range', () => {
      for (const pair of goldenPairs) {
        const result = scoreResume(pair.resumeText, pair.jobDescription);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);

        expect(result.breakdown.keyword).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.keyword).toBeLessThanOrEqual(100);

        expect(result.breakdown.sections).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.sections).toBeLessThanOrEqual(100);

        expect(result.breakdown.readability).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.readability).toBeLessThanOrEqual(100);

        expect(result.breakdown.impact).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.impact).toBeLessThanOrEqual(100);
      }
    });

    it('ENG-6: breakdown components match overall composite score via the weighted formula', () => {
      const result = scoreResume(sampleResume, sampleJd);
      const { keyword, sections, readability, impact } = result.breakdown;

      const expectedWeighted = 0.6 * keyword + 0.2 * sections + 0.1 * readability + 0.1 * impact;

      // Check that final score equals the rounded weighted breakdown sum (±1 rounding tolerance)
      expect(Math.abs(result.score - Math.round(expectedWeighted))).toBeLessThanOrEqual(1);
    });

    describe('Golden File Fixture Tests (3 Pairs)', () => {
      it('scores Pair 1 (Full Stack Engineer - High Match) accurately', () => {
        const pair = goldenPairs[0];
        const result = scoreResume(pair.resumeText, pair.jobDescription);

        expect(result.score).toBeGreaterThanOrEqual(pair.expectedScoreMin);
        expect(result.score).toBeLessThanOrEqual(pair.expectedScoreMax);

        for (const skill of pair.expectedMatchedSkills) {
          expect(result.matched).toContain(skill);
        }
      });

      it('scores Pair 2 (Frontend Developer vs DevOps - Low Match) accurately', () => {
        const pair = goldenPairs[1];
        const result = scoreResume(pair.resumeText, pair.jobDescription);

        expect(result.score).toBeGreaterThanOrEqual(pair.expectedScoreMin);
        expect(result.score).toBeLessThanOrEqual(pair.expectedScoreMax);

        for (const skill of pair.expectedMissingSkills) {
          expect(result.missing).toContain(skill);
        }
      });

      it('scores Pair 3 (Data Scientist / ML Engineer - High Match) accurately', () => {
        const pair = goldenPairs[2];
        const result = scoreResume(pair.resumeText, pair.jobDescription);

        expect(result.score).toBeGreaterThanOrEqual(pair.expectedScoreMin);
        expect(result.score).toBeLessThanOrEqual(pair.expectedScoreMax);

        for (const skill of pair.expectedMatchedSkills) {
          expect(result.matched).toContain(skill);
        }
      });
    });
  });
});
