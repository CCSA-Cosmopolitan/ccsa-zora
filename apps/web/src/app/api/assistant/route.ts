import { NextResponse, type NextRequest } from "next/server";

import { ZORA_LANGUAGES, type ZoraLanguage } from "@ccsa-zora/utils/api";

import { generateAssistantReply, type AssistantTurn } from "@/server/zora-assistant";

export const runtime = "nodejs";
export const maxDuration = 60;

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

/** Lets the UI know which speech path to use. */
export async function GET() {
  return NextResponse.json({
    openai: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 10),
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many questions. Please wait a moment." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const message = String(body.message ?? "").trim().slice(0, 1000);
  const language = String(body.language ?? "en") as ZoraLanguage;

  if (message.length < 2) {
    return NextResponse.json({ error: "Please tell Zora your question." }, { status: 400 });
  }
  if (!ZORA_LANGUAGES.includes(language)) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }

  const history: AssistantTurn[] = Array.isArray(body.history)
    ? (body.history as AssistantTurn[])
        .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
        .map((t) => ({ role: t.role, content: t.content.slice(0, 1500) }))
    : [];

  try {
    const reply = await generateAssistantReply({
      message,
      language,
      history,
      crop: typeof body.crop === "string" ? body.crop : undefined,
      region: typeof body.region === "string" ? body.region : undefined,
    });
    return NextResponse.json(reply);
  } catch (error) {
    console.error("[Zora Assistant] failed:", error);
    return NextResponse.json({ error: "Zora could not answer right now. Please try again." }, { status: 500 });
  }
}
