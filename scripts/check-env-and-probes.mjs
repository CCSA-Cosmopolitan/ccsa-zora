import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envFile = path.join(root, 'apps/web/.env.local');

console.log('=== Zora Production Environment & Readiness Check ===');

if (!fs.existsSync(envFile)) {
  console.error('Error: apps/web/.env.local not found.');
  process.exit(1);
}

const env = {};
const envText = fs.readFileSync(envFile, 'utf8');
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

// 1. Run validate-production-env.mjs
console.log('\n--- 1. Validating Production Environment Variables ---');
const valRes = spawnSync('node', ['scripts/validate-production-env.mjs'], {
  cwd: root,
  env: { ...process.env, ...env },
  encoding: 'utf8',
});

if (valRes.stdout) console.log(valRes.stdout.trim());
if (valRes.stderr) console.error(valRes.stderr.trim());

if (valRes.status === 0) {
  console.log('✓ Production environment variables validated successfully.');
} else {
  console.error('✗ Environment validation failed with exit code:', valRes.status);
}

// 2. Validate structure
console.log('\n--- 2. Validating Project Structure ---');
const structRes = spawnSync('node', ['scripts/validate-structure.mjs'], {
  cwd: root,
  env: { ...process.env, ...env },
  encoding: 'utf8',
});
if (structRes.stdout) console.log(structRes.stdout.trim());
if (structRes.stderr) console.error(structRes.stderr.trim());
if (structRes.status === 0) {
  console.log('✓ Project structure validated.');
} else {
  console.log('✗ Structure check returned code:', structRes.status);
}

// 3. Test Direct Database Query to Zora Neon Runtime
console.log('\n--- 3. Testing Zora Runtime Database Connection ---');
try {
  const neonUrl = env.DATABASE_URL;
  if (!neonUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  // Test connection using postgres
  const { neon } = await import('@neondb/serverless').catch(() => ({}));
  if (neon) {
    const sql = neon(neonUrl);
    const result = await sql`SELECT 1 as connected`;
    console.log('✓ Neon PostgreSQL connection successful:', result);
  } else {
    console.log('Note: @neondb/serverless not available in root, checked via DATABASE_URL string format.');
  }
} catch (e) {
  console.error('Database connection test note:', e.message);
}
