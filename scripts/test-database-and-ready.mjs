import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from '../apps/web/node_modules/postgres/src/index.js';

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

async function main() {
  console.log('Testing Zora Neon Database connection directly...');
  const sql = postgres(env.DATABASE_URL, {
    max: 1,
    connect_timeout: 15,
  });

  try {
    const ping = await sql`SELECT 1 as connected`;
    console.log('✓ Database ping successful:', ping);

    const accountsCheck = await sql`SELECT count(*)::int as count FROM zora_runtime.accounts`;
    console.log('✓ zora_runtime.accounts table exists! Count:', accountsCheck[0]?.count);

    const fimsGrantsCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'zora_runtime' 
      ORDER BY table_name;
    `;
    console.log('✓ zora_runtime tables:', fimsGrantsCheck.map(t => t.table_name));

  } catch (err) {
    console.error('Database check error:', err.message);
  } finally {
    await sql.end();
  }
}

main();
