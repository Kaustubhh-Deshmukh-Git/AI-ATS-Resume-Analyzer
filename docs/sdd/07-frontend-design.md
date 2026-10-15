# SDD 07 — Frontend Design
## Routes
`/` landing · `/register` · `/login` · `/dashboard` (upload + JD + analyze) · `/analyses/:id` report · `/history` · `*` 404. Dashboard, history, report are protected.

## Component tree
App → AuthProvider → Router → Navbar, ProtectedRoute → pages. Components: `FileDropzone, JdTextarea, ScoreGauge, BreakdownBars, KeywordChips, AiSuggestions, BulletCompare, HistoryList, ErrorBanner, Spinner, ErrorBoundary`.

## State
AuthContext (user, loading, login, logout). Page-local state for forms. `useAnalysis` hook wraps parse→analyze with `idle|parsing|analyzing|done|error`.

## UX rules
Disable submit while pending · inline field errors · degraded-AI banner ("AI suggestions unavailable — score still valid") · skeleton while loading · copy buttons with aria-live confirmation · focus management on route change.

## Accessibility
Labels on every input, contrast ≥4.5:1, visible focus ring, gauge has text alternative, modal (if any) traps focus, Esc closes.

## API client
`src/api/http.js`: base `VITE_API_URL`, `credentials:"include"`, JSON, throws normalized `{code,message,details}`; on 401 clears auth state and routes to /login.
