# /review-security
Audit the repo against docs/sdd/05-security.md SEC-1..10. Check: helmet, cookie flags, rate limits, IDOR on every :id route, upload validation, zod on every route, no secrets/PII in logs, `npm audit`, CORS allowlist, prompt-injection test. Output a table PASS/FAIL with file:line evidence and fix every FAIL.
