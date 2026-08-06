import { NextResponse, type NextRequest } from "next/server";

import type { KgmlInferenceResult } from "@ccsa-zora/utils/api";

import { authenticateRequest, requestedOrganization } from "@/server/auth";
import { assertOrganizationAccess, getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";
import { kgmlInferenceSchema } from "@/server/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateRequest(request, { requireMfa: true });
    const organizationId = requestedOrganization(request);
    const input = kgmlInferenceSchema.parse(await request.json());
    const repository = getRepository();
    await assertOrganizationAccess(repository, organizationId, principal.userId);
    const apiUrl = process.env.KGML_API_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/v1/kgml/inferences`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-zora-service-key": process.env.KGML_SERVICE_KEY ?? "demo-service-key",
      },
      body: JSON.stringify({
        field_id: input.fieldId,
        observed_at: input.observedAt,
        evidence_hashes: input.evidenceHashes,
        features: input.features,
        context: input.context ?? {},
      }),
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: "KGML inference service rejected the request", details: body },
        { status: response.status },
      );
    }
    const result = body as KgmlInferenceResult;
    await repository.recordModelRun(organizationId, principal.userId, input, result);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
