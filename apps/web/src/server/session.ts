import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { getDatabase } from './database';
import { checkFimsAccess } from './fims';
export const SESSION_COOKIE = 'zora_session';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export async function createSession(subject: string, assertion?: string) {
  if (!(await checkFimsAccess(subject))) return null;
  const token = randomBytes(32).toString('base64url');
  await getDatabase().client.begin(async sql => {
    if (assertion) await sql`INSERT INTO zora_runtime.exchanges(assertion_hash,expires_at) VALUES (${hashToken(assertion)}, now() + interval '3 minutes')`;
    const accounts = await sql`INSERT INTO zora_runtime.accounts(id,subject) VALUES (${randomUUID()},${subject}) ON CONFLICT(subject) DO UPDATE SET subject=EXCLUDED.subject RETURNING id`;
    if (!accounts[0]) throw new Error('Account could not be created');
    await sql`INSERT INTO zora_runtime.sessions(token_hash,account_id,expires_at) VALUES (${hashToken(token)},${accounts[0].id},now() + interval '7 days')`;
  });
  return token;
}
export async function readSession(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const rows = await getDatabase().client`SELECT a.id,a.subject FROM zora_runtime.sessions s JOIN zora_runtime.accounts a ON a.id=s.account_id WHERE s.token_hash=${hashToken(token)} AND s.expires_at > now()`;
  if (!rows[0] || !(await checkFimsAccess(rows[0].subject))) return null;
  return { userId: String(rows[0].id), subject: String(rows[0].subject) };
}
export async function consumeRateLimit(key: string, limit: number, seconds: number) {
  const rows = await getDatabase().client`INSERT INTO zora_runtime.rate_limits(key,count,expires_at) VALUES (${hashToken(key)},1,now()+${seconds}*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN zora_runtime.rate_limits.expires_at < now() THEN 1 ELSE zora_runtime.rate_limits.count+1 END,expires_at=CASE WHEN zora_runtime.rate_limits.expires_at < now() THEN EXCLUDED.expires_at ELSE zora_runtime.rate_limits.expires_at END RETURNING count`;
  return Boolean(rows[0] && Number(rows[0].count) <= limit);
}
