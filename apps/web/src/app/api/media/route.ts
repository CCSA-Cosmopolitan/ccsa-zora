import { createHash, randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import type { ObservationMediaPayload } from "@ccsa-zora/utils/api";
import type { OutboxEnvelope } from "@ccsa-zora/utils/sync";

import { authenticateRequest } from "@/server/auth";
import { assertOrganizationAccess, getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";
import { mediaEnvelopeSchema } from "@/server/validation";

export const runtime = "nodejs";

function extensionFor(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/heic") return "heic";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

async function uploadToSupabase(file: File, storageKey: string, expectedHash: string) {
  if (process.env.ZORA_DEMO_MODE === "true") return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_EVIDENCE_BUCKET ?? "mrv-evidence";
  if (!url || !serviceKey) throw new Error("Supabase evidence storage is not configured");
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${storageKey}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });
  if (response.ok) return;

  const uploadError = await response.text();
  if (response.status === 400 || response.status === 409) {
    const existing = await fetch(`${url}/storage/v1/object/${bucket}/${storageKey}`, {
      headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
      cache: "no-store",
    });
    if (existing.ok) {
      const existingHash = createHash("sha256")
        .update(Buffer.from(await existing.arrayBuffer()))
        .digest("hex");
      if (existingHash === expectedHash) return;
    }
  }
  throw new Error(`Evidence upload failed (${response.status}): ${uploadError}`);
}

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateRequest(request);
    const form = await request.formData();
    const file = form.get("file");
    const metadata = form.get("metadata");
    if (!(file instanceof File) || typeof metadata !== "string") {
      return NextResponse.json({ error: "file and metadata form fields are required" }, { status: 422 });
    }
    const envelope = mediaEnvelopeSchema.parse(JSON.parse(metadata)) as OutboxEnvelope<ObservationMediaPayload>;
    if (request.headers.get("idempotency-key") !== envelope.idempotencyKey) {
      return NextResponse.json({ error: "Idempotency-Key header must match metadata" }, { status: 422 });
    }
    if (file.size !== envelope.payload.byteSize || file.type !== envelope.payload.mimeType) {
      return NextResponse.json({ error: "Media size or type does not match metadata" }, { status: 422 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== envelope.payload.sha256.toLowerCase()) {
      return NextResponse.json({ error: "Media SHA-256 does not match the uploaded content" }, { status: 422 });
    }
    const repository = getRepository();
    await assertOrganizationAccess(repository, envelope.payload.organizationId, principal.userId);
    const storageKey = `${envelope.payload.organizationId}/${envelope.payload.fieldId}/${envelope.payload.observationId}/${envelope.payload.id}.${extensionFor(file.type)}`;
    await uploadToSupabase(file, storageKey, hash);
    const receipt = await repository.recordObservationMedia(
      envelope.payload.organizationId,
      principal.userId,
      request.headers.get("x-request-id") ?? randomUUID(),
      envelope.idempotencyKey,
      { ...envelope.payload, storageKey },
    );
    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
