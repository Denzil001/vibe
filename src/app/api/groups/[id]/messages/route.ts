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
    const group = db.getGroupById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Verify user is a member
    const isMember = db.isGroupMember(group.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You must join this community group to view messages.' },
        { status: 403 }
      );
    }

    const messages = db.getMessages({ groupId: group.id, limit: 100 });
    return NextResponse.json({ messages });
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
    const group = db.getGroupById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Verify membership
    const isMember = db.isGroupMember(group.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You must join this group before posting messages.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message exceeds 1000 characters.' }, { status: 400 });
    }

    const msg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      groupId: group.id,
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
