import { createHash, randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import type { ObservationMediaPayload } from "@ccsa-zora/utils/api";
import type { OutboxEnvelope } from "@ccsa-zora/utils/sync";

import { getDatabase } from "@/server/database";
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

async function uploadToNeon(file: File, storageKey: string, expectedHash: string, accountId: string) {
 const { client } = getDatabase();
 const rows = await client`INSERT INTO zora_runtime.media(storage_key,account_id,sha256,mime_type,content) VALUES (${storageKey},${accountId},${expectedHash},${file.type},${Buffer.from(await file.arrayBuffer())}) ON CONFLICT(storage_key) DO NOTHING RETURNING storage_key`;
 if(rows.length)return;
 const existing=await client`SELECT sha256 FROM zora_runtime.media WHERE storage_key=${storageKey} AND account_id=${accountId}`;
 if(existing[0]?.sha256!==expectedHash)throw new Error('Evidence conflicts with an existing upload');
}

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateRequest(request);
    const form = await request.formData();
    const file = form.get("file");
    const metadata = form.get("metadata");
    if (!(file instanceof File) || typeof metadata !== "string") {
      return NextResponse.json(
        { error: "file and metadata form fields are required" },
        { status: 422 },
      );
    }
    const envelope = mediaEnvelopeSchema.parse(
      JSON.parse(metadata),
    ) as OutboxEnvelope<ObservationMediaPayload>;
    if (request.headers.get("idempotency-key") !== envelope.idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header must match metadata" },
        { status: 422 },
      );
    }
    if (file.size !== envelope.payload.byteSize || file.type !== envelope.payload.mimeType) {
      return NextResponse.json(
        { error: "Media size or type does not match metadata" },
        { status: 422 },
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== envelope.payload.sha256.toLowerCase()) {
      return NextResponse.json(
        { error: "Media SHA-256 does not match the uploaded content" },
        { status: 422 },
      );
    }
    const repository = getRepository();
    await assertOrganizationAccess(repository, envelope.payload.organizationId, principal.userId);
    const storageKey = `${envelope.payload.organizationId}/${envelope.payload.fieldId}/${envelope.payload.observationId}/${envelope.payload.id}.${extensionFor(file.type)}`;
    await uploadToNeon(file, storageKey, hash, principal.userId);
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
