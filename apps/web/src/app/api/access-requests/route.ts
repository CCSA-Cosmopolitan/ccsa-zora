import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/server/responses";
import { getDatabase } from "@/server/database";
import { accessRequestInputSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_384;
const CONSENT_VERSION = "access-request-v1";

function acceptedResponse() {
  return NextResponse.json(
    {
      status: "received",
      message: "Your request has been received for institutional review.",
    },
    { status: 202, headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
    }
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const input = accessRequestInputSchema.parse(body);

    // Quietly accept the hidden honeypot field so automated submissions do not
    // learn how the spam control works.
    if (input.website) return acceptedResponse();
    if (process.env.ZORA_DEMO_MODE === "true") return acceptedResponse();

    const fingerprintSalt = process.env.ACCESS_REQUEST_HASH_SALT?.trim();
    if (!fingerprintSalt || fingerprintSalt.length < 32) {
      throw new Error("ACCESS_REQUEST_HASH_SALT must contain at least 32 characters");
    }
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const address = forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
    const fingerprint = createHash("sha256").update(`${fingerprintSalt}:${address}`).digest("hex");

    const { client } = getDatabase();
    try {
      await client`
        select public.submit_access_request(
          ${input.fullName},
          ${input.email},
          ${input.organizationName},
          ${input.requestedRole},
          ${input.country || null},
          ${input.useCase},
          ${CONSENT_VERSION},
          ${fingerprint},
          ${client.json({ source: "zora_web" })}::jsonb
        ) as request_id
      `;
    } catch (error) {
      if (error instanceof Error && error.message.includes("access_request_rate_limit")) {
        return NextResponse.json(
          { error: "Too many access requests. Please try again later." },
          { status: 429, headers: { "cache-control": "no-store", "retry-after": "3600" } },
        );
      }
      throw error;
    }

    return acceptedResponse();
  } catch (error) {
    return apiError(error);
  }
}
