# Changelog
## [0.1.0] - 2026-10-15
### Added
- Milestone 0: Scaffolded server and client packages
- Express server with Helmet, CORS allowlist, cookie-parser, request ID, and pino logging with redaction
- Zod environment configuration fail-fast validation
- Standardized AppError and centralized error handler
- `/health` and `/api/v1/health` endpoints returning 200
- React 18+ and Vite client with React Router (Home, Login, Register, Dashboard)
- Standardized API fetch wrapper with credentials and error normalization
- Vitest and ESLint configurations for both server and client
- Package lockfiles passing `npm ci` and security audits
- Initial SDD, context and agent configuration
