import { readJsonBody, RequestBodyError } from '@/server/request-body';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ZORA_LANGUAGES } from '@ccsa-zora/utils/api';
import { authenticateAssistant, assistantAuthError } from '@/server/assistant-auth';
import { consumeRateLimit } from '@/server/session';
import { getDatabase } from '@/server/database';
import { generateAssistantReply, type AssistantTurn } from '@/server/zora-assistant';
export const runtime = 'nodejs';
export const maxDuration = 60;
const input = z.object({ message: z.string().trim().min(2).max(2000), language: z.enum(ZORA_LANGUAGES).default('en'), conversationId: z.string().uuid().optional(), image: z.string().max(3_500_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).optional(), crop: z.string().max(100).optional(), region: z.string().max(200).optional() });
export async function GET() { return NextResponse.json({ openai: Boolean(process.env.OPENAI_API_KEY) }); }
export async function POST(request: NextRequest) {
  try {
    const account = await authenticateAssistant(request);
    if (!(await consumeRateLimit('assistant:' + account.userId, 30, 60))) return NextResponse.json({ error: 'Please wait a moment before asking again.' }, { status: 429 });
    const parsed = input.safeParse(await readJsonBody(request, 4000000));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid question, language or photo' }, { status: 400 });
    const body = parsed.data;
    const { client } = getDatabase();
    const conversationId = body.conversationId ?? randomUUID();
    if (body.conversationId) {
      const owned = await client`SELECT id FROM zora_runtime.conversations WHERE id=${conversationId} AND account_id=${account.userId}`;
      if (!owned.length) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    const rows = body.conversationId ? await client`SELECT role,content FROM zora_runtime.messages WHERE conversation_id=${conversationId} ORDER BY id DESC LIMIT 12` : [];
    const history = rows.reverse().map(row => ({ role: row.role, content: row.content })) as AssistantTurn[];
    const reply = await generateAssistantReply({ ...body, history });
    const storedAssistantContent = JSON.stringify({
      spoken: reply.spoken,
      diagnosis: reply.diagnosis,
      severity: reply.severity,
      explanation: reply.explanation,
      steps: reply.steps,
      tips: reply.tips,
      organicAlternative: reply.organicAlternative,
      safety: reply.safety,
      followUp: reply.followUp,
    });
    await client.begin(async sql => {
      await sql`INSERT INTO zora_runtime.conversations(id,account_id,language) VALUES (${conversationId},${account.userId},${body.language}) ON CONFLICT(id) DO NOTHING`;
      await sql`INSERT INTO zora_runtime.messages(conversation_id,role,content) VALUES (${conversationId},'user',${body.message}),(${conversationId},'assistant',${storedAssistantContent})`;
    });
    return NextResponse.json({ ...reply, conversationId }, { headers: { 'Cache-Control': 'no-store' } });
  } catch(error) {
    if(error instanceof RequestBodyError)return NextResponse.json({error:error.message},{status:error.status});
    return assistantAuthError(error) ?? NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid request' : 'Zora is temporarily unavailable. Please try again.' }, { status: error instanceof SyntaxError ? 400 : 503 });
  }
}
