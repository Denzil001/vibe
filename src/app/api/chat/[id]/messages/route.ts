import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Message } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const conversation = db.getConversationById(params.id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.participantIds.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const otherId = conversation.participantIds.find(id => id !== user.id);
    const isBlocked = otherId ? db.isBlocked(user.id, otherId) : false;

    const messages = db.getMessages({ conversationId: conversation.id, limit: 100 });
    return NextResponse.json({ messages, isBlocked });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const conversation = db.getConversationById(params.id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.participantIds.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const otherId = conversation.participantIds.find(id => id !== user.id);
    if (otherId && db.isBlocked(user.id, otherId)) {
      return NextResponse.json(
        { error: 'Cannot send message. Messaging between these accounts has been blocked.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message exceeds 1000 characters limit.' }, { status: 400 });
    }

    const msg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      conversationId: conversation.id,
      senderId: user.id,
      senderName: user.displayName,
      senderAvatar: user.avatarUrl,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    db.createMessage(msg);

    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
