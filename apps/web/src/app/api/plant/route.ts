import { readJsonBody, RequestBodyError } from '@/server/request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ZORA_LANGUAGES } from '@ccsa-zora/utils/api';
import { authenticateAssistant, assistantAuthError } from '@/server/assistant-auth';
import { consumeRateLimit } from '@/server/session';
import { identifyPlantFromPhoto } from '@/server/zora-plant';
export const runtime = 'nodejs';
export const maxDuration = 60;
const input = z.object({
  language: z.enum(ZORA_LANGUAGES).default('en'),
  image: z.string().max(3_500_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
});
export async function POST(request: NextRequest) {
  try {
    const account = await authenticateAssistant(request);
    if (!(await consumeRateLimit('plant:' + account.userId, 20, 60))) {
      return NextResponse.json({ error: 'Please wait a moment before trying again.' }, { status: 429 });
    }
    const parsed = input.safeParse(await readJsonBody(request, 4000000));
    if (!parsed.success) return NextResponse.json({ error: 'A clear photo is required' }, { status: 400 });
    const plant = await identifyPlantFromPhoto(parsed.data);
    return NextResponse.json(plant, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    return (
      assistantAuthError(error) ??
      NextResponse.json(
        { error: error instanceof SyntaxError ? 'Invalid request' : 'Zora could not identify this plant. Please try again.' },
        { status: error instanceof SyntaxError ? 400 : 503 }
      )
    );
  }
}
