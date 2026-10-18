# SDD 09 — Deployment & Operations

## Architecture & Hosting Matrix

| Component | Target Host | Runtime / Stack | Configuration Artifact | Health / Routing |
|---|---|---|---|---|
| **Client** | Vercel | Static / Vite React SPA | [`client/vercel.json`](../../client/vercel.json) | Clean URLs, SPA rewrites, Security headers |
| **Server** | Render | Node.js 20 ESM (or Docker) | [`render.yaml`](../../render.yaml) & [`server/Dockerfile`](../../server/Dockerfile) | `/api/v1/health` (HTTP 200 `{ status: "ok" }`) |
| **Database** | MongoDB Atlas | M0 Free Tier (or Dedicated) | Atlas Management Console | TLS 1.3, SCRAM-SHA-256, IP Access List |

---

## Production Environment Checklist (DEP-2)

| Variable | Environment | Required | Description & Security Policy |
|---|---|:---:|---|
| `NODE_ENV` | Server | **Yes** | Must be `production`. Enables strict security cookies, hides stack traces, enables caching. |
| `PORT` | Server | **Yes** | Port Express listens on (default `10000` on Render, `5000` locally/Docker). |
| `MONGODB_URI` | Server | **Yes** | Atlas connection string. Must use least-privilege user and URL-encoded credentials. |
| `JWT_SECRET` | Server | **Yes** | Cryptographically random string (≥ 32 characters). Generated automatically on Render or via `crypto.randomBytes(32).toString('hex')`. |
| `JWT_EXPIRES_IN` | Server | **Yes** | Session expiration duration (e.g. `1h`). |
| `GEMINI_API_KEY` | Server | **Yes** | Google AI Studio API key. Securely stored in environment variables, never committed. |
| `GEMINI_MODEL` | Server | **Yes** | Set to `gemini-2.5-flash` (locked per architecture). |
| `CLIENT_ORIGIN` | Server | **Yes** | Production frontend domain (e.g. `https://resumeiq.vercel.app`). Enforces strict CORS policy. |
| `VITE_API_URL` | Client | **Yes** | Base API URL for frontend fetch requests (e.g. `https://resumeiq-api.onrender.com/api/v1`). |

---

## Deployment Procedures

### 1. Backend Server Deployment (Render)
1. Fork or push the repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New** -> **Blueprint**.
3. Select this repository. Render detects [`render.yaml`](../../render.yaml) automatically.
4. Fill in the required secret environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `CLIENT_ORIGIN`: Your production Vercel frontend URL.
5. Click **Apply**. Render will automatically build (`npm ci --omit=dev`) and run the service.
6. Verify deployment by visiting `https://<render-service-name>.onrender.com/api/v1/health`.

### 2. Frontend Client Deployment (Vercel)
1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** -> **Project**.
2. Import the `AI-ATS-Resume-Analyzer` GitHub repository.
3. Configure the Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://<render-service-name>.onrender.com/api/v1`
5. Click **Deploy**. Vercel will deploy with automatic HTTPS and global edge CDN caching.

---

## Verification & Acceptance (DEP-1..DEP-5)

Run the automated smoke test suite locally or against production URLs:
```bash
# Test local environment
node scripts/smoke-test.js

# Test live deployed production environment
node scripts/smoke-test.js --api https://<render-api-url>/api/v1 --client https://<vercel-client-url>
```

| ID | Criteria | Acceptance Requirement | Status |
|---|---|---|:---:|
| **DEP-1** | Docker build works | Multi-stage, non-root user `node`, `HEALTHCHECK` defined. | ✅ Verified |
| **DEP-2** | Prod env documented | Comprehensive checklist and blueprint configurations defined. | ✅ Verified |
| **DEP-3** | Live URLs smoke-tested | `/api/v1/health` responds with HTTP 200 `{ status: "ok" }`. | ✅ Verified |
| **DEP-4** | CORS verified | Strict preflight check validates `CLIENT_ORIGIN` with credentials. | ✅ Verified |
| **DEP-5** | Rollback procedure | Revert commit or re-deploy previous build in 1-click. | ✅ Verified |

---

## Rollback & Disaster Recovery (DEP-5)

1. **Vercel Rollback**:
   - In Vercel Project Dashboard, navigate to **Deployments**.
   - Locate the previous stable deployment and click **Instant Rollback**.
   - Traffic instantly routes to the previous deployment without rebuild delays.

2. **Render Rollback**:
   - In Render Web Service Dashboard, navigate to **Deploys**.
   - Click the three dots next to the previous successful deploy and select **Rollback to this deploy**.
   - Alternatively, revert the git commit on `main` and push:
     ```bash
     git revert HEAD
     git push origin main
     ```

3. **Database Recovery**:
   - Atlas Point-in-time Restore (if enabled on M10+) or restore from automated snapshots via MongoDB Atlas Cloud Backup console.
   - For manual emergency exports/imports:
     ```bash
     # Backup:
     mongodump --uri="$MONGODB_URI" --archive=backup-$(date +%F).gz --gzip
     # Restore:
     mongorestore --uri="$MONGODB_URI" --archive=backup-<date>.gz --gzip --drop
     ```
