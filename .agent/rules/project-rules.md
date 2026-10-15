# Project rules (always on)
- Read CONTEXT.md before any task; follow docs/sdd/* as the spec.
- Stay in your path scope (server/**, client/**, docs/**, tests).
- Plan first, then implement, then test. Never skip tests.
- Validate every input with zod. Never pass req.body to Mongoose directly.
- Hash passwords with bcryptjs cost 12. JWT only in httpOnly cookie.
- Never log or persist raw resume/JD text. Never print secrets. Never edit .env.
- No new dependencies outside docs/sdd/02-architecture.md without asking.
- Conventional Commits. Small commits.
