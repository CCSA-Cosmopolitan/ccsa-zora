import { NextRequest,NextResponse } from 'next/server';
import { authenticateRequest,authErrorResponse,requestedOrganization } from '@/server/auth';
import { assertOrganizationAccess,getRepository } from '@/server/repository';
export async function GET(request:NextRequest){try{const p=await authenticateRequest(request);await assertOrganizationAccess(getRepository(),requestedOrganization(request),p.userId);return NextResponse.json({error:'Institutional workspace migration is not complete'},{status:503});}catch(e){return authErrorResponse(e)??NextResponse.json({error:'Workspace access unavailable'},{status:403});}}
