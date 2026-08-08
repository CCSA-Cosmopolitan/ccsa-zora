import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "ccsa-zora-web-api",
      dataSource: process.env.ZORA_DEMO_MODE === "true" ? "demo" : "database",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
      timestamp: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
