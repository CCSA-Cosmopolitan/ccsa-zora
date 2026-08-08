import { randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import type { ObservationPayload } from "@ccsa-zora/utils/api";
import type { OutboxEnvelope } from "@ccsa-zora/utils/sync";

import { authenticateRequest } from "@/server/auth";
import { assertOrganizationAccess, getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";
import { outboxEnvelopeSchema } from "@/server/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateRequest(request);
    const envelope = outboxEnvelopeSchema.parse(
      await request.json(),
    ) as OutboxEnvelope<ObservationPayload>;
    const headerKey = request.headers.get("idempotency-key");
    if (headerKey !== envelope.idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header must match the envelope" },
        { status: 422 },
      );
    }
    if (envelope.entityId !== envelope.payload.id) {
      return NextResponse.json({ error: "entityId must match payload.id" }, { status: 422 });
    }
    const repository = getRepository();
    await assertOrganizationAccess(repository, envelope.payload.organizationId, principal.userId);
    const result = await repository.pushObservation(
      envelope.payload.organizationId,
      principal.userId,
      request.headers.get("x-request-id") ?? randomUUID(),
      envelope,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
