import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authenticateAssistant, assistantAuthError } from '@/server/assistant-auth';
import { consumeRateLimit } from '@/server/session';
export const runtime = 'nodejs';
export const maxDuration = 60;
const languages: Record<string, string> = {
  en: 'Standard English (Nigerian accent)',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
  pcm: 'Nigerian Pidgin',
  ff: 'Fulfulde'
};
export async function POST(request: NextRequest) {
  try {
    const account = await authenticateAssistant(request);
    if (!(await consumeRateLimit('transcribe:' + account.userId, 20, 60))) return NextResponse.json({ error: 'Please wait a moment.' }, { status: 429 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Voice recognition is unavailable' }, { status: 503 });
    if (Number(request.headers.get('content-length')) > 12_000_000) return NextResponse.json({ error: 'Recording too large' }, { status: 413 });
    const form = await request.formData();
    const audio = form.get('audio');
    const language = String(form.get('language') ?? 'en');
    if (!(audio instanceof File) || audio.size < 800 || audio.size > 10_000_000 || !languages[language] || !/^(audio\/(webm|mp4|mpeg|wav|x-wav|m4a|x-m4a|ogg)|video\/webm)(;.*)?$/.test(audio.type)) return NextResponse.json({ error: 'Invalid or oversized recording' }, { status: 400 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 0 });
    const result = await client.audio.transcriptions.create({ file: audio, model: process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe', prompt: 'Transcribe the farmer faithfully in ' + languages[language] + '. Do not translate, answer, or invent words during silence.' });
    return NextResponse.json({ text: result.text }, { headers: { 'Cache-Control': 'no-store' } });
  } catch(error) { return assistantAuthError(error) ?? NextResponse.json({ error: 'Could not understand the recording. Please try again.' }, { status: 503 }); }
}
