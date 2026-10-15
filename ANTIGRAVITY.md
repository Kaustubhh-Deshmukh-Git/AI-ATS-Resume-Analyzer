# ANTIGRAVITY.md — How to run this project in Google Antigravity

## 1. One-time setup
1. Install Antigravity, sign in, open this folder as the workspace.
2. Confirm Node 20+ (`node -v`), Git, and a MongoDB Atlas cluster (free M0) with a DB user and your IP allowlisted.
3. Create `server/.env` from `server/.env.example`. Add your `GEMINI_API_KEY` from Google AI Studio.
4. Antigravity picks up workspace config from `.agent/` (rules + workflows). If your build looks for `.agents/` instead, rename the folder — contents are identical. Also keep `AGENTS.md` at root as a cross-tool fallback.
5. Settings I recommend: **Review-driven** development mode, terminal policy = **Request review** (not Always proceed), so the agent can't run destructive commands unattended.

## 2. Agent roles (use the Agent Manager, one agent per workspace task)
| Agent | Scope | Allowed paths |
|---|---|---|
| Backend | models, routes, services, middleware | `server/**` |
| Frontend | pages, components, API client | `client/**` |
| QA | tests, CI, lint | `**/tests/**`, `.github/**` |
| Docs | SDD, OpenAPI, CHANGELOG | `docs/**`, `*.md` |
Never let two agents edit the same file concurrently. Backend and Frontend run in parallel only after `openapi.yaml` is frozen for that milestone.

## 3. Execution loop (every milestone)
1. Open `prompts/0X-*.md`, paste into the Agent Manager.
2. Agent must first produce an **Implementation Plan artifact**. Reject the plan if it touches files outside its scope or skips tests.
3. Approve → agent codes → agent runs `npm test` and `npm run lint` in the terminal.
4. Ask the browser agent to run the **E2E smoke workflow** (`.agent/workflows/e2e-smoke.md`) and attach screenshots as artifacts.
5. You review the diff, commit with Conventional Commits, push, tick the milestone in `docs/sdd/10-milestones.md`.

## 4. Milestone order (strict)
`00-scaffold → 01-auth → 02-upload-parse → 03-analysis-engine → 04-gemini → 05-frontend → 06-hardening → 07-deploy`
Do not start N+1 until N's Definition of Done is met.

## 5. Workflows (slash commands)
`/new-endpoint` · `/new-component` · `/review-security` · `/e2e-smoke` · `/release`
Defined in `.agent/workflows/`.

## 6. Guardrails for the agent
- Read `CONTEXT.md` and the relevant SDD file before writing code.
- Never edit `.env`, never print secrets, never `git push --force`.
- Never install a dependency not listed in `docs/sdd/02-architecture.md` without asking.
- If requirements conflict, stop and ask; do not guess.
- Prefer small commits per task, not one giant commit per milestone.

## 7. Troubleshooting
| Symptom | Fix |
|---|---|
| Atlas connect timeout | Add current IP to Network Access; check URI encoding of password |
| `pdfjs-dist` ESM import error | Use `pdfjs-dist/legacy/build/pdf.mjs`, Node ≥ 18, `"type":"module"` |
| Cookie not set in browser | `CLIENT_ORIGIN` must exactly match Vite origin; client fetch needs `credentials: "include"` |
| Gemini 429 | Backoff retry (see `services/geminiService`), lower request rate |
| Empty extracted text | PDF is scanned image; expected 422 behavior |
