import { describe, it, expect } from 'vitest';
import { extractKeywords, compareKeywords, TAXONOMY_MAP } from '../src/services/keywordService.js';
import { isStopword } from '../src/data/stopwords.js';

describe('Keyword Service (Taxonomy & Extraction)', () => {
  describe('Taxonomy initialization', () => {
    it('loads more than 300 skills in taxonomy with categories and weights', () => {
      expect(TAXONOMY_MAP.size).toBeGreaterThanOrEqual(300);

      const jsSkill = TAXONOMY_MAP.get('javascript');
      expect(jsSkill).toBeDefined();
      expect(jsSkill.weight).toBe(2); // Hard skill
      expect(jsSkill.type).toBe('hard');

      const leadershipSkill = TAXONOMY_MAP.get('leadership');
      expect(leadershipSkill).toBeDefined();
      expect(leadershipSkill.weight).toBe(1); // Soft skill
      expect(leadershipSkill.type).toBe('soft');
    });
  });

  describe('extractKeywords', () => {
    it('ENG-3: never counts stopwords as keywords', () => {
      const text = 'The quick brown fox is with and from by at in on for a';
      const extracted = extractKeywords(text);

      for (const [key] of extracted.entries()) {
        expect(isStopword(key)).toBe(false);
      }
      expect(extracted.has('the')).toBe(false);
      expect(extracted.has('with')).toBe(false);
      expect(extracted.has('for')).toBe(false);
    });

    it('extracts multi-word taxonomy skills correctly', () => {
      const text = 'Strong experience in Machine Learning, Deep Learning, and Test Driven Development.';
      const extracted = extractKeywords(text);

      expect(extracted.has('machine learning')).toBe(true);
      expect(extracted.has('deep learning')).toBe(true);
      expect(extracted.has('tdd')).toBe(true); // Normalized from test driven development
    });

    it('extracts skills preserving special characters like C++, C#, .NET, CI/CD', () => {
      const text = 'Proficient with C++, C#, .NET, and CI/CD pipelines.';
      const extracted = extractKeywords(text);

      expect(extracted.has('c++')).toBe(true);
      expect(extracted.has('c#')).toBe(true);
      expect(extracted.has('.net')).toBe(true);
      expect(extracted.has('ci/cd')).toBe(true);
    });

    it('handles empty or non-string input safely', () => {
      expect(extractKeywords('').size).toBe(0);
      expect(extractKeywords(null).size).toBe(0);
      expect(extractKeywords(123).size).toBe(0);
    });
  });

  describe('compareKeywords', () => {
    it('ENG-4: throws 400 VALIDATION_ERROR when job description contains no extractable keywords', () => {
      const resume = 'Experienced Software Engineer with React and Node.js';
      const emptyJd = '... ??? !!!';

      expect(() => compareKeywords(resume, emptyJd)).toThrowError(
        /Job description contains no extractable keywords/i
      );
    });

    it('returns 100% keyword score when all JD skills match in resume', () => {
      const jd = 'Looking for an engineer proficient in Python, Docker, and AWS.';
      const resume = 'Experienced in Python, AWS cloud, and Docker containers.';

      const result = compareKeywords(resume, jd);

      expect(result.keywordScore).toBe(100);
      expect(result.missing).toEqual([]);
      expect(result.matched).toContain('python');
      expect(result.matched).toContain('aws');
      expect(result.matched).toContain('docker');
    });

    it('correctly calculates weighted match score prioritizing hard skills (weight 2)', () => {
      // JD has 1 hard skill (TypeScript: wt 2) and 1 soft skill (Communication: wt 1). Total weight = 3.
      const jd = 'Requires TypeScript and strong communication.';
      // Resume matches only TypeScript (wt 2)
      const resumeOnlyHard = 'Senior developer with TypeScript experience.';

      const result = compareKeywords(resumeOnlyHard, jd);
      // Matched: 2 / 3 = 66.67%
      expect(result.keywordScore).toBeCloseTo(66.67, 1);
      expect(result.matched).toEqual(['typescript']);
      expect(result.missing).toEqual(['communication']);
    });

    it('returns 0% when no skills match', () => {
      const jd = 'Looking for Python and Django.';
      const resume = 'Experienced Java and Spring Boot developer.';

      const result = compareKeywords(resume, jd);
      expect(result.keywordScore).toBe(0);
      expect(result.matched).toEqual([]);
      expect(result.missing).toContain('python');
      expect(result.missing).toContain('django');
    });
  });
});
