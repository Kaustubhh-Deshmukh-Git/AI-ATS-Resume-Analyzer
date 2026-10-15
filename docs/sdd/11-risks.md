# SDD 11 — Risks
| Risk | L | I | Mitigation |
|---|---|---|---|
| Gemini quota/latency | M | M | timeout, retry, degraded mode, rate limit |
| PDF parsing variance (columns, tables) | H | M | normalize, tests with varied PDFs, clear 422 messages |
| Keyword scoring seen as "fake accuracy" | M | M | show breakdown, label as estimate, disclaimer in UI |
| PII leak | L | H | no raw text persisted/logged |
| Key leak | M | H | env validation, gitleaks, rotation runbook |
| Scope creep | H | M | non-goals list, milestone gates |
| Free-tier cold starts (Render) | H | L | health pings, UI loading copy |
