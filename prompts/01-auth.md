# Milestone 1 — Auth (scope: server/** + client auth pages)
Read docs/sdd/03-database-design.md (User), 04-api-spec.md (Auth), 05-security.md.
Server: User model (name, email lowercase unique index, passwordHash, timestamps; `toJSON` strips hash), zod validators, `authService` (register/login with bcryptjs cost 12, constant-time-ish failure message), JWT 1h in httpOnly SameSite=Lax cookie (`secure` in production), `authMiddleware`, routes: POST /auth/register, POST /auth/login, POST /auth/logout, GET /auth/me. Rate limit auth routes (10/15min/IP).
Client: Register, Login pages (controlled inputs, loading + error states, no double submit), AuthContext (calls /auth/me on load), ProtectedRoute, logout in Navbar.
Tests: duplicate email → 409, wrong password → 401 generic, weak password → 400, no-token → 401, expired token → 401, password hash never in any response.
DoD: all acceptance criteria AUTH-1..AUTH-6 pass.
