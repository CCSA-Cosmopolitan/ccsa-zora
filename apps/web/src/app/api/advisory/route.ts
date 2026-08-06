import { NextResponse, type NextRequest } from "next/server";

import type { ZoraAdvisoryResult } from "@ccsa-zora/utils/api";

import { authenticateRequest, requestedOrganization } from "@/server/auth";
import { assertOrganizationAccess, getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";
import { zoraAdvisorySchema } from "@/server/validation";
import { createReferenceAdvisory } from "@/server/zora-advisory";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateRequest(request);
    const input = zoraAdvisorySchema.parse(await request.json());
    const organizationId = requestedOrganization(request);
    if (organizationId !== input.organizationId) {
      return NextResponse.json({ error: "Organization context mismatch" }, { status: 403 });
    }
    const repository = getRepository();
    await assertOrganizationAccess(repository, organizationId, principal.userId);

    if (process.env.ZORA_DEMO_MODE === "true") {
      const result = createReferenceAdvisory(input);
      await repository.recordAdvisory(organizationId, principal.userId, input, result);
      return NextResponse.json(result);
    }

    const apiUrl = process.env.KGML_API_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/v1/advisories`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-zora-service-key": process.env.KGML_SERVICE_KEY ?? "demo-service-key",
      },
      body: JSON.stringify({
        organization_id: input.organizationId,
        field_id: input.fieldId ?? null,
        language: input.language,
        message: input.message,
        channel: input.channel,
        context: input.context ?? {},
      }),
      cache: "no-store",
    });
    const body = (await response.json()) as ZoraAdvisoryResult | { detail: unknown };
    if (!response.ok) {
      return NextResponse.json(
        { error: "Zora intelligence service rejected the request", details: body },
        { status: response.status },
      );
    }
    const result = body as ZoraAdvisoryResult;
    await repository.recordAdvisory(organizationId, principal.userId, input, result);
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
