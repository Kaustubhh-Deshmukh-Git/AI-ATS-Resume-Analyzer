# SDD 04 — API Specification
Base: `/api/v1` (tutorial's unversioned `/auth`, `/resume` replaced). Full machine spec: `openapi.yaml`.

| Method | Route | Auth | Body | Success | Errors |
|---|---|---|---|---|---|
| GET | /health | no | — | 200 `{status:"ok"}` | — |
| POST | /auth/register | no | `{name,email,password}` | 201 `{user}` | 400, 409 |
| POST | /auth/login | no | `{email,password}` | 200 `{user}` + cookie | 400, 401, 429 |
| POST | /auth/logout | yes | — | 204 | 401 |
| GET | /auth/me | yes | — | 200 `{user}` | 401 |
| POST | /resumes/parse | yes | multipart `resume` | 200 `{text,pages,charCount}` | 400,413,422 |
| POST | /analyses | yes | `{resumeText,jobDescription,title?}` | 201 `{analysis}` | 400,429 |
| GET | /analyses?page&limit | yes | — | 200 `{items,page,total}` | 401 |
| GET | /analyses/:id | yes | — | 200 `{analysis}` | 404 |
| DELETE | /analyses/:id | yes | — | 204 | 404 |

## Error shape (all errors)
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "details": [{"path":"email","message":"Invalid email"}], "requestId": "…" } }
```
Codes: VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND, CONFLICT, PAYLOAD_TOO_LARGE, UNPROCESSABLE, RATE_LIMITED, INTERNAL.

## Validation rules
password ≥8, ≥1 letter, ≥1 number · email RFC-valid ≤254 · jobDescription 50–10,000 · resumeText 200–50,000.
