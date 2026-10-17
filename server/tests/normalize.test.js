import { describe, it, expect } from 'vitest';
import {
  cleanText,
  normalizeKeyword,
  tokenize,
  generateNGrams,
} from '../src/utils/normalize.js';

describe('Normalize and Tokenization Utilities', () => {
  describe('cleanText', () => {
    it('normalizes smart quotes, dashes, tabs, and bullets', () => {
      const input = '“Smart quotes” and ‘single’ with — em-dash and • bullet \t test\r\nline';
      const output = cleanText(input);

      expect(output).toContain('"Smart quotes"');
      expect(output).toContain("'single'");
      expect(output).toContain('-');
      expect(output).toContain('•');
      expect(output).not.toContain('\r');
    });

    it('handles empty, null, or non-string input safely', () => {
      expect(cleanText('')).toBe('');
      expect(cleanText(null)).toBe('');
      expect(cleanText(undefined)).toBe('');
      expect(cleanText(123)).toBe('');
    });
  });

  describe('normalizeKeyword & Aliases', () => {
    it('ENG-2: normalizes aliases correctly (nodejs = node.js = node)', () => {
      expect(normalizeKeyword('nodejs')).toBe('node.js');
      expect(normalizeKeyword('node.js')).toBe('node.js');
      expect(normalizeKeyword('node')).toBe('node.js');
      expect(normalizeKeyword('Node.JS')).toBe('node.js');
      expect(normalizeKeyword('  NODEJS  ')).toBe('node.js');
    });

    it('normalizes react aliases (reactjs, react.js -> react)', () => {
      expect(normalizeKeyword('reactjs')).toBe('react');
      expect(normalizeKeyword('react.js')).toBe('react');
      expect(normalizeKeyword('React')).toBe('react');
    });

    it('preserves C++, C#, .NET without mangling symbols', () => {
      expect(normalizeKeyword('c++')).toBe('c++');
      expect(normalizeKeyword('C++')).toBe('c++');
      expect(normalizeKeyword('cpp')).toBe('c++');
      expect(normalizeKeyword('c#')).toBe('c#');
      expect(normalizeKeyword('C#')).toBe('c#');
      expect(normalizeKeyword('.net')).toBe('.net');
      expect(normalizeKeyword('dotnet')).toBe('.net');
    });

    it('preserves CI/CD and cloud abbreviations', () => {
      expect(normalizeKeyword('ci/cd')).toBe('ci/cd');
      expect(normalizeKeyword('cicd')).toBe('ci/cd');
      expect(normalizeKeyword('aws')).toBe('aws');
      expect(normalizeKeyword('amazon web services')).toBe('aws');
      expect(normalizeKeyword('k8s')).toBe('kubernetes');
    });

    it('strips unnecessary surrounding punctuation while preserving valid characters', () => {
      expect(normalizeKeyword('(c++)')).toBe('c++');
      expect(normalizeKeyword('"react"')).toBe('react');
      expect(normalizeKeyword('typescript,')).toBe('typescript');
    });

    it('handles empty or non-string input', () => {
      expect(normalizeKeyword('')).toBe('');
      expect(normalizeKeyword(null)).toBe('');
      expect(normalizeKeyword(123)).toBe('');
    });
  });

  describe('tokenize', () => {
    it('preserves special tech tokens (C++, C#, .NET, Node.js, CI/CD, REST APIs)', () => {
      const text = 'Senior Engineer with C++, C#, .NET, Node.js, and CI/CD building REST APIs.';
      const tokens = tokenize(text);

      expect(tokens).toContain('c++');
      expect(tokens).toContain('c#');
      expect(tokens).toContain('.net');
      expect(tokens).toContain('node.js');
      expect(tokens).toContain('ci/cd');
      expect(tokens).toContain('rest');
    });

    it('returns empty array on empty input', () => {
      expect(tokenize('')).toEqual([]);
      expect(tokenize(null)).toEqual([]);
    });
  });

  describe('generateNGrams', () => {
    it('generates correct 1-grams, 2-grams, and 3-grams', () => {
      const tokens = ['machine', 'learning', 'engineer', 'role'];

      const oneGrams = generateNGrams(tokens, 1);
      expect(oneGrams).toEqual(['machine', 'learning', 'engineer', 'role']);

      const twoGrams = generateNGrams(tokens, 2);
      expect(twoGrams).toEqual([
        'machine learning',
        'learning engineer',
        'engineer role',
      ]);

      const threeGrams = generateNGrams(tokens, 3);
      expect(threeGrams).toEqual([
        'machine learning engineer',
        'learning engineer role',
      ]);
    });

    it('returns empty array when n exceeds token length or invalid args', () => {
      expect(generateNGrams(['a'], 2)).toEqual([]);
      expect(generateNGrams([], 1)).toEqual([]);
      expect(generateNGrams(null, 1)).toEqual([]);
      expect(generateNGrams(['a', 'b'], 0)).toEqual([]);
    });
  });
});
