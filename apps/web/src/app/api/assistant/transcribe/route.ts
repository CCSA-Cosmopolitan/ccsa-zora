import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

// Whisper does not officially support Igbo or Fulfulde; those are auto-detected.
const WHISPER_LANGUAGE: Record<string, string | undefined> = {
  en: "en",
  pcm: "en",
  ha: "ha",
  yo: "yo",
  ig: undefined,
  ff: undefined,
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey.length <= 10) {
    return NextResponse.json({ available: false }, { status: 422 });
  }

  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const language = String(form.get("language") ?? "en");
    if (!(audio instanceof File) || audio.size < 800) {
      return NextResponse.json({ error: "No audio received." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const lang = WHISPER_LANGUAGE[language];
    const result = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      prompt: "A farmer asks about crops, pests, maize, cassava, rice, yam, fertilizer, spraying, rain, soil.",
      ...(lang ? { language: lang } : {}),
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("[Zora Transcribe] failed:", error);
    return NextResponse.json({ error: "Could not understand the audio." }, { status: 500 });
  }
}
