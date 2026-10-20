// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
vi.mock('./session', () => ({ SESSION_COOKIE: 'zora_session', readSession: vi.fn() }));
import { readSession } from './session';
import { authenticateAssistant } from './assistant-auth';
const lookup = vi.mocked(readSession);
beforeEach(() => { lookup.mockReset(); });
describe('Neon assistant authentication', () => {
  it('rejects anonymous requests without a database lookup', async () => {
    await expect(authenticateAssistant(new NextRequest('https://zora.test/api/assistant'))).rejects.toMatchObject({ status: 401 });
    expect(lookup).not.toHaveBeenCalled();
  });
  it('rejects cross-origin cookie mutations', async () => {
    const request = new NextRequest('https://zora.test/api/assistant', { method: 'POST', headers: { cookie: 'zora_session=test', origin: 'https://attacker.test' } });
    await expect(authenticateAssistant(request)).rejects.toMatchObject({ status: 403 });
    expect(lookup).not.toHaveBeenCalled();
  });
  it('allows an authenticated native bearer request', async () => {
    lookup.mockResolvedValue({ userId: 'uuid', subject: 'agent:abc' });
    const request = new NextRequest('https://zora.test/api/assistant', { method: 'POST', headers: { authorization: 'Bearer test' } });
    await expect(authenticateAssistant(request)).resolves.toEqual({ userId: 'uuid', subject: 'agent:abc' });
  });
  it('rejects revoked or expired sessions', async () => {
    lookup.mockResolvedValue(null);
    await expect(authenticateAssistant(new NextRequest('https://zora.test/api/auth/session', { headers: { cookie: 'zora_session=test' } }))).rejects.toMatchObject({ status: 401 });
  });
  it('reports verification outages without granting access', async () => {
    lookup.mockRejectedValue(new Error('Database unavailable'));
    await expect(authenticateAssistant(new NextRequest('https://zora.test/api/auth/session', { headers: { cookie: 'zora_session=test' } }))).rejects.toMatchObject({ status: 503 });
  });
});
