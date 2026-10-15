# SDD 09 — Deployment & Ops
| Component | Host | Notes |
|---|---|---|
| Client | Vercel | `VITE_API_URL` env |
| Server | Render (or Railway) | Node 20, health check `/health` |
| DB | MongoDB Atlas M0 | IP allowlist, least-privilege user |

## Prod env checklist
`NODE_ENV=production`, `JWT_SECRET` ≥32 random bytes, `CLIENT_ORIGIN=https://<vercel-domain>`, cookies `Secure` + `SameSite=None` if client/server on different sites (prefer same parent domain + Lax).
## CI/CD
PR: lint → test → build → gitleaks. Main: deploy hooks. Tag `vX.Y.Z` via `/release` workflow.
## Observability
pino JSON logs with requestId; uptime monitor on /health; alert on 5xx rate.
## Backup
Atlas snapshots (paid) or weekly `mongodump` — v1 accepts M0 risk.
## DEP acceptance
1 Docker build works · 2 prod env documented · 3 live URLs smoke-tested · 4 CORS verified from prod client · 5 rollback = redeploy previous commit.
