import { NextRequest, NextResponse } from 'next/server';
import { authenticateAssistant, AssistantAuthError } from './assistant-auth';
export interface Principal { userId: string; email: string | null; authLevel: 'aal1' | 'aal2'; demo: boolean }
export class ApiAuthError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export async function authenticateRequest(request: NextRequest, options: { requireMfa?: boolean } = {}): Promise<Principal> {
  try {
    const account = await authenticateAssistant(request);
    // A phone OTP or FIMS mobile session is not institutional MFA.
    // Never elevate a farmer or agent into an administrative organization role.
    if (options.requireMfa) throw new ApiAuthError(403, 'Institutional MFA enrollment is required for this operation');
    return { userId: account.userId, email: null, authLevel: 'aal1', demo: false };
  } catch(error) {
    if (error instanceof AssistantAuthError) throw new ApiAuthError(error.status, error.message);
    throw error;
  }
}
export function authErrorResponse(error: unknown) { return error instanceof ApiAuthError ? NextResponse.json({ error: error.message }, { status: error.status }) : null; }
export function requestedOrganization(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('organizationId') ?? request.headers.get('x-zora-organization') ?? request.headers.get('x-agrisense-organization');
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new ApiAuthError(400, 'A valid organization is required');
  return id;
}
