import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envFile = path.join(root, 'apps/web/.env.local');

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

env.DATABASE_URL_UNPOOLED = env.MIGRATION_DATABASE_URL;

console.log('Running packages/db/scripts/verify-production.mjs...');
const res = spawnSync('node', ['scripts/verify-production.mjs'], {
  cwd: path.join(root, 'packages/db'),
  env: { ...process.env, ...env },
  encoding: 'utf8'
});

console.log('STDOUT:', res.stdout);
if (res.stderr) console.error('STDERR:', res.stderr);
console.log('EXIT CODE:', res.status);
