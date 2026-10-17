# /release Workflow

1. Ensure `main` branch is clean, CI checks are green, and tests pass (`npm test` in both server and client).
2. Run the release automation script:
   ```bash
   node scripts/release.js <x.y.z>
   ```
   This synchronizes `server/package.json`, `client/package.json`, and updates `CHANGELOG.md`.
3. Commit the release files:
   ```bash
   git add server/package.json client/package.json CHANGELOG.md
   git commit -m "chore(release): v<x.y.z>"
   ```
4. Create an annotated git tag:
   ```bash
   git tag -a v<x.y.z> -m "Release v<x.y.z>"
   ```
5. Push the commit and the tag to GitHub:
   ```bash
   git push origin main --tags
   ```
   *(Note: Never force push).*
