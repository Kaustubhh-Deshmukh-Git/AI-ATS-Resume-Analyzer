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

## [0.2.0] - 2026-10-15
### Added
- Milestone 1: Authentication & Session Management (AUTH-1..AUTH-6)
- User model with bcrypt password hashing (cost 12), lowercase unique email index, and strict hash stripping in `toJSON`
- Zod request validators for register and login requests
- `authService` handling user registration, constant-time failure responses for login, and JWT signing/verification
- Secure session handling via 1-hour `httpOnly` `SameSite=Lax` cookies (`secure` in production)
- Auth rate limiter (10 attempts / 15 minutes per IP) returning standard 429 `RATE_LIMITED` error shape
- Auth API endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`
- React `AuthContext` and `useAuth` hook verifying `/auth/me` on mount
- `ProtectedRoute` component guarding `/dashboard`
- Controlled `Login` and `Register` pages with client-side validation, live password criteria checklist, error alerts, and double-submit prevention
- Navigation header with dynamic user avatar badge and sign out action
- Vitest integration tests covering duplicate emails, weak passwords, cookie sessions, generic 401s, token expiry, and rate limiting

