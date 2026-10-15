# /new-endpoint
1. Add/confirm the route in docs/sdd/04-api-spec.md and openapi.yaml.
2. Create zod validator in server/src/validators.
3. Create service function with unit tests.
4. Create thin controller + route wiring + auth/rate-limit as spec'd.
5. Add Supertest integration tests: success, validation, auth, IDOR (if resource-owned).
6. Run `npm run lint && npm test` in server/. Update CHANGELOG.
