#!/usr/bin/env node

/**
 * Release helper script for /release workflow
 * Usage: node scripts/release.js [version]
 * Example: node scripts/release.js 0.1.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetVersion = process.argv[2];

if (!targetVersion || !/^\d+\.\d+\.\d+/.test(targetVersion)) {
  console.error('Usage: node scripts/release.js <x.y.z>');
  process.exit(1);
}

const serverPkgPath = path.join(rootDir, 'server', 'package.json');
const clientPkgPath = path.join(rootDir, 'client', 'package.json');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

console.log(`Bumping version to v${targetVersion}...`);

// 1. Update server/package.json
const serverPkg = JSON.parse(fs.readFileSync(serverPkgPath, 'utf8'));
serverPkg.version = targetVersion;
fs.writeFileSync(serverPkgPath, JSON.stringify(serverPkg, null, 2) + '\n');
console.log(`Updated server/package.json -> ${targetVersion}`);

// 2. Update client/package.json
const clientPkg = JSON.parse(fs.readFileSync(clientPkgPath, 'utf8'));
clientPkg.version = targetVersion;
fs.writeFileSync(clientPkgPath, JSON.stringify(clientPkg, null, 2) + '\n');
console.log(`Updated client/package.json -> ${targetVersion}`);

// 3. Update CHANGELOG.md
if (fs.existsSync(changelogPath)) {
  let changelog = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  const releaseHeader = `## [${targetVersion}] - ${today}`;

  if (changelog.includes('## [Unreleased]')) {
    changelog = changelog.replace(
      '## [Unreleased]',
      `## [Unreleased]\n\n${releaseHeader}`
    );
    fs.writeFileSync(changelogPath, changelog);
    console.log(`Updated CHANGELOG.md with ${releaseHeader}`);
  }
}

console.log('\n✅ Version bumped successfully!');
console.log('\nNext release steps:');
console.log(`  git add server/package.json client/package.json CHANGELOG.md`);
console.log(`  git commit -m "chore(release): v${targetVersion}"`);
console.log(`  git tag -a v${targetVersion} -m "Release v${targetVersion}"`);
console.log(`  git push origin v${targetVersion}\n`);
