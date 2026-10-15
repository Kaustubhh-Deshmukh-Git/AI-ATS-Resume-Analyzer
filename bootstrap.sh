#!/usr/bin/env bash
# One-shot repo init. Run once after unzipping.
set -euo pipefail
git init -q && git checkout -q -b main
cp -n server/.env.example server/.env
cp -n client/.env.example client/.env
echo "Fill server/.env (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY)."
git add -A && git commit -q -m "chore: initial SDD, context and agent configuration"
echo "Done. Open this folder in Antigravity, paste PROMPT.md, then prompts/00-scaffold.md."
