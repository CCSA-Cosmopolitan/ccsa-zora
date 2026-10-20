// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const { sql } = vi.hoisted(() => ({ sql: vi.fn() }));
vi.mock('./database', () => ({ getDatabase: () => ({ client: sql }) }));
import { sendPhoneCode, verifyPhoneCode } from './phone-verification';
const phone = '+2348012345678';
const fetchMock = vi.fn();
beforeEach(() => {
  sql.mockReset(); fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('TERMII_API_KEY', 'test-key');
  vi.stubEnv('TERMII_BASE_URL', 'https://v3.api.termii.com');
  vi.stubEnv('ZORA_FIMS_SHARED_SECRET', 'x'.repeat(48));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const response = (data: unknown) => ({ ok: true, json: async () => data });
describe('phone identity verification', () => {
  it('does not contact the provider for an expired or unknown challenge', async () => {
    sql.mockResolvedValue([]);
    expect(await verifyPhoneCode(phone,'123456')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects a verified challenge for a different phone', async () => {
    sql.mockResolvedValue([{pin_id:'pin'}]);
    fetchMock.mockResolvedValue(response({verified:'True',msisdn:'2348099999999'}));
    expect(await verifyPhoneCode(phone,'123456')).toBe(false);
    expect(sql).toHaveBeenCalledTimes(1);
  });
  it('rejects an incorrect code', async () => {
    sql.mockResolvedValue([{pin_id:'pin'}]);
    fetchMock.mockResolvedValue(response({verified:'False',msisdn:phone}));
    expect(await verifyPhoneCode(phone,'123456')).toBe(false);
  });
  it('consumes a verified phone challenge exactly once', async () => {
    sql.mockResolvedValueOnce([{pin_id:'pin'}]).mockResolvedValueOnce([{phone_hash:'hash'}]);
    fetchMock.mockResolvedValue(response({verified:'True',msisdn:phone.slice(1)}));
    expect(await verifyPhoneCode(phone,'123456')).toBe(true);
    expect(sql.mock.calls[1]![0].join('')).toContain('DELETE');
  });
  it('rejects a concurrent replay after another request consumed the challenge', async () => {
    sql.mockResolvedValueOnce([{pin_id:'pin'}]).mockResolvedValueOnce([]);
    fetchMock.mockResolvedValue(response({verified:true,msisdn:phone}));
    expect(await verifyPhoneCode(phone,'123456')).toBe(false);
  });
  it('fails closed on provider errors', async () => {
    sql.mockResolvedValue([{pin_id:'pin'}]); fetchMock.mockResolvedValue({ok:false});
    await expect(verifyPhoneCode(phone,'123456')).rejects.toThrow('unavailable');
  });
  it('rejects an unexpected provider host before sending credentials', async () => {
    vi.stubEnv('TERMII_BASE_URL','https://attacker.example');
    await expect(sendPhoneCode(phone)).rejects.toThrow('Invalid verification provider');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('stores a hashed phone reference without the OTP or raw phone', async () => {
    fetchMock.mockResolvedValue(response({pin_id:'pin'})); sql.mockResolvedValue([]);
    await sendPhoneCode(phone);
    expect(sql.mock.calls[0]![1]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(sql.mock.calls)).not.toContain(phone);
  });
});
