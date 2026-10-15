# Milestone 3 — Deterministic ATS engine (scope: server/src/services, utils, tests)
Read docs/sdd/06-ai-prompt-design.md §Scoring and docs/sdd/02-architecture.md §Scoring engine.
Build pure, fully unit-tested modules: `utils/normalize.js` (lowercase, alias map e.g. "node.js|nodejs|node" → "node", "reactjs" → "react", "c++" preserved), `data/stopwords.js`, `data/skills.json` (≥300 tech + soft skills with categories), `services/keywordService.js` (extract skills + n-grams 1–3 via taxonomy, Set-based), `services/scoreService.js` implementing the weighted formula in the SDD (keyword match 60, section completeness 20, formatting/readability 10, quantified-impact 10) and returning `{ score, breakdown, matched[], missing[] }`.
No I/O in these modules. ≥90% line coverage on them.
DoD: ENG-1..ENG-6 pass; golden-file tests with 3 resume/JD pairs.
