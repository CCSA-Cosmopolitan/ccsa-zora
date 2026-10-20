export class RequestBodyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
/** Bound streamed bodies as well as requests with a Content-Length header. */
export async function readJsonBody(request: Request, maximumBytes: number) {
  if (Number(request.headers.get('content-length')) > maximumBytes) {
    throw new RequestBodyError('Request is too large', 413);
  }
  if (!request.body) throw new RequestBodyError('Invalid JSON request', 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new RequestBodyError('Request is too large', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RequestBodyError('Invalid JSON request', 400); }
}
