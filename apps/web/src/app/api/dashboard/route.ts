import { NextResponse, type NextRequest } from "next/server";

import { authenticateRequest, requestedOrganization } from "@/server/auth";
import { assertOrganizationAccess, getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const principal = await authenticateRequest(request);
    const organizationId = requestedOrganization(request);
    const repository = getRepository();
    await assertOrganizationAccess(repository, organizationId, principal.userId);
    return NextResponse.json(await repository.getDashboard(organizationId, principal.userId));
  } catch (error) {
    return apiError(error);
  }
}
