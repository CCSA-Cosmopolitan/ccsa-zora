import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text || "").trim();
    const language = String(body.language || "en");
    const requestedVoice = String(body.voice || "nova");

    if (!text || text.length < 2) {
      return NextResponse.json({ error: "Missing or empty text for audio speech generation" }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ElevenLabs African Voice Integration (if configured)
    // ─────────────────────────────────────────────────────────────────────────
    if (elevenLabsKey && elevenLabsKey.trim().length > 10) {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default or Nigerian cloned voice ID
      try {
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsKey.trim(),
          },
          body: JSON.stringify({
            text: text.slice(0, 4000),
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (elevenRes.ok) {
          const audioBuffer = await elevenRes.arrayBuffer();
          return new Response(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch (e) {
        console.warn("[Zora Speech] ElevenLabs call failed, falling back to OpenAI TTS:", e);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. OpenAI Audio API (tts-1 with fluid multi-lingual phonemes)
    // ─────────────────────────────────────────────────────────────────────────
    if (openAiKey && openAiKey.trim().length > 10) {
      const openai = new OpenAI({ apiKey: openAiKey.trim() });
      const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "coral", "sage"] as const;
      type Voice = (typeof validVoices)[number];

      const voiceToUse: Voice = validVoices.includes(requestedVoice as Voice)
        ? (requestedVoice as Voice)
        : "coral";

      const languageLabel: Record<string, string> = {
        ha: "Hausa",
        yo: "Yoruba",
        ig: "Igbo",
        pcm: "Nigerian Pidgin",
        ff: "Fulfulde",
        en: "English",
      };
      const instructions = `Speak as a warm, calm, friendly native Nigerian ${languageLabel[language] ?? "English"} speaker, like a trusted older neighbour who is an experienced farm extension officer. Use a natural Nigerian accent and rhythm, a slow, clear pace, short natural pauses between steps, and a reassuring tone. Never sound robotic.`;

      let mp3;
      try {
        mp3 = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: voiceToUse,
          input: text.slice(0, 4000),
          instructions,
        } as Parameters<typeof openai.audio.speech.create>[0]);
      } catch (ttsError) {
        console.warn("[Zora Speech] gpt-4o-mini-tts unavailable, using tts-1:", ttsError);
        mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: (["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const).includes(
            voiceToUse as "alloy",
          )
            ? (voiceToUse as "alloy")
            : "nova",
          input: text.slice(0, 4000),
          speed: 0.95,
        });
      }

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return new Response(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Fallback Status when no external key is configured yet
    // ─────────────────────────────────────────────────────────────────────────
    return NextResponse.json({
      available: false,
      message: "To activate high-fidelity neural Nigerian speech streaming, configure OPENAI_API_KEY or ELEVENLABS_API_KEY in apps/web/.env.local.",
      suggestion: "Using local client-side speech synthesis.",
    }, { status: 422 });
  } catch (error: any) {
    console.error("[Zora Speech API] Error generating audio:", error);
    return NextResponse.json({ error: error?.message || "Internal audio synthesis failure" }, { status: 500 });
  }
}
