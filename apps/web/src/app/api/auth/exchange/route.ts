import { readJsonBody, RequestBodyError } from '@/server/request-body';
import { NextRequest, NextResponse } from 'next/server';
import { verifyFimsAssertion } from '@/server/fims';
import { createSession, SESSION_COOKIE } from '@/server/session';
export async function POST(request: NextRequest) {
  let body;try{body=await readJsonBody(request,4096);}catch(error){return NextResponse.json({error:'Invalid or oversized request'},{status:error instanceof RequestBodyError?error.status:400});}
  if (typeof body?.assertion !== 'string') return NextResponse.json({ error: 'Missing FIMS assertion' }, { status: 400 });
  let subject;
  try { subject = verifyFimsAssertion(body.assertion); } catch { return NextResponse.json({ error: 'Invalid or expired assertion' }, { status: 401 }); }
  try {
    const token = await createSession(subject, body.assertion);
    if (!token) return NextResponse.json({ error: 'Zora is not enabled for this account' }, { status: 403 });
    const response = NextResponse.json({ token, expiresIn: 604800, plan: 'fims-sponsored', quota: null }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 604800 });
    return response;
  } catch(error) { const replay=Boolean(error && typeof error==='object' && 'code' in error && error.code==='23505');return NextResponse.json({ error: replay?'Assertion already used':'Session exchange unavailable' }, { status: replay?409:503 }); }
}
