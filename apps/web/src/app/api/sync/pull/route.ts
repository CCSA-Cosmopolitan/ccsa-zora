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
    const cursor = request.nextUrl.searchParams.get("cursor");
    if (cursor && Number.isNaN(Date.parse(cursor))) {
      return NextResponse.json({ error: "cursor must be an ISO timestamp" }, { status: 422 });
    }
    const repository = getRepository();
    await assertOrganizationAccess(repository, organizationId, principal.userId);
    return NextResponse.json(await repository.pull(organizationId, principal.userId, cursor));
  } catch (error) {
    return apiError(error);
  }
}
