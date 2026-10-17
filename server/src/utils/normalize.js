/**
 * Canonical alias map for technologies, frameworks, and skills.
 * Maps known variations, abbreviations, and informal names to a canonical standard name.
 */
export const ALIAS_MAP = {
  // Node.js variants -> node.js (or node)
  nodejs: 'node.js',
  'node.js': 'node.js',
  node: 'node.js',
  'node js': 'node.js',

  // React variants
  reactjs: 'react',
  'react.js': 'react',
  react: 'react',
  'react js': 'react',
  'react native': 'react native',
  reactnative: 'react native',

  // Vue variants
  vuejs: 'vue',
  'vue.js': 'vue',
  vue: 'vue',
  'vue js': 'vue',

  // Angular variants
  angularjs: 'angular',
  'angular.js': 'angular',
  angular: 'angular',
  'angular 2+': 'angular',

  // Next.js variants
  nextjs: 'next.js',
  'next.js': 'next.js',
  'next js': 'next.js',

  // Nuxt.js variants
  nuxtjs: 'nuxt.js',
  'nuxt.js': 'nuxt.js',
  'nuxt js': 'nuxt.js',

  // Express variants
  expressjs: 'express',
  'express.js': 'express',
  express: 'express',

  // C / C++ / C#
  'c++': 'c++',
  cpp: 'c++',
  'c#': 'c#',
  csharp: 'c#',
  c: 'c',

  // .NET variants
  '.net': '.net',
  dotnet: '.net',
  '.net core': '.net core',
  'dotnet core': '.net core',
  'asp.net': 'asp.net',
  aspnet: 'asp.net',

  // JavaScript / TypeScript
  js: 'javascript',
  javascript: 'javascript',
  es6: 'javascript',
  ecmascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',

  // Python
  python: 'python',
  py: 'python',
  python3: 'python',

  // Golang
  golang: 'go',
  go: 'go',

  // Databases
  postgres: 'postgresql',
  postgresql: 'postgresql',
  psql: 'postgresql',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  ms_sql: 'sql server',
  mssql: 'sql server',
  'sql server': 'sql server',

  // Cloud & DevOps
  aws: 'aws',
  'amazon web services': 'aws',
  gcp: 'gcp',
  'google cloud': 'gcp',
  'google cloud platform': 'gcp',
  azure: 'azure',
  'microsoft azure': 'azure',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  cicd: 'ci/cd',
  'ci/cd': 'ci/cd',
  'ci-cd': 'ci/cd',
  'continuous integration': 'ci/cd',
  'continuous deployment': 'ci/cd',

  // APIs & Architectures
  rest: 'rest api',
  restful: 'rest api',
  'rest api': 'rest api',
  'rest apis': 'rest api',
  'restful api': 'rest api',
  'restful apis': 'rest api',
  graphql: 'graphql',

  // Testing
  tdd: 'tdd',
  'test driven development': 'tdd',
  'unit testing': 'unit testing',
  'integration testing': 'integration testing',

  // Methodologies
  oop: 'oop',
  'object oriented programming': 'oop',
  'object-oriented programming': 'oop',
  agile: 'agile',
  scrum: 'scrum',
  kanban: 'kanban',
};

/**
 * Regex matching technical words, hyphenated phrases, and symbols like C++, C#, .NET, Node.js, CI/CD.
 */
export const TOKEN_REGEX =
  /[a-zA-Z0-9]+(?:[+#]+|\.[a-zA-Z0-9]+|\/[a-zA-Z0-9]+)*(?:-[a-zA-Z0-9]+)*|\.net/g;

/**
 * Clean and standardize raw text by normalizing unicode characters, quotes, and whitespace.
 *
 * @param {string} text
 * @returns {string}
 */
export const cleanText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // En-dash & em-dash
    .replace(/[\u2022\u25E6\u2043\u2219]/g, ' • ') // Bullets
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .trim();
};

/**
 * Normalize an individual keyword or skill phrase:
 * 1. Convert to lowercase and trim.
 * 2. Strip surrounding punctuation while keeping internal technical symbols.
 * 3. Consult canonical alias map.
 *
 * @param {string} term
 * @returns {string}
 */
export const normalizeKeyword = (term) => {
  if (!term || typeof term !== 'string') return '';

  let normalized = term.trim().toLowerCase();

  // Strip leading/trailing punctuation except + or # or . at ends for c++, c#, .net
  normalized = normalized
    .replace(/^[^a-z0-9.+]+/, '')
    .replace(/[^a-z0-9+#]+$/, '');

  // Look up in alias map
  if (ALIAS_MAP[normalized]) {
    return ALIAS_MAP[normalized];
  }

  return normalized;
};

/**
 * Tokenize a text document into an array of lowercase tokens preserving technical symbols.
 *
 * @param {string} text
 * @returns {string[]}
 */
export const tokenize = (text) => {
  if (!text || typeof text !== 'string') return [];

  const cleaned = cleanText(text).toLowerCase();
  const matches = cleaned.match(TOKEN_REGEX);

  return matches ? matches.map((m) => m.trim()).filter(Boolean) : [];
};

/**
 * Generate contiguous n-grams from an array of tokens.
 *
 * @param {string[]} tokens
 * @param {number} n
 * @returns {string[]}
 */
export const generateNGrams = (tokens, n) => {
  if (!Array.isArray(tokens) || n < 1 || tokens.length < n) return [];

  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ');
    ngrams.push(gram);
  }

  return ngrams;
};

export default {
  ALIAS_MAP,
  TOKEN_REGEX,
  cleanText,
  normalizeKeyword,
  tokenize,
  generateNGrams,
};
