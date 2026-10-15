# SDD 08 — Test Plan
| Level | Tool | Scope | Target |
|---|---|---|---|
| Unit | Vitest | normalize, keyword, score, validators | ≥90% on engine |
| Integration | Supertest + mongodb-memory-server | all routes, auth, IDOR, upload | ≥80% server overall |
| Component | RTL | forms, results, history | critical paths |
| E2E smoke | Antigravity browser agent | register→login→upload→analyze→view→delete | per milestone |
| Security | npm audit, gitleaks, manual `/review-security` | | 0 high |
| Load | autocannon | POST /analyses (AI mocked) | p95<300ms @50rps |

## Fixtures (`server/tests/fixtures`)
`resume-good.pdf`, `resume-scanned.pdf`, `not-a-pdf.pdf`, `resume-11pages.pdf`, 3 golden resume/JD pairs with expected scores ±2.

## Mocking policy
Gemini always mocked in CI. One manual live test via `npm run test:live` (not in CI).
