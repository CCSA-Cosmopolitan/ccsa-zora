import { NextRequest,NextResponse } from 'next/server';
import { authenticateRequest,authErrorResponse } from '@/server/auth';
export async function POST(request:NextRequest){try{await authenticateRequest(request,{requireMfa:true});return NextResponse.json({error:'Manage farmer records in FIMS'},{status:409});}catch(e){return authErrorResponse(e)??NextResponse.json({error:'Access denied'},{status:403});}}
