# CONTEXT.md — Resume ATS Analyzer (ResumeIQ)

> Single source of truth for every human and AI agent working in this repo. Read this FIRST, then `ANTIGRAVITY.md`, then the relevant `docs/sdd/*` file.

## 1. What this is
Full-stack web app. A user registers, logs in, uploads a PDF resume, pastes a target job description, and receives:
1. An **ATS compatibility score** (0–100, weighted, explainable)
2. **Matched / missing keywords**
3. **AI suggestions from Gemini** (missing skills, optimization tips, rewritten bullets)
4. A saved **history** of past analyses

## 2. Stack (locked — do not swap without an ADR in `docs/sdd/02-architecture.md`)
| Layer | Choice |
|---|---|
| Client | React 18 + Vite, React Router, plain CSS modules |
| Server | Node 20, Express 4, ES modules |
| DB | MongoDB Atlas via Mongoose |
| Auth | bcryptjs + JWT in **httpOnly cookie** |
| Validation | zod (every request body/query) |
| Upload | multer memoryStorage (PDF only, 5 MB) |
| PDF parse | pdfjs-dist (legacy build) |
| AI | Gemini REST (`gemini-2.5-flash`) with JSON response schema |
| Security | helmet, cors (allowlist), express-rate-limit |
| Tests | Vitest + Supertest + mongodb-memory-server (server), Vitest + RTL (client) |
| CI | GitHub Actions: lint → test → build |

## 3. Repo layout
```
resume-ats-analyzer/
├── CONTEXT.md  ANTIGRAVITY.md  AGENTS.md  PROMPT.md  README.md
├── .agent/{rules,workflows}/      # Antigravity workspace config
├── docs/sdd/                      # Software Design Document (00–11)
├── prompts/                       # one prompt per milestone
├── server/  (src/{config,models,routes,controllers,services,middleware,utils,validators}, tests/)
└── client/  (src/{api,components,pages,hooks,context,styles}, tests/)
```

## 4. Non-negotiable rules
1. **Never** store or compare plaintext passwords. bcrypt, cost 12.
2. **Never** return password hashes or raw resume text in list endpoints.
3. **Never** log resume text, JD text, tokens, or Gemini keys.
4. Every route validated with zod; every error goes through the central error handler.
5. Gemini API key lives only in `server/.env`. Client never sees it.
6. Controllers are thin. Logic lives in `services/` and is unit tested.
7. No `any`-style shortcuts: no unvalidated `req.body` passed to Mongoose (the tutorial's `User.create(req.body)` is banned — mass assignment).
8. Every milestone ends with: tests green, lint clean, docs updated, CHANGELOG entry.

## 5. Known tutorial flaws we are fixing on purpose
| Tutorial does | We do |
|---|---|
| Plaintext password compare | bcrypt hash + compare |
| `register` returns whole user doc | Returns `{id,name,email}` only |
| JWT has no expiry, stored in localStorage | 1h expiry, httpOnly SameSite cookie |
| Hardcoded job description | JD textarea, validated 50–10,000 chars |
| Regex `[a-z]{3,}` keywords (drops `c++`, `node.js`, keeps "the") | Stopwords + skills taxonomy + alias normalization |
| `includes()` on arrays (O(n²)) | `Set` lookups |
| Resume model never written | Persist analysis per user |
| Strip ```json by regex | Gemini `responseMimeType: application/json` + `responseSchema` + zod-validate output |
| No file validation | MIME + magic bytes (`%PDF`) + size + page cap |
| Scanned PDFs return empty text silently | Detect and return 422 with clear message |

## 6. Environment variables
See `server/.env.example` and `client/.env.example`. Required server: `MONGODB_URI, JWT_SECRET (≥32 chars), GEMINI_API_KEY, CLIENT_ORIGIN, NODE_ENV, PORT`.

## 7. Definition of Done (global)
- [ ] Acceptance criteria in `docs/sdd/01-requirements.md` for the milestone pass
- [ ] `npm run lint && npm test` green in both packages
- [ ] OpenAPI (`docs/sdd/openapi.yaml`) matches implementation
- [ ] No secrets in git history
- [ ] CHANGELOG updated

## 8. Where to look
Requirements → `01` · Architecture → `02` · Data → `03` · API → `04` + `openapi.yaml` · Security → `05` · AI prompt → `06` · UI → `07` · Tests → `08` · Deploy → `09` · Timeline → `10` · Risks → `11`
