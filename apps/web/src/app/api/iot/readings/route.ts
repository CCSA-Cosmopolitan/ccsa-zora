import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getRepository } from "@/server/repository";
import { apiError } from "@/server/responses";
import { sensorIngestionSchema } from "@/server/validation";

export const runtime = "nodejs";

function validSignature(
  body: string,
  timestamp: string,
  signature: string,
  organizationId: string,
) {
  if (process.env.ZORA_DEMO_MODE === "true") return signature === "demo";
  const masterSecret = process.env.IOT_INGEST_SECRET;
  if (!masterSecret) return false;
  const organizationSecret = createHmac("sha256", masterSecret)
    .update(`zora-iot:${organizationId}`)
    .digest("base64url");
  const expected = createHmac("sha256", organizationSecret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");
  return (
    expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp =
      request.headers.get("x-zora-timestamp") ?? request.headers.get("x-agrisense-timestamp") ?? "";
    const signature =
      request.headers.get("x-zora-signature") ?? request.headers.get("x-agrisense-signature") ?? "";
    const organizationId =
      request.headers.get("x-zora-organization") ??
      request.headers.get("x-agrisense-organization") ??
      "";
    const age = Math.abs(Date.now() - Date.parse(timestamp));
    if (!organizationId || Number.isNaN(age) || age > 5 * 60_000) {
      return NextResponse.json(
        { error: "Invalid organization or request timestamp" },
        { status: 401 },
      );
    }
    if (!validSignature(body, timestamp, signature, organizationId)) {
      return NextResponse.json({ error: "Invalid ingestion signature" }, { status: 401 });
    }
    const input = sensorIngestionSchema.parse(JSON.parse(body));
    return NextResponse.json(
      await getRepository().ingestSensorReadings(organizationId, input.readings),
      { status: 202 },
    );
  } catch (error) {
    return apiError(error);
  }
}
