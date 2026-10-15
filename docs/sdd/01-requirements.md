# SDD 01 — Requirements (SRS)

## Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Register with name, email, password | Must |
| FR-2 | Login/logout; session via httpOnly cookie | Must |
| FR-3 | Upload PDF ≤5MB, ≤10 pages, extract text | Must |
| FR-4 | Paste JD (50–10,000 chars) | Must |
| FR-5 | Compute weighted ATS score + matched/missing keywords | Must |
| FR-6 | Gemini suggestions with strict schema | Must |
| FR-7 | Persist analyses per user; list, view, delete | Must |
| FR-8 | Degraded mode if Gemini fails | Must |
| FR-9 | Copy-to-clipboard for rewritten bullets | Should |
| FR-10 | Export report as PDF | Could |

## Non-functional requirements
| ID | Requirement |
|---|---|
| NFR-1 | Passwords bcrypt cost 12; JWT 1h expiry |
| NFR-2 | All inputs zod-validated; max JSON body 100kb |
| NFR-3 | p95 API latency < 300ms excluding AI call |
| NFR-4 | WCAG 2.1 AA basics, responsive ≥360px |
| NFR-5 | No PII (resume/JD text) in logs |
| NFR-6 | Runs from clean clone: `npm ci && npm run dev` |

## Acceptance criteria
**AUTH:** 1 register creates user, response has no hash · 2 duplicate email → 409 · 3 weak password (<8, no number) → 400 · 4 login sets httpOnly cookie · 5 wrong creds → 401 same message for unknown email and bad password · 6 expired/invalid token → 401.
**UPL:** 1 valid text PDF returns text · 2 non-PDF content → 400 · 3 >5MB → 413 · 4 scanned PDF → 422 · 5 >10 pages → 422 · 6 unauthenticated → 401.
**ENG:** 1 deterministic: same input → same score · 2 aliases normalize (nodejs = node.js) · 3 stopwords never counted · 4 empty JD keywords → 400 · 5 score in 0–100 · 6 breakdown sums to score.
**AI:** 1 output matches schema · 2 timeout → degraded · 3 429 retried ≤2 · 4 malformed JSON → degraded · 5 injection text ignored · 6 key never in logs/responses.
**API:** 1 list excludes raw text · 2 get by non-owner → 404 · 3 delete removes · 4 pagination works · 5 rate limit → 429 · 6 consistent error shape · 7 CORS only allowlist · 8 /health 200.
**UI:** 1 JD counter · 2 disabled while loading · 3 errors visible · 4 score gauge · 5 chips · 6 copy bullet · 7 history delete · 8 keyboard operable.
**SEC / DEP:** see 05 and 09.
