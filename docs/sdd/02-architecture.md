# SDD 02 — Architecture

## Context
```
Browser (React/Vite) ──HTTPS+cookie──▶ Express API ──▶ MongoDB Atlas
                                           └──HTTPS──▶ Gemini API
```

## Server layers
`routes → validators(zod) → controllers(thin) → services(business) → models(Mongoose)`; cross-cutting: `authMiddleware, rateLimit, errorHandler, requestId, logger(pino, redact)`.

## Flow: analyze
1. Client `POST /resumes/parse` (multipart) → text
2. Client `POST /analyses` `{ resumeText, jobDescription, title? }`
3. Server: normalize → keywordService → scoreService (deterministic)
4. Server: geminiService (timeout/retry) → validate → on fail `aiStatus=unavailable`
5. Persist Analysis → return report
(Alternative considered: single multipart call. Rejected: couples upload with analysis, harder retry.)

## Scoring engine (deterministic)
`score = 0.60*keywordMatch + 0.20*sections + 0.10*readability + 0.10*impact` (each 0–100)
- **keywordMatch** = matched weighted JD terms / total weighted JD terms. Hard skills weight 2, soft skills 1, other n-grams 1.
- **sections** = presence of Contact, Summary/Objective, Education, Experience/Projects, Skills (20 pts each).
- **readability** = penalties for >2 pages equivalent length, avg sentence length, special-char ratio.
- **impact** = % bullet-like lines containing a number/percentage/metric.

## ADRs
| # | Decision | Reason |
|---|---|---|
| 1 | httpOnly cookie, not localStorage | XSS cannot read token |
| 2 | Gemini JSON schema mode | removes fragile regex stripping |
| 3 | Deterministic score separate from AI | explainable, testable, works offline |
| 4 | memoryStorage upload | no disk persistence of PII |
| 5 | Persist extracted text? **No** — store hash + metadata + results only | privacy; re-analysis requires re-upload |

## Dependencies (approved list)
server: express, mongoose, zod, bcryptjs, jsonwebtoken, cookie-parser, helmet, cors, express-rate-limit, multer, pdfjs-dist, pino, pino-http, dotenv · dev: vitest, supertest, mongodb-memory-server, eslint, prettier, nodemon, autocannon.
client: react, react-dom, react-router-dom · dev: vite, vitest, @testing-library/react, jsdom, eslint.
