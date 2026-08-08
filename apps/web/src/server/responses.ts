import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { randomUUID } from "node:crypto";

import { ApiAuthError } from "./auth";

export function apiError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Request validation failed", issues: error.issues },
      { status: 422 },
    );
  }
  if (error instanceof Error && error.name === "OrganizationAccessError") {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  const requestId = randomUUID();
  console.error(
    JSON.stringify({
      level: "error",
      service: "ccsa-zora-web-api",
      requestId,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : String(error),
    }),
  );
  return NextResponse.json(
    { error: "Internal server error", requestId },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}
