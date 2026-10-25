import { NextResponse } from 'next/server';
import { requireAuth, toSafeUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isUserPermanentlyBanned, getActiveJourney } from '@/lib/compartment-db';

export async function GET() {
  try {
    const user = await requireAuth();

    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({
        conversations: [],
        isBanned: true,
        message: 'Your account is permanently restricted from chat.',
      }, { status: 403 });
    }

    const conversations: any[] = [];

    // Fetch from Supabase rooms
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const s = getSupabaseAdmin();
        const journey = await getActiveJourney();
        const journeyId = journey?.id;

        // Find private rooms where user is a member
        const { data: userMemberships } = await s
          .from('room_members')
          .select('room_id, rooms!inner(id, journey_id, type, status, created_at)')
          .eq('user_id', user.id);

        const privateRoomIds = (userMemberships || [])
          .filter(m => (m.rooms as any)?.type === 'private' && (m.rooms as any)?.status === 'active')
          .map(m => m.room_id);

        if (privateRoomIds.length > 0) {
          // Fetch the other member for each private room
          const { data: otherMembers } = await s
            .from('room_members')
            .select('room_id, user_id, profiles(id, handle, display_name, avatar, conversation_goal, interests)')
            .in('room_id', privateRoomIds)
            .neq('user_id', user.id);

          // Fetch last message for each room
          for (const rm of (otherMembers || [])) {
            const prof = (rm as any).profiles;
            const avatarUrl = prof?.avatar?.startsWith('http')
              ? prof.avatar
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(prof?.handle || rm.user_id)}`;

            const { data: lastMsg } = await s
              .from('messages')
              .select('content, created_at')
              .eq('room_id', rm.room_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            conversations.push({
              id: rm.room_id,
              roomId: rm.room_id,
              journeyId: journeyId,
              participantIds: [user.id, rm.user_id],
              lastMessage: lastMsg?.content || 'Compartment opened. Say hello!',
              lastMessageAt: lastMsg?.created_at || new Date().toISOString(),
              recipient: {
                id: rm.user_id,
                username: prof?.handle || 'passenger',
                displayName: prof?.display_name || prof?.handle || 'Passenger',
                avatarUrl,
                conversationTopics: [prof?.conversation_goal || 'Casual fun'],
                interests: prof?.interests || [],
              },
              isBlocked: false,
            });
          }
        }
      } catch (err) {
        console.warn('Supabase conversations lookup error:', err);
      }
    }

    // Merge with local db conversations for backward compatibility
    const localConvs = db.getConversations(user.id);
    for (const c of localConvs) {
      if (!conversations.some(x => x.id === c.id)) {
        const otherId = c.participantIds.find(id => id !== user.id) || user.id;
        const otherUser = db.getUserById(otherId);
        const isBlocked = db.isBlocked(user.id, otherId);
        conversations.push({
          ...c,
          recipient: otherUser ? toSafeUser(otherUser) : null,
          isBlocked,
        });
      }
    }

    return NextResponse.json({ conversations });
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

    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json(
        { error: 'Your account is permanently restricted from initiating chats.' },
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

    const conversation = db.getOrCreateConversation(user.id, recipientId);
    const recipient = db.getUserById(recipientId);

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        recipient: recipient ? toSafeUser(recipient) : null,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
  }
}
