import {NextRequest,NextResponse} from 'next/server';
import {authenticateRequest,authErrorResponse} from '@/server/auth';
export async function POST(request:NextRequest){try{await authenticateRequest(request);return NextResponse.json({error:'Use the current /api/assistant endpoint'},{status:410});}catch(e){return authErrorResponse(e)??NextResponse.json({error:'Access denied'},{status:403});}}
