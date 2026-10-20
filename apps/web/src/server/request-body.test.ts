// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readJsonBody } from './request-body';
describe('bounded JSON requests', () => {
  it('reads a valid body', async () => {
    expect(await readJsonBody(new Request('https://zora.test',{method:'POST',body:'{"a":1}'}),10)).toEqual({a:1});
  });
  it('rejects an oversized body without a content-length header', async () => {
    await expect(readJsonBody(new Request('https://zora.test',{method:'POST',body:'{"a":"too large"}'}),8)).rejects.toMatchObject({status:413});
  });
  it('counts UTF-8 bytes rather than characters', async () => {
    await expect(readJsonBody(new Request('https://zora.test',{method:'POST',body:'"ééé"'}),7)).rejects.toMatchObject({status:413});
  });
  it('rejects malformed JSON', async () => {
    await expect(readJsonBody(new Request('https://zora.test',{method:'POST',body:'bad'}),10)).rejects.toMatchObject({status:400});
  });
});
