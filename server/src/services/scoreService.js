import { compareKeywords } from './keywordService.js';
import { cleanText } from '../utils/normalize.js';

/**
 * Metric pattern matching numbers, percentages, dollar values, multipliers, and scales.
 */
const METRIC_PATTERN =
  /\b\d+(?:[.,]\d+)?%|\$\s*\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s*(?:k|m|b|x|million|billion|thousand|users|requests|percent)\b|\b\d+(?:[.,]\d+)?\b/i;

/**
 * Detect presence of the 5 core resume sections.
 * Returns a score between 0 and 100 (20 points per detected section).
 *
 * @param {string} text
 * @returns {number}
 */
export const calculateSectionsScore = (text) => {
  if (!text || typeof text !== 'string') return 0;

  const cleaned = cleanText(text);

  // 1. Contact Info: Email, phone, or LinkedIn/GitHub/website link
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleaned);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleaned);
  const hasLink = /(?:linkedin\.com|github\.com|gitlab\.com|portfolio|[a-z0-9-]+\.(?:com|org|io|dev|me))/i.test(cleaned);
  const hasContact = hasEmail || (hasPhone && hasLink);

  // 2. Summary / Objective
  const hasSummary =
    /(?:^|\n|\r)\s*(?:professional\s+)?(?:summary|profile|about\s+me|career\s+objective|objective|executive\s+summary)\b[:\s]*/i.test(
      cleaned
    );

  // 3. Education
  const hasEducation =
    /(?:^|\n|\r)\s*(?:education|academic\s+background|academics|academic\s+history|degrees?|qualifications?|university|bachelor|master|phd)\b[:\s]*/i.test(
      cleaned
    );

  // 4. Experience / Projects
  const hasExperience =
    /(?:^|\n|\r)\s*(?:work\s+experience|professional\s+experience|experience|employment(?:\s+history)?|projects|selected\s+projects|work\s+history)\b[:\s]*/i.test(
      cleaned
    );

  // 5. Skills
  const hasSkills =
    /(?:^|\n|\r)\s*(?:technical\s+skills|skills|core\s+competencies|technologies|tools\s+(&|and)\s+technologies|areas\s+of\s+expertise|key\s+skills)\b[:\s]*/i.test(
      cleaned
    );

  let detectedSectionsCount = 0;
  if (hasContact) detectedSectionsCount += 1;
  if (hasSummary) detectedSectionsCount += 1;
  if (hasEducation) detectedSectionsCount += 1;
  if (hasExperience) detectedSectionsCount += 1;
  if (hasSkills) detectedSectionsCount += 1;

  return detectedSectionsCount * 20;
};

/**
 * Calculate readability and formatting score (0–100) based on page length,
 * average sentence length, and special character ratio.
 *
 * @param {string} text
 * @returns {number}
 */
export const calculateReadabilityScore = (text) => {
  if (!text || typeof text !== 'string') return 0;

  const cleaned = cleanText(text);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) return 0;

  let score = 100;

  // 1. Length penalty (> 2-3 pages equivalent, or < 40 words)
  if (wordCount > 1800) {
    score -= 25; // Far too long (> 3.5 pages)
  } else if (wordCount > 1200) {
    score -= 15; // Slightly long (> 2 pages)
  } else if (wordCount < 40) {
    score -= 25; // Far too short
  }

  // 2. Average sentence length penalty
  const sentences = cleaned
    .split(/[.!?]+(?:\s+|\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  if (sentences.length > 0) {
    const totalWordsInSentences = sentences.reduce(
      (acc, s) => acc + s.split(/\s+/).filter(Boolean).length,
      0
    );
    const avgWordsPerSentence = totalWordsInSentences / sentences.length;

    // Ideal sentence length in resumes is 10–25 words
    if (avgWordsPerSentence > 40) {
      score -= 25;
    } else if (avgWordsPerSentence > 28) {
      score -= 15;
    } else if (avgWordsPerSentence < 5 && sentences.length > 5) {
      score -= 10;
    }
  }

  // 3. Special-character noise ratio penalty
  const nonAlphaNumCount = (cleaned.match(/[^a-zA-Z0-9\s.,;:()/\-–—•@+#$]/g) || []).length;
  const specialCharRatio = nonAlphaNumCount / cleaned.length;

  if (specialCharRatio > 0.08) {
    score -= 20;
  } else if (specialCharRatio > 0.04) {
    score -= 10;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate quantified impact score (0–100):
 * Percentage of bullet-like lines containing numbers, percentages, or measurable metrics.
 *
 * @param {string} text
 * @returns {number}
 */
export const calculateImpactScore = (text) => {
  if (!text || typeof text !== 'string') return 0;

  const cleaned = cleanText(text);
  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 12);

  if (lines.length === 0) return 0;

  // Identify bullet-like or achievement lines
  const bulletLines = lines.filter((l) => {
    const isBulletPrefix = /^[•\-*]|\d+\./.test(l);
    const isActionOriented =
      /^(?:developed|built|managed|led|created|designed|architected|implemented|reduced|increased|improved|saved|scaled|optimized|delivered|spearheaded|engineered|automated|orchestrated)\b/i.test(
        l
      );
    return isBulletPrefix || isActionOriented;
  });

  const candidateLines = bulletLines.length >= 3 ? bulletLines : lines;

  let metricCount = 0;
  for (const line of candidateLines) {
    if (METRIC_PATTERN.test(line)) {
      metricCount += 1;
    }
  }

  const rawImpact = (metricCount / candidateLines.length) * 100;
  return Math.min(100, Math.max(0, Math.round(rawImpact * 100) / 100));
};

/**
 * Score a resume against a target job description implementing the deterministic formula:
 * score = 0.60 * keywordMatch + 0.20 * sections + 0.10 * readability + 0.10 * impact
 *
 * @param {string} resumeText
 * @param {string} jobDescription
 * @returns {{ score: number, breakdown: { keyword: number, sections: number, readability: number, impact: number }, matched: string[], missing: string[] }}
 */
export const scoreResume = (resumeText, jobDescription) => {
  // 1. Keyword match (60% weight)
  const { matched, missing, keywordScore } = compareKeywords(resumeText, jobDescription);

  // 2. Section completeness (20% weight)
  const sectionsScore = calculateSectionsScore(resumeText);

  // 3. Readability & formatting (10% weight)
  const readabilityScore = calculateReadabilityScore(resumeText);

  // 4. Quantified impact metrics (10% weight)
  const impactScore = calculateImpactScore(resumeText);

  // Weighted composite score (0–100)
  const rawWeightedScore =
    0.6 * keywordScore + 0.2 * sectionsScore + 0.1 * readabilityScore + 0.1 * impactScore;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawWeightedScore)));

  return {
    score: finalScore,
    breakdown: {
      keyword: keywordScore,
      sections: sectionsScore,
      readability: readabilityScore,
      impact: impactScore,
    },
    matched,
    missing,
  };
};

export default {
  calculateSectionsScore,
  calculateReadabilityScore,
  calculateImpactScore,
  scoreResume,
};
