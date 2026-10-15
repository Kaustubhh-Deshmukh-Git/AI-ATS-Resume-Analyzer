# Milestone 4 — Gemini + persistence (scope: server/**)
Read docs/sdd/06-ai-prompt-design.md fully.
Build `services/geminiService.js`: fetch to `gemini-2.5-flash:generateContent`, key via header `x-goog-api-key` (not query string), `generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema }`, 20s AbortController timeout, 2 retries with exponential backoff on 429/5xx, zod-validate the parsed output, on failure return `aiStatus: "unavailable"` while still returning the deterministic score (graceful degradation). Truncate inputs to documented limits. Prompt-injection defense: resume/JD wrapped in delimited blocks and declared as untrusted data.
Models: Analysis (see 03-database-design). Routes: POST /analyses, GET /analyses (paginated, no raw text), GET /analyses/:id (owner only → else 404), DELETE /analyses/:id. Rate limit POST /analyses 10/hour/user.
Tests: mock fetch; success, malformed JSON, timeout, 429 retry, injection string in resume does not alter schema output, ownership isolation.
DoD: AI-1..AI-6, API-1..API-8 pass.
