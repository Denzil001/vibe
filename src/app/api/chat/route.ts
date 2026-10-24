import { NextResponse } from 'next/server';
import { requireAuth, toSafeUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const conversations = db.getConversations(user.id);

    // Enrich conversations with other participant details
    const enriched = conversations.map(c => {
      const otherId = c.participantIds.find(id => id !== user.id) || user.id;
      const otherUser = db.getUserById(otherId);
      const isBlocked = db.isBlocked(user.id, otherId);

      return {
        ...c,
        recipient: otherUser ? toSafeUser(otherUser) : null,
        isBlocked,
      };
    });

    return NextResponse.json({ conversations: enriched });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.isRestricted) {
      return NextResponse.json(
        { 
          error: `Your account is under temporary interaction restriction until ${user.restrictionExpiresAt || 'expiry'} because your community score fell below 90. You cannot initiate new conversations.` 
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { recipientId } = body;

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    if (recipientId === user.id) {
      return NextResponse.json({ error: 'Cannot start conversation with yourself' }, { status: 400 });
    }

    const recipient = db.getUserById(recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if either user has blocked the other
    if (db.isBlocked(user.id, recipientId)) {
      return NextResponse.json(
        { error: 'Cannot initiate contact. One or both users have blocked communication.' },
        { status: 403 }
      );
    }

    const conversation = db.getOrCreateConversation(user.id, recipientId);
    db.awardBadge(user.id, 'first_conversation');

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        recipient: toSafeUser(recipient),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
  }
}
