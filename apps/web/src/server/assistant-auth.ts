import { NextResponse, type NextRequest } from 'next/server';
import { readSession, SESSION_COOKIE } from './session';
// Farmer/agent access is separate from institutional MFA and organization roles.
export class AssistantAuthError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export function assistantAuthError(error: unknown) { return error instanceof AssistantAuthError ? NextResponse.json({ error: error.message }, { status: error.status }) : null; }
export async function authenticateAssistant(request: NextRequest) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  const token = bearer ?? request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AssistantAuthError(401, 'Sign in to Zora to continue');
  if (!bearer && !['GET','HEAD','OPTIONS'].includes(request.method) && request.headers.get('origin') !== request.nextUrl.origin) throw new AssistantAuthError(403, 'Invalid request origin');
  let account;
  try { account = await readSession(token); } catch { throw new AssistantAuthError(503, 'Access verification is temporarily unavailable'); }
  if (!account) throw new AssistantAuthError(401, 'Your session or FIMS access has expired. Please sign in again.');
  return account;
}
