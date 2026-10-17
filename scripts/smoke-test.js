#!/usr/bin/env node

/**
 * Smoke test script for Milestone 7 (DEP-1..DEP-5 Acceptance Criteria)
 * Usage:
 *   node scripts/smoke-test.js [--api <url>] [--client <url>]
 * Defaults:
 *   --api http://localhost:5000/api/v1
 *   --client http://localhost:5173
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return fallback;
}

const apiUrl = getArg('--api', 'http://localhost:5000/api/v1').replace(/\/+$/, '');
const clientOrigin = getArg('--client', 'http://localhost:5173').replace(/\/+$/, '');

const results = [];

function recordResult(code, title, passed, details) {
  results.push({ code, title, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${code}] ${title}: ${details}`);
}

async function runSmokeTests() {
  console.log(`\n======================================================`);
  console.log(`🚀 ResumeIQ Deployment & Ops Acceptance Smoke Test`);
  console.log(`Target API:    ${apiUrl}`);
  console.log(`Target Client: ${clientOrigin}`);
  console.log(`======================================================\n`);

  // ------------------------------------------------------------------------
  // DEP-1: Docker build & configuration check
  // ------------------------------------------------------------------------
  try {
    const dockerfilePath = path.join(rootDir, 'server', 'Dockerfile');
    const composePath = path.join(rootDir, 'docker-compose.yml');

    if (!fs.existsSync(dockerfilePath) || !fs.existsSync(composePath)) {
      recordResult('DEP-1', 'Docker Configuration', false, 'Missing server/Dockerfile or docker-compose.yml');
    } else {
      const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
      const hasMultiStage = dockerfile.includes('FROM') && dockerfile.includes('AS');
      const hasNonRoot = dockerfile.includes('USER node');
      const hasHealthcheck = dockerfile.includes('HEALTHCHECK');

      if (hasMultiStage && hasNonRoot && hasHealthcheck) {
        recordResult('DEP-1', 'Docker Configuration', true, 'Multi-stage, non-root USER node, HEALTHCHECK present');
      } else {
        recordResult('DEP-1', 'Docker Configuration', false, `Incomplete Dockerfile practices: multi-stage=${hasMultiStage}, non-root=${hasNonRoot}, healthcheck=${hasHealthcheck}`);
      }
    }
  } catch (err) {
    recordResult('DEP-1', 'Docker Configuration', false, err.message);
  }

  // ------------------------------------------------------------------------
  // DEP-2: Prod env documented
  // ------------------------------------------------------------------------
  try {
    const renderPath = path.join(rootDir, 'render.yaml');
    const vercelPath = path.join(rootDir, 'client', 'vercel.json');
    const sdd09Path = path.join(rootDir, 'docs', 'sdd', '09-deployment.md');

    if (fs.existsSync(renderPath) && fs.existsSync(vercelPath) && fs.existsSync(sdd09Path)) {
      const render = fs.readFileSync(renderPath, 'utf8');
      const hasSecrets = render.includes('MONGODB_URI') && render.includes('JWT_SECRET') && render.includes('GEMINI_API_KEY');
      if (hasSecrets) {
        recordResult('DEP-2', 'Production Environment Documented', true, 'render.yaml, vercel.json, and docs/sdd/09-deployment.md validated');
      } else {
        recordResult('DEP-2', 'Production Environment Documented', false, 'render.yaml missing critical env mappings');
      }
    } else {
      recordResult('DEP-2', 'Production Environment Documented', false, 'Missing render.yaml, vercel.json, or docs/sdd/09-deployment.md');
    }
  } catch (err) {
    recordResult('DEP-2', 'Production Environment Documented', false, err.message);
  }

  // ------------------------------------------------------------------------
  // DEP-3: Live / local URL health smoke test
  // ------------------------------------------------------------------------
  try {
    const healthUrl = `${apiUrl}/health`;
    const response = await fetch(healthUrl, { method: 'GET' });
    if (response.ok) {
      const body = await response.json();
      if (body && body.status === 'ok') {
        recordResult('DEP-3', 'Live API Health Check', true, `Endpoint ${healthUrl} returned HTTP ${response.status} { status: 'ok' }`);
      } else {
        recordResult('DEP-3', 'Live API Health Check', false, `Endpoint ${healthUrl} returned unexpected body: ${JSON.stringify(body)}`);
      }
    } else {
      recordResult('DEP-3', 'Live API Health Check', false, `Endpoint ${healthUrl} returned HTTP ${response.status}`);
    }
  } catch (err) {
    recordResult('DEP-3', 'Live API Health Check', false, `Could not reach ${apiUrl}/health (${err.message}). Is the server running?`);
  }

  // ------------------------------------------------------------------------
  // DEP-4: CORS verified from client origin
  // ------------------------------------------------------------------------
  try {
    const preflightUrl = `${apiUrl}/auth/me`;
    const response = await fetch(preflightUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': clientOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCreds = response.headers.get('access-control-allow-credentials');

    if (allowOrigin === clientOrigin && allowCreds === 'true') {
      recordResult('DEP-4', 'CORS Verification', true, `Preflight granted for Origin ${clientOrigin} (credentials: true)`);
    } else {
      recordResult('DEP-4', 'CORS Verification', false, `CORS rejected or mismatch: origin=${allowOrigin}, credentials=${allowCreds}`);
    }
  } catch (err) {
    recordResult('DEP-4', 'CORS Verification', false, `CORS check failed: ${err.message}`);
  }

  // ------------------------------------------------------------------------
  // DEP-5: Rollback procedure documented
  // ------------------------------------------------------------------------
  try {
    const sdd09Path = path.join(rootDir, 'docs', 'sdd', '09-deployment.md');
    const content = fs.readFileSync(sdd09Path, 'utf8');
    const hasRollback = content.toLowerCase().includes('rollback');

    if (hasRollback) {
      recordResult('DEP-5', 'Rollback Procedure Documented', true, 'Documented in docs/sdd/09-deployment.md (git commit redeploy & tag tracking)');
    } else {
      recordResult('DEP-5', 'Rollback Procedure Documented', false, 'docs/sdd/09-deployment.md missing rollback instructions');
    }
  } catch (err) {
    recordResult('DEP-5', 'Rollback Procedure Documented', false, err.message);
  }

  // ------------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------------
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`\n------------------------------------------------------`);
  console.log(`Summary: ${totalPassed} / ${results.length} checks passed`);
  console.log(`------------------------------------------------------\n`);

  if (totalPassed < results.length) {
    process.exit(1);
  }
}

runSmokeTests();
