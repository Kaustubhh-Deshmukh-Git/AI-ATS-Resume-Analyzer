# Milestone 0 — Scaffold (scope: whole repo, config only)
Read CONTEXT.md and docs/sdd/02-architecture.md.
Build:
- `server/`: package.json (type: module, scripts: dev, start, lint, test), ESLint + Prettier, `src/app.js` (express app, helmet, cors allowlist from CLIENT_ORIGIN, json limit 100kb, cookie-parser, `/health`), `src/server.js` (connect Mongo then listen), `src/config/env.js` (zod-validated env, fail fast), central `middleware/errorHandler.js` + `utils/AppError.js`, pino logger with redaction.
- `client/`: Vite React app, router with Home/Login/Register/Dashboard placeholders, `src/api/http.js` fetch wrapper (credentials include, JSON, error normalization).
- Vitest configured in both. One passing test each (`/health`, App renders).
- `.github/workflows/ci.yml` already exists — make it pass.
DoD: `npm ci && npm run lint && npm test && npm run build` pass in both packages; `GET /health` returns 200.
