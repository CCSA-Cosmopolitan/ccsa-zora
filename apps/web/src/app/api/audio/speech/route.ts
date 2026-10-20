import { readJsonBody, RequestBodyError } from '@/server/request-body';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authenticateAssistant, assistantAuthError } from '@/server/assistant-auth';
import { consumeRateLimit } from '@/server/session';
export const runtime = 'nodejs';
const languages: Record<string, string> = {
  en: 'Standard English with a clear, professional West African/Nigerian accent. Do not use Pidgin pronunciation.',
  ha: 'Northern Nigerian Hausa',
  yo: 'Yorùbá with natural tonal rhythm',
  ig: 'Igbo with natural tonal rhythm',
  pcm: 'authentic Nigerian Pidgin with a warm, natural flow',
  ff: 'Fulfulde'
};
export async function POST(request: NextRequest) {
  try {
    const account = await authenticateAssistant(request);
    if (!(await consumeRateLimit('speech:' + account.userId, 30, 60))) return NextResponse.json({ error: 'Please wait a moment.' }, { status: 429 });
    const body = await readJsonBody(request, 20000);
    if (typeof body?.text !== 'string' || !body.text.trim() || body.text.length > 4000 || !languages[body.language]) return NextResponse.json({ error: 'Invalid speech request' }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Voice playback is unavailable' }, { status: 503 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 0 });
    const audio = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', voice: 'coral',
      input: body.text, instructions: 'Speak naturally in ' + languages[body.language] + '. Use a warm Nigerian accent, clear pronunciation, and short pauses between steps. Read the text faithfully.',
    });
    return new Response(await audio.arrayBuffer(), { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, no-store' } });
  } catch(error) { if(error instanceof RequestBodyError)return NextResponse.json({error:error.message},{status:error.status}); return assistantAuthError(error) ?? NextResponse.json({ error: 'Voice playback is temporarily unavailable' }, { status: 503 }); }
}
