import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../apps/web/.env.local');

const token = process.env.VERCEL_TOKEN || '';
const teamId = process.env.VERCEL_TEAM_ID || 'team_Q9EhP9qdRqovRjUAkA56TffB';
const projectId = process.env.VERCEL_PROJECT_ID || 'prj_gJIUAqhLw5vAyr5CCkMWc67FhSXL'; // ccsa-zora on Cosmopolitan

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
envMap['FIMS_API_URL'] = 'https://fims.cosmopolitan.edu.ng';
envMap['ZORA_PUBLIC_URL'] = 'https://zora.cosmopolitan.edu.ng';

async function addEnv(key, value, type = 'encrypted') {
  const url = `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key,
      value,
      type,
      target: ['production', 'preview']
    })
  });
  const data = await res.json();
  console.log(`Set ${key}:`, res.status, data.key || data.error?.message || data.error);
}

async function run() {
  console.log(`Updating ${Object.keys(envMap).length} env vars on ccsa-zora (Cosmopolitan)...`);
  for (const [key, value] of Object.entries(envMap)) {
    if (!value) continue;
    const isPublic = key.startsWith('NEXT_PUBLIC_');
    const type = isPublic ? 'plain' : 'encrypted';
    await addEnv(key, value, type);
  }
  console.log('All ccsa-zora env vars synced to Cosmopolitan project!');
}

run().catch(console.error);
