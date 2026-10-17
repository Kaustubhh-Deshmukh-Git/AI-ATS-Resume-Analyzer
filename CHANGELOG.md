# Changelog
## [0.1.0] - 2026-10-15
### Added
- Milestone 0: Scaffolded server and client packages
- Express server with Helmet, CORS allowlist, cookie-parser, request ID, and pino logging with redaction
- Zod environment configuration fail-fast validation
- Standardized AppError and centralized error handler
- `/health` and `/api/v1/health` endpoints returning 200
- React 18+ and Vite client with React Router (Home, Login, Register, Dashboard)
- Standardized API fetch wrapper with credentials and error normalization
- Vitest and ESLint configurations for both server and client
- Package lockfiles passing `npm ci` and security audits
- Initial SDD, context and agent configuration

## [0.2.0] - 2026-10-15
### Added
- Milestone 1: Authentication & Session Management (AUTH-1..AUTH-6)
- User model with bcrypt password hashing (cost 12), lowercase unique email index, and strict hash stripping in `toJSON`
- Zod request validators for register and login requests
- `authService` handling user registration, constant-time failure responses for login, and JWT signing/verification
- Secure session handling via 1-hour `httpOnly` `SameSite=Lax` cookies (`secure` in production)
- Auth rate limiter (10 attempts / 15 minutes per IP) returning standard 429 `RATE_LIMITED` error shape
- Auth API endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`
- React `AuthContext` and `useAuth` hook verifying `/auth/me` on mount
- `ProtectedRoute` component guarding `/dashboard`
- Controlled `Login` and `Register` pages with client-side validation, live password criteria checklist, error alerts, and double-submit prevention
- Navigation header with dynamic user avatar badge and sign out action
- Vitest integration tests covering duplicate emails, weak passwords, cookie sessions, generic 401s, token expiry, and rate limiting

## [0.3.0] - 2026-10-15
### Added
- Milestone 2: Upload & Parse (UPL-1..UPL-6)
- Multer memory storage upload middleware with 5MB limit, single field `resume`, and PDF MIME/extension validation
- `pdfService` with `%PDF-` magic bytes verification, `pdfjs-dist` legacy text extraction, 10-page cap, whitespace normalization, and scanned/image-only PDF detection (<200 chars)
- `POST /api/v1/resumes/parse` endpoint returning `{ text, pages, charCount }`
- Defensive socket stream draining in auth and error middleware to prevent premature TCP connection resets on rejected uploads
- Reusable `FileDropzone` component featuring drag-and-drop, client-side size/type checks, parsing progress indicator, and error banners
- Dashboard integration displaying parsed resume summary and collapsible text preview
- Programmatic PDF test fixture generator creating good, scanned, 11-page, and non-PDF fixtures
- Vitest integration test suites in server and client covering all upload criteria UPL-1..UPL-6

## [0.4.0] - 2026-10-17
### Added
- Milestone 3: Deterministic ATS Engine (ENG-1..ENG-6)
- Pure normalization utility `normalize.js` with alias dictionary, technical token preservation (C++, C#, .NET, Node.js, CI/CD), and n-gram extraction (1–3)
- Curated `stopwords.js` Set for O(1) stopword filtering while safeguarding technical identifiers
- Curated `skills.json` taxonomy featuring 320 skills across languages, frontend, backend, databases, cloud/devops, data/AI, testing, architecture, and soft skills with weighted scoring
- `keywordService.js` pure module extracting taxonomy skills, calculating weighted keyword matches, and raising 400 VALIDATION_ERROR on empty JD keywords
- `scoreService.js` implementing the deterministic weighted scoring formula: `0.60 * keywordMatch + 0.20 * sections + 0.10 * readability + 0.10 * impact`
- 3 Golden file resume/JD test pairs calibrating expected scores and keywords
- Full unit test suites covering ENG-1 (determinism), ENG-2 (alias normalization), ENG-3 (stopword filtering), ENG-4 (empty JD rejection), ENG-5 (0–100 score bounds), and ENG-6 (breakdown sum equality)

## [0.5.0] - 2026-10-17
### Added
- Milestone 4: Gemini AI Integration & Persistence (AI-1..AI-6, API-1..API-8)
- `geminiService.js` calling `gemini-2.5-flash:generateContent` using secure `x-goog-api-key` header (never exposed in query string or logs)
- Structured JSON output enforcement via Gemini `responseMimeType: "application/json"` and strict `responseSchema`
- Robust prompt injection defense wrapping resume and JD in `<RESUME_UNTRUSTED_CONTENT>` and `<JD_UNTRUSTED_CONTENT>` XML blocks
- Resilient Gemini call handling with 20s `AbortController` timeout and exponential backoff retry mechanism on 429/5xx status codes
- Graceful degradation returning `aiStatus: "unavailable"` and `ai: null` while preserving deterministic ATS score on AI API errors
- `Analysis` Mongoose model storing privacy-preserving SHA-256 `resumeHash`, truncated `jdSnippet`, score, breakdown, matched/missing keywords, and optional AI suggestions
- Strict raw resume text exclusion from the database and response payloads to safeguard candidate privacy
- Analyses CRUD routes: `POST /api/v1/analyses`, `GET /api/v1/analyses` (paginated), `GET /api/v1/analyses/:id`, and `DELETE /api/v1/analyses/:id`
- IDOR defenses returning 404 `NOT_FOUND` on non-owner access or deletion attempts
- Vitest unit and integration test suites covering AI-1..AI-6 and API-1..API-8

## [0.6.0] - 2026-10-17
### Added
- Milestone 5: Frontend Product (UI-1..UI-8)
- `JdTextarea` component with accessible character count (50–10,000 chars), live boundary guidance, and input validation (UI-1)
- Interactive analysis submission with loading state, button disabling, and accessible loading spinner (UI-2)
- Centralized error banner presentation for upload, API, and validation errors (UI-3)
- `ScoreGauge` SVG circular score meter with animated stroke, color-coded tiers (Strong, Moderate, Needs Optimization), and accessible `role="meter"` semantics (UI-4)
- `BreakdownBars` visualizer for Keyword Match (60%), Section Structure (20%), Readability (10%), and Impact (10%)
- `KeywordChips` component with tabbed views for Matched (green) and Missing (amber/red) ATS taxonomy skills (UI-5)
- `BulletCompare` component with clipboard copy functionality (`navigator.clipboard.writeText`), visual "Copied!" confirmation, and screen reader live notification (UI-6)
- `AiSuggestions` section presenting AI-identified missing skills, tactical recommendations, and bullet point rewrites
- `DegradedAiBanner` informing candidates that deterministic scoring is fully intact when AI services are unavailable
- `History` view (`/history`) with paginated analysis cards, score badges, job description snippets, and delete action
- Accessible `ConfirmModal` dialog with focus trapping, Escape key dismiss, and focus restoration for report deletion (UI-7)
- Comprehensive keyboard accessibility, visible `:focus-visible` rings, ARIA labels, and responsive layout for screens down to 360px (UI-8)
- Modular `ErrorBoundary` catching and isolating runtime rendering crashes with graceful reload/retry actions
- Vitest and React Testing Library test suites in client covering UI-1 through UI-8 (29 tests passing)



