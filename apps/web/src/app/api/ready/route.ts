import { NextResponse } from "next/server";

import { checkDatabaseReadiness } from "@/server/repository";
import { productionConfigurationIssues } from "@/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

async function checkKgml() {
  if (process.env.ZORA_DEMO_MODE === "true") return { ok: true, mode: "demo" };
  const url = process.env.KGML_API_URL;
  if (!url) return { ok: false, code: "not_configured" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/health`, {
      cache: "no-store",
      signal: controller.signal,
    });
    return { ok: response.ok, code: response.ok ? "reachable" : `http_${response.status}` };
  } catch {
    return { ok: false, code: "unreachable" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const configurationIssues = productionConfigurationIssues();
  const [database, kgml] = await Promise.all([checkDatabaseReadiness(), checkKgml()]);
  const ready = configurationIssues.length === 0 && database.ok && kgml.ok;
  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      service: "ccsa-zora-web-api",
      dataSource: process.env.ZORA_DEMO_MODE === "true" ? "demo" : "database",
      checks: {
        configuration: { ok: configurationIssues.length === 0, issues: configurationIssues },
        database,
        kgml,
      },
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
