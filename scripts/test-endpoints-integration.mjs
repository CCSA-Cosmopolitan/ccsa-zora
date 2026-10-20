import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../../fims-v2/node_modules/@prisma/client/default.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.resolve(__dirname, '../apps/web/.env.local');

const envText = fs.readFileSync(envFile, 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx > 0) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const secret = env.ZORA_FIMS_SHARED_SECRET;
const zoraBase = 'http://localhost:3001';
const fimsBase = 'http://localhost:3000';

async function main() {
  console.log('====================================================');
  console.log(' Phase 2: End-to-End Readiness & Probe Verification ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, ok, details = '') {
    if (ok) {
      console.log(`[PASS] ${name}${details ? ` - ${details}` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}${details ? ` - ${details}` : ''}`);
      failed++;
    }
  }

  // 1. Zora /api/health
  try {
    const res = await fetch(`${zoraBase}/api/health`);
    const data = await res.json();
    report('Zora /api/health', res.ok && data.status === 'ok', JSON.stringify(data));
  } catch (err) {
    report('Zora /api/health', false, err.message);
  }

  // 2. Anonymous Protection on Zora AI routes
  for (const route of ['/api/assistant', '/api/audio/speech', '/api/assistant/transcribe']) {
    try {
      const res = await fetch(`${zoraBase}${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      report(`Anonymous protection ${route}`, res.status === 401, `Status: ${res.status}`);
    } catch (err) {
      report(`Anonymous protection ${route}`, false, err.message);
    }
  }

  // 3. FIMS Internal Zora Access Route (Unauthorized signature check)
  try {
    const raw = JSON.stringify({ type: 'agent', id: 'readiness-probe' });
    const timestamp = String(Date.now());
    const badSig = 'invalid-signature-12345';

    const res = await fetch(`${fimsBase}/api/internal/zora/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zora-timestamp': timestamp,
        'x-zora-signature': badSig,
      },
      body: raw,
    });
    report('FIMS HMAC rejection on invalid signature', res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    report('FIMS HMAC rejection check', false, err.message);
  }

  // 4. FIMS Internal Zora Access Route (Valid HMAC signature check)
  try {
    const raw = JSON.stringify({ type: 'agent', id: 'readiness-probe' });
    const timestamp = String(Date.now());
    const validSig = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${raw}`)
      .digest('base64url');

    const res = await fetch(`${fimsBase}/api/internal/zora/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zora-timestamp': timestamp,
        'x-zora-signature': validSig,
      },
      body: raw,
    });
    const data = await res.json();
    report(
      'FIMS HMAC acceptance with shared secret',
      res.ok && typeof data.enabled === 'boolean',
      `Status: ${res.status}, response: ${JSON.stringify(data)}`
    );
  } catch (err) {
    report('FIMS HMAC acceptance check', false, err.message);
  }

  // 5. Expired timestamp rejection in FIMS
  try {
    const raw = JSON.stringify({ type: 'agent', id: 'readiness-probe' });
    const expiredTimestamp = String(Date.now() - 60000); // 60s ago (> 30s tolerance)
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${expiredTimestamp}.${raw}`)
      .digest('base64url');

    const res = await fetch(`${fimsBase}/api/internal/zora/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zora-timestamp': expiredTimestamp,
        'x-zora-signature': sig,
      },
      body: raw,
    });
    report('FIMS replay rejection on expired timestamp', res.status === 401, `Status: ${res.status}`);
  } catch (err) {
    report('FIMS replay rejection check', false, err.message);
  }

  // 6. Complete Live Pilot Lifecycle Simulation
  console.log('\n--- Live Grant Lifecycle Simulation ---');
  let prisma;
  const testAgentId = 'pilot-agent-' + Date.now();
  try {
    // Read FIMS database URL
    const fimsEnv = fs.readFileSync(path.resolve(__dirname, '../../fims-v2/.env'), 'utf8');
    const dbUrlMatch = fimsEnv.match(/DATABASE_URL="?([^"\r\n]+)"?/);
    if (!dbUrlMatch) throw new Error('DATABASE_URL not found in fims-v2/.env');

    prisma = new PrismaClient({
      datasources: { db: { url: dbUrlMatch[1] } }
    });

    // 6a. Find an existing agent or create a test agent in FIMS
    let pilotUser = await prisma.user.findFirst({
      where: { role: { in: ['agent', 'data_correction_agent', 'survey_agent'] }, isActive: true },
      select: { id: true, email: true, role: true }
    });

    if (pilotUser) {
      console.log(`Using existing active agent for test: ${pilotUser.email} (${pilotUser.id})`);
    } else {
      console.log('No existing agent found, checking farmers...');
      const farmer = await prisma.farmer.findFirst({ select: { id: true } });
      if (farmer) {
        pilotUser = { id: farmer.id, email: 'farmer', role: 'farmer' };
      }
    }

    if (pilotUser) {
      const subjectType = pilotUser.role === 'farmer' ? 'farmer' : 'agent';
      const subjectId = pilotUser.id;
      const subjectString = `${subjectType}:${subjectId}`;

      // 6b. Enable access in zora_access_grants
      await prisma.$executeRaw`
        INSERT INTO zora_access_grants(subject_type, subject_id, enabled, updated_by)
        VALUES (${subjectType}, ${subjectId}, true, 'test-phase-2')
        ON CONFLICT (subject_type, subject_id) DO UPDATE SET enabled=true, updated_by='test-phase-2'
      `;
      report('FIMS database access grant write', true, `Granted access to ${subjectString}`);

      // 6c. Issue signed assertion for this enabled user
      const now = Math.floor(Date.now() / 1000);
      const jti = crypto.randomUUID();
      const payload = Buffer.from(
        JSON.stringify({
          iss: 'fims',
          aud: 'zora',
          sub: subjectString,
          iat: now,
          exp: now + 120,
          jti,
        })
      ).toString('base64url');

      const assertionSig = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64url');

      const assertion = `${payload}.${assertionSig}`;

      // 6d. Exchange assertion on Zora /api/auth/exchange
      const exchangeRes = await fetch(`${zoraBase}/api/auth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertion }),
      });
      const exchangeData = await exchangeRes.json();

      report(
        'Zora exchange for enabled account',
        exchangeRes.ok && typeof exchangeData.token === 'string',
        `Status: ${exchangeRes.status}, Plan: ${exchangeData.plan}, Token length: ${exchangeData.token?.length}`
      );

      // 6e. Test Replay Protection
      const replayRes = await fetch(`${zoraBase}/api/auth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertion }),
      });
      report(
        'Zora assertion single-use replay protection',
        replayRes.status === 409,
        `Status: ${replayRes.status} (Assertion already used)`
      );

      // 6f. Test Authenticated Zora Assistant with newly minted token
      if (exchangeData.token) {
        const assistantRes = await fetch(`${zoraBase}/api/assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${exchangeData.token}`
          },
          body: JSON.stringify({
            message: 'Hello Zora, what is the best planting density for maize in Kano?',
            language: 'en'
          })
        });
        const assistantData = await assistantRes.json();
        report(
          'Authenticated Zora assistant query',
          assistantRes.ok && (typeof assistantData.spoken === 'string' || typeof assistantData.reply === 'string'),
          `Status: ${assistantRes.status}, Received answer: "${(assistantData.spoken || assistantData.reply || '').slice(0, 60)}..."`
        );
      }

      // 6g. Test Instant Revocation
      await prisma.$executeRaw`
        UPDATE zora_access_grants SET enabled = false, updated_at = now()
        WHERE subject_type = ${subjectType} AND subject_id = ${subjectId}
      `;
      report('FIMS grant revocation update', true, `Revoked access for ${subjectString}`);

      if (exchangeData.token) {
        const revokedQuery = await fetch(`${zoraBase}/api/assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${exchangeData.token}`
          },
          body: JSON.stringify({ message: 'Can I ask another question?', language: 'en' })
        });
        report(
          'Immediate enforcement of revoked access',
          revokedQuery.status === 401 || revokedQuery.status === 403,
          `Status: ${revokedQuery.status} (Blocked after revocation)`
        );
      }

      // Clean up grant record
      await prisma.$executeRaw`DELETE FROM zora_access_grants WHERE subject_id = ${subjectId}`;
      console.log('Cleaned up test grant record from database.');
    }
  } catch (err) {
    report('Live Pilot Lifecycle Simulation', false, err.message);
  } finally {
    if (prisma) await prisma.$disconnect();
  }

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
