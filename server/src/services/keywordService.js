import fs from 'node:fs';
import { AppError } from '../utils/AppError.js';
import { isStopword } from '../data/stopwords.js';
import {
  cleanText,
  normalizeKeyword,
  tokenize,
  generateNGrams,
} from '../utils/normalize.js';

// Load taxonomy once at module initialization (zero runtime I/O)
const skillsPath = new URL('../data/skills.json', import.meta.url);
const rawSkills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));

/**
 * Fast lookup map for skills taxonomy: canonical name -> skill object.
 * @type {Map<string, { name: string, category: string, type: 'hard'|'soft', weight: number }>}
 */
export const TAXONOMY_MAP = new Map();

for (const skill of rawSkills) {
  const canonical = normalizeKeyword(skill.name);
  TAXONOMY_MAP.set(canonical, {
    name: canonical,
    category: skill.category,
    type: skill.type,
    weight: skill.weight || (skill.type === 'hard' ? 2 : 1),
  });
}

/**
 * Extract matched taxonomy skills and domain n-grams from text.
 * Pure Set-based and Map-based extraction with zero I/O.
 *
 * @param {string} text
 * @returns {Map<string, { name: string, category: string, type: string, weight: number, count: number }>}
 */
export const extractKeywords = (text) => {
  const result = new Map();
  if (!text || typeof text !== 'string') return result;

  const cleaned = cleanText(text);
  const tokens = tokenize(cleaned);

  if (tokens.length === 0) return result;

  // Extract 3-grams, 2-grams, 1-grams matching taxonomy skills
  for (let n = 3; n >= 1; n--) {
    const ngrams = generateNGrams(tokens, n);

    for (const gram of ngrams) {
      const normalized = normalizeKeyword(gram);

      if (!normalized || isStopword(normalized)) continue;

      // Check if term exists in skills taxonomy
      if (TAXONOMY_MAP.has(normalized)) {
        const skill = TAXONOMY_MAP.get(normalized);
        if (!result.has(normalized)) {
          result.set(normalized, {
            name: normalized,
            category: skill.category,
            type: skill.type,
            weight: skill.weight,
            count: 1,
          });
        } else {
          result.get(normalized).count += 1;
        }
      }
    }
  }

  return result;
};

/**
 * Compare resume text against target job description keywords.
 * Computes weighted match score, matched keywords, and missing keywords.
 *
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{ matched: string[], missing: string[], keywordScore: number, totalJdWeight: number, matchedWeight: number }}
 */
export const compareKeywords = (resumeText, jdText) => {
  const jdKeywords = extractKeywords(jdText);

  // ENG-4: Empty JD keywords -> 400 VALIDATION_ERROR
  if (jdKeywords.size === 0) {
    throw new AppError(
      'Job description contains no extractable keywords. Please provide a more descriptive job posting.',
      400,
      'VALIDATION_ERROR',
      [{ path: 'jobDescription', message: 'No extractable keywords or skills found in job description' }]
    );
  }

  const resumeKeywords = extractKeywords(resumeText);

  const matched = [];
  const missing = [];
  let totalJdWeight = 0;
  let matchedWeight = 0;

  for (const [key, jdItem] of jdKeywords.entries()) {
    totalJdWeight += jdItem.weight;

    if (resumeKeywords.has(key)) {
      matched.push(key);
      matchedWeight += jdItem.weight;
    } else {
      missing.push(key);
    }
  }

  // Sort matched alphabetically
  matched.sort();

  // Sort missing by weight descending (prioritize missing hard skills), then alphabetically
  missing.sort((a, b) => {
    const weightA = jdKeywords.get(a)?.weight || 1;
    const weightB = jdKeywords.get(b)?.weight || 1;
    if (weightB !== weightA) return weightB - weightA;
    return a.localeCompare(b);
  });

  const rawScore = totalJdWeight > 0 ? (matchedWeight / totalJdWeight) * 100 : 0;
  const keywordScore = Math.min(100, Math.max(0, Math.round(rawScore * 100) / 100));

  return {
    matched,
    missing,
    keywordScore,
    totalJdWeight,
    matchedWeight,
  };
};

export default {
  TAXONOMY_MAP,
  extractKeywords,
  compareKeywords,
};
