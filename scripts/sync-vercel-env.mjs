import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../apps/web/.env.local');

const envContent = fs.readFileSync(envPath, 'utf8');

const envMap = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envMap[key] = val;
  }
}

// Adjust production settings
envMap['ZORA_ENV'] = 'production';
envMap['FIMS_API_URL'] = 'https://fims-v2-eight.vercel.app';
envMap['ZORA_PUBLIC_URL'] = 'https://ccsa-zora.vercel.app';

console.log(`Syncing ${Object.keys(envMap).length} environment variables to Vercel production for ccsa-zora...`);

for (const [key, value] of Object.entries(envMap)) {
  if (!value) continue;
  try {
    const isPublic = key.startsWith('NEXT_PUBLIC_');
    const typeFlag = isPublic ? '--type config' : '';
    console.log(`Setting ${key} (${isPublic ? 'config' : 'secret'})...`);
    execSync(`vercel env add ${key} production ${typeFlag} --yes --force`, {
      input: value,
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: path.resolve(__dirname, '..')
    });
  } catch (err) {
    console.error(`Failed to set ${key}:`, err.message);
  }
}

console.log('All environment variables synced to Vercel for ccsa-zora!');
