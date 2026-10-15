# Milestone 2 — Upload & Parse (scope: server/**, client upload UI)
Read docs/sdd/04-api-spec.md (Resumes), 05-security.md §File upload.
Build `middleware/upload.js` (multer memory, 5MB, single field `resume`), `services/pdfService.js`: validate `%PDF-` magic bytes, load via pdfjs-dist legacy build with `new Uint8Array(buffer)` (copy correctly — do NOT use buffer.buffer without byteOffset/length), cap 10 pages, join text per page, normalize whitespace, detect <200 chars → 422 "scanned or image-only PDF". Route POST /resumes/parse returns `{ text, pages, charCount }`.
Client: file picker (.pdf), client-side size/type check, progress/loading, error display.
Tests: valid PDF fixture, non-PDF renamed .pdf → 400, >5MB → 413, scanned fixture → 422, 11-page → 422.
DoD: UPL-1..UPL-6 pass.
