import { createHmac, timingSafeEqual } from 'node:crypto';
function secret() {
  const value = process.env.ZORA_FIMS_SHARED_SECRET;
  if (!value || value.length < 32) throw new Error('FIMS integration is not configured');
  return value;
}
export function verifyFimsAssertion(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1] || token.length > 2048) throw new Error('Invalid assertion');
  const expected = createHmac('sha256', secret()).update(parts[0]).digest();
  const actual = Buffer.from(parts[1], 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid assertion');
  const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== 'fims' || claims.aud !== 'zora' || typeof claims.exp !== 'number' || typeof claims.iat !== 'number' || claims.exp <= now || claims.iat > now + 5 || claims.exp - claims.iat > 120 || typeof claims.sub !== 'string' || !/^(farmer|agent):[a-zA-Z0-9_-]{1,128}$/.test(claims.sub)) throw new Error('Invalid or expired assertion');
  return claims.sub;
}
export async function queryFims(body: { type: string; id: string } | { phone: string }) {
  const base = process.env.FIMS_API_URL;
  if (!base || (process.env.NODE_ENV === 'production' && !base.startsWith('https://'))) throw new Error('FIMS API URL is not configured');
  const raw = JSON.stringify(body);
  const timestamp = String(Date.now());
  const signature = createHmac('sha256', secret()).update(`${timestamp}.${raw}`).digest('base64url');
  const response = await fetch(`${base.replace(/\/$/, '')}/api/internal/zora/access`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-zora-timestamp': timestamp, 'x-zora-signature': signature }, body: raw, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('FIMS access verification unavailable');
  return await response.json() as { enabled: boolean; subject?: string };
}
export async function checkFimsAccess(subject: string) {
  const [type, id] = subject.split(':');
  if (!type || !id || !/^(farmer|agent):[a-zA-Z0-9_-]{1,128}$/.test(subject)) return false;
  return (await queryFims({ type, id })).enabled === true;
}
