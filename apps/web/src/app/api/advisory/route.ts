import { NextResponse, type NextRequest } from "next/server";

import type { ZoraAdvisoryResult } from "@ccsa-zora/utils/api";

import { authenticateRequest, requestedOrganization } from "@/server/auth";
import { assertOrganizationAccess, getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";
import { zoraAdvisorySchema } from "@/server/validation";
import { generateZoraAdvisory } from "@/server/zora-ai-engine";

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

    // If OPENAI_API_KEY is set or a native African language is requested, use Zora AI Engine directly
    const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 10);
    const isAfricanLanguage = ["ha", "yo", "ig", "pcm", "ff"].includes(input.language);

    if (hasOpenAiKey || isAfricanLanguage) {
      const result = await generateZoraAdvisory(input);
      await repository.recordAdvisory(organizationId, principal.userId, input, result);
      return NextResponse.json(result);
    }

    const apiUrl = process.env.KGML_API_URL ?? "http://127.0.0.1:8100";
    const serviceKey = process.env.KGML_SERVICE_KEY || "demo-service-key";

    try {
      const response = await fetch(`${apiUrl}/v1/advisories`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-zora-service-key": serviceKey,
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

      if (response.ok) {
        const result = (await response.json()) as ZoraAdvisoryResult;
        await repository.recordAdvisory(organizationId, principal.userId, input, result);
        return NextResponse.json(result);
      }
    } catch (apiErr) {
      console.warn("[Zora Web Advisory] Live kgml-api error, falling back to AI engine:", apiErr);
    }

    // Fallback to Zora AI Engine
    const result = await generateZoraAdvisory(input);
    await repository.recordAdvisory(organizationId, principal.userId, input, result);
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
