# SDD 05 — Security
## Threat model (STRIDE-lite)
| Threat | Mitigation |
|---|---|
| Credential stuffing/brute force | rate limit auth, bcrypt 12, generic error |
| Token theft via XSS | httpOnly+SameSite cookie, helmet CSP, React escaping, no dangerouslySetInnerHTML |
| CSRF | SameSite=Lax, JSON-only mutation, Origin header check middleware |
| Mass assignment | zod whitelist; never pass req.body to Mongoose |
| NoSQL injection | zod string types; reject objects in email/password; `express-mongo-sanitize`-equivalent via schema |
| Malicious upload | magic bytes, size/page caps, memory only, no execution, parse in try/catch with timeout |
| PDF bomb / DoS | 10 page cap, 5MB, parse timeout 10s |
| Prompt injection via resume/JD | untrusted-data delimiters, schema-constrained output, output validated, no tool use |
| Secret leakage | env validation, pino redaction, key in header, `.env` gitignored |
| IDOR | every query scoped by `userId`; foreign id → 404 |
| PII exposure | raw text not persisted or logged |

## Security acceptance (SEC-1..10)
1 helmet headers present · 2 cookie flags HttpOnly/SameSite(/Secure in prod) · 3 passwords never in responses/logs · 4 IDOR test passes · 5 rate limits enforced · 6 upload abuse tests pass · 7 `npm audit` no high/critical · 8 no secrets in git (gitleaks in CI) · 9 CORS rejects unknown origin · 10 injection test passes.

## Secrets rotation
If a key leaks: revoke in Google AI Studio / Atlas, rotate `JWT_SECRET` (invalidates sessions), purge from history.
