# AGENTS.md
Cross-tool agent instructions. Authoritative detail lives in `CONTEXT.md` and `ANTIGRAVITY.md`.
- Read `CONTEXT.md` first, then the SDD file for your task.
- Stay inside your assigned path scope. Plan before coding. Tests with every change.
- No secrets in code, logs, or commits. Validate all input with zod. Hash passwords with bcrypt.
- Commands: `npm run dev|lint|test|build` in `server/` and `client/`.
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
