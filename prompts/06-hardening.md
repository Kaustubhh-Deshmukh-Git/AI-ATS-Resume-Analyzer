# Milestone 6 — Hardening (scope: whole repo)
Run `/review-security` workflow. Then: npm audit fix (no major bumps without approval), add request-id logging, Mongo indexes verified, graceful shutdown, 404 + error JSON shape consistent, CORS tested, cookie flags tested, load test POST /analyses with mocked Gemini (autocannon, 50 rps for 30s, p95 < 300ms excluding AI). Raise server coverage to ≥80%.
DoD: SEC-1..SEC-10 pass; zero high/critical audit findings.
