import autocannon from 'autocannon';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { goldenPairs } from '../fixtures/goldenPairs.js';

/**
 * Autocannon Load Test for POST /api/v1/analyses
 * Target: 50 requests per second for 30 seconds
 * Requirement: p95 latency < 300ms (excluding external AI latency)
 */
async function runLoadTest() {
  console.log('--- Starting Milestone 6 Load Test (autocannon: 50 rps for 30s) ---');

  // 1. Start ephemeral in-memory MongoDB
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  console.log('✓ Connected to in-memory test database');

  // 2. Mock external Gemini fetch to isolate and test ATS engine + server latency
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    if (typeof url === 'string' && url.includes('generativelanguage.googleapis.com')) {
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      summary: 'Candidate demonstrates strong technical alignment.',
                      missingSkills: ['System Design', 'Microservices'],
                      optimizationTips: ['Highlight high-throughput architecture experience.'],
                      bulletImprovements: [
                        {
                          original: 'Wrote backend services',
                          improved: 'Engineered high-throughput backend services supporting 50k RPS.',
                          reason: 'Adds measurable scale and business impact metrics.',
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      };
    }
    return originalFetch(url, options);
  };

  // 3. Start test HTTP server on random ephemeral port
  process.env.NODE_ENV = 'test';
  const { default: app } = await import('../../src/app.js');
  const server = app.listen(0);
  const { port } = server.address();
  console.log(`✓ Test HTTP server listening on port ${port}`);

  try {
    // 4. Register load test user and obtain auth session cookie
    const registerResponse = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Load Test User',
        email: 'loadtest@example.com',
        password: 'Password123!',
      }),
    });

    const cookieHeader = registerResponse.headers.get('set-cookie');
    if (!cookieHeader) {
      throw new Error('Failed to obtain auth cookie for load test user');
    }
    const tokenCookie = cookieHeader.split(';')[0];
    console.log('✓ Registered load test user and obtained authenticated session');

    // 5. Prepare valid resume and job description payload
    const payload = JSON.stringify({
      resumeText: goldenPairs[0].resumeText,
      jobDescription: goldenPairs[0].jobDescription,
      title: 'Autocannon Benchmark Analysis',
    });

    console.log('⚡ Running autocannon benchmark (50 RPS, 30s duration)...');

    // 6. Execute autocannon benchmark
    const instance = autocannon(
      {
        url: `http://localhost:${port}/api/v1/analyses`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: tokenCookie,
        },
        body: payload,
        connections: 10,
        overallRate: 50,
        duration: 30,
      },
      (err, _result) => {
        if (err) {
          console.error('Autocannon error:', err);
        }
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
    const result = await new Promise((resolve, reject) => {
      instance.on('done', resolve);
      instance.on('error', reject);
    });

    console.log('\n--- Load Test Results ---');
    console.log(`Total Requests:    ${result.requests.total}`);
    console.log(`Requests/sec:      ${result.requests.average}`);
    console.log(`Average Latency:   ${result.latency.average} ms`);
    console.log(`p50 Latency:       ${result.latency.p50} ms`);
    const p95 = result.latency.p97_5 ?? result.latency.p99 ?? result.latency.average;
    console.log(`p95/p97.5 Latency: ${p95} ms`);
    console.log(`p99 Latency:       ${result.latency.p99} ms`);
    console.log(`Max Latency:       ${result.latency.max} ms`);
    console.log(`2xx Responses:     ${result['2xx']}`);
    console.log(`Non-2xx Responses: ${result.non2xx}`);

    // Verify DoD: zero non-2xx errors and p95 < 300ms
    if (result.non2xx > 0) {
      throw new Error(`Load test failed with ${result.non2xx} non-2xx responses`);
    }
    if (p95 > 300) {
      throw new Error(`p95 latency threshold exceeded: ${p95}ms (expected < 300ms)`);
    }

    console.log(`\n🎉 DoD Met: p95 latency is ${p95}ms (< 300ms threshold).`);
  } finally {
    // 7. Cleanup and teardown
    global.fetch = originalFetch;
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('✓ Teardown complete');
  }
}

runLoadTest().catch((err) => {
  console.error('Load test failed:', err);
  process.exit(1);
});
