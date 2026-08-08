import { NextResponse, type NextRequest } from "next/server";

import { DEMO_ORGANIZATION_ID, DEMO_USER_ID } from "./demo-data";

export interface Principal {
  userId: string;
  email: string | null;
  authLevel: "aal1" | "aal2";
  demo: boolean;
}

function isDemoMode() {
  return process.env.ZORA_DEMO_MODE === "true";
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const encoded = token.split(".")[1];
  if (!encoded) return {};
  try {
    return JSON.parse(
      Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64url").toString("utf8"),
    ) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function authenticateRequest(
  request: NextRequest,
  options: { requireMfa?: boolean } = {},
): Promise<Principal> {
  if (isDemoMode()) {
    return {
      userId: process.env.ZORA_DEMO_USER_ID ?? DEMO_USER_ID,
      email: "extension@demo.zora.local",
      authLevel: "aal2",
      demo: true,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");
  if (!supabaseUrl || !anonKey) {
    throw new ApiAuthError(503, "Supabase authentication is not configured");
  }
  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiAuthError(401, "A bearer access token is required");
  }

  const token = authorization.slice("Bearer ".length);
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiAuthError(401, "The access token is invalid or expired");
  }

  const user = (await response.json()) as { id: string; email?: string };
  const payload = decodeJwtPayload(token);
  const authLevel = payload.aal === "aal2" ? "aal2" : "aal1";
  if (options.requireMfa && authLevel !== "aal2") {
    throw new ApiAuthError(403, "Multi-factor authentication is required");
  }

  return { userId: user.id, email: user.email ?? null, authLevel, demo: false };
}

export class ApiAuthError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}

export function requestedOrganization(request: NextRequest): string {
  return (
    request.nextUrl.searchParams.get("organizationId") ??
    request.headers.get("x-zora-organization") ??
    request.headers.get("x-agrisense-organization") ??
    process.env.ZORA_DEMO_ORGANIZATION_ID ??
    DEMO_ORGANIZATION_ID
  );
}
