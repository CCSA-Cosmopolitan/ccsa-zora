// @vitest-environment node
import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkFimsAccess, verifyFimsAssertion } from './fims';
const secret = 'test-only-shared-secret-with-at-least-32-characters';
function assertion(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iss: 'fims', aud: 'zora', sub: 'farmer:test123', iat: now, exp: now + 120, ...overrides })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
beforeEach(() => { vi.stubEnv('ZORA_FIMS_SHARED_SECRET', secret); vi.stubEnv('FIMS_API_URL', 'https://fims.example.test'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('FIMS identity exchange', () => {
  it('accepts a signed short-lived farmer identity', () => expect(verifyFimsAssertion(assertion())).toBe('farmer:test123'));
  it.each([{ aud: 'another-app' }, { iss: 'attacker' }, { exp: 1 }, { iat: Math.floor(Date.now()/1000)+60 }, { exp: Math.floor(Date.now()/1000)+3600 }, { sub: 'admin:test123' }, { sub: null }])('rejects invalid claims %j', claims => expect(() => verifyFimsAssertion(assertion(claims))).toThrow());
  it('rejects a tampered signature', () => expect(() => verifyFimsAssertion(`${assertion().split('.')[0]}.bad`)).toThrow());
  it('fails closed on disabled access', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ enabled: false }) });
    vi.stubGlobal('fetch', fetch);
    expect(await checkFimsAccess('farmer:test123')).toBe(false);
    const [, options] = fetch.mock.calls[0]!;
    expect(options.body).toBe(JSON.stringify({ type: 'farmer', id: 'test123' }));
    expect(options.headers['x-zora-signature']).toBe(createHmac('sha256', secret).update(`${options.headers['x-zora-timestamp']}.${options.body}`).digest('base64url'));
  });
  it('fails closed when FIMS is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(checkFimsAccess('agent:abc')).rejects.toThrow('unavailable');
  });
  it('requires HTTPS in production', async () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('FIMS_API_URL', 'http://fims.example.test');
    await expect(checkFimsAccess('agent:abc')).rejects.toThrow('not configured');
  });
});
