import { NextRequest, NextResponse } from 'next/server';
import { authenticateAssistant, assistantAuthError } from '@/server/assistant-auth';
import { getDatabase } from '@/server/database';
export async function GET(request: NextRequest) {
  try {
    const account = await authenticateAssistant(request);
    const id = request.nextUrl.searchParams.get('id');
    const { client } = getDatabase();
    if (id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });
      const owned = await client`SELECT id FROM zora_runtime.conversations WHERE id=${id} AND account_id=${account.userId}`;
      if (!owned.length) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      const messages = await client`SELECT id,role,content,created_at FROM zora_runtime.messages WHERE conversation_id=${id} ORDER BY id DESC LIMIT 100`;
      return NextResponse.json({ messages: messages.reverse() }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const conversations = await client`SELECT c.id,c.language,c.created_at,(SELECT content FROM zora_runtime.messages WHERE conversation_id=c.id ORDER BY id LIMIT 1) AS title FROM zora_runtime.conversations c WHERE account_id=${account.userId} ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ conversations }, { headers: { 'Cache-Control': 'no-store' } });
  } catch(error) { return assistantAuthError(error) ?? NextResponse.json({ error: 'History unavailable' }, { status: 503 }); }
}
