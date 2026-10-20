import { NextRequest, NextResponse } from 'next/server';
import { authenticateAssistant as authenticateRequest, assistantAuthError as authErrorResponse } from '@/server/assistant-auth';
import { SESSION_COOKIE, hashToken } from '@/server/session';
import { getDatabase } from '@/server/database';
export async function GET(request: NextRequest) {
  try { const user = await authenticateRequest(request); return NextResponse.json({ user, plan: 'fims-sponsored', quota: null }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch(error) { return authErrorResponse(error) ?? NextResponse.json({ error: 'Unavailable' }, { status: 503 }); }
}
export async function DELETE(request: NextRequest) {
  try {
    const bearer=request.headers.get('authorization')?.startsWith('Bearer ');
    if(!bearer&&request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Invalid origin'},{status:403});
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? request.cookies.get(SESSION_COOKIE)?.value ?? '';
    await getDatabase().client`DELETE FROM zora_runtime.sessions WHERE token_hash=${hashToken(token)}`;
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch(error) { return authErrorResponse(error) ?? NextResponse.json({ error: 'Unavailable' }, { status: 503 }); }
}
