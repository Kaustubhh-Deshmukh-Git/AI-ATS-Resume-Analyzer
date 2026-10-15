# ResumeIQ — Resume ATS Analyzer
Upload a PDF resume, paste a job description, get an explainable ATS score and Gemini-powered suggestions.

**Stack:** React + Vite · Express · MongoDB Atlas · JWT (httpOnly cookie) · pdfjs-dist · Gemini 2.5 Flash

## Quick start
```bash
git clone <repo> && cd resume-ats-analyzer
cp server/.env.example server/.env   # fill MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
cp client/.env.example client/.env
(cd server && npm ci && npm run dev) &
(cd client && npm ci && npm run dev)
```
Open http://localhost:5173

## Docs
Start with [`CONTEXT.md`](CONTEXT.md). Design: [`docs/sdd/`](docs/sdd). Antigravity workflow: [`ANTIGRAVITY.md`](ANTIGRAVITY.md). Master agent prompt: [`PROMPT.md`](PROMPT.md).

## Scripts
`npm run dev | lint | test | build` in `server/` and `client/`.

## License
MIT
