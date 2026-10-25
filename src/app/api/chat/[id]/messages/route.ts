import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Message } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { 
  isUserPermanentlyBanned, 
  recordRoomPresence, 
  getRatingEligibility,
  touchRoomActivity,
  isRoomInactive,
  isRoomDisconnected,
  closeRoomDueToInactivity
} from '@/lib/compartment-db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Check permanent chat ban
    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({ error: 'Your account is permanently restricted from chat.' }, { status: 403 });
    }

    const roomId = params.id;

    // Check if it is a Supabase room
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const s = getSupabaseAdmin();

        // 1. Check if room was explicitly disconnected by companion quitting
        if (isRoomDisconnected(roomId)) {
          return NextResponse.json({
            messages: [],
            isDisconnected: true,
            isClosed: true,
            error: 'Your companion has exited the compartment. This private chat has been disconnected.',
          }, { status: 200 });
        }

        // 2. Check 30s inactivity
        if (isRoomInactive(roomId)) {
          await closeRoomDueToInactivity(roomId);
          return NextResponse.json({
            messages: [],
            isInactive: true,
            isDisconnected: true,
            isClosed: true,
            error: 'This chatroom has been closed after 30 seconds of inactivity.',
          }, { status: 200 });
        }

        const { data: room } = await s
          .from('rooms')
          .select('id, journey_id, type, status, expires_at, journeys(status)')
          .eq('id', roomId)
          .maybeSingle();

        if (room) {
          const journeyStatus = (room as any).journeys?.status;
          if (journeyStatus === 'ended' || room.status === 'expired') {
            return NextResponse.json({ 
              messages: [],
              isDisconnected: true,
              isClosed: true,
              error: 'This conversation has ended.' 
            }, { status: 200 });
          }

          let recipient: any = null;
          let ratingEligibility = { alreadyRated: false, recipientGoodCapReached: false };

          // Lounge vs Private authorization
          if (room.type === 'private') {
            const { data: members } = await s
              .from('room_members')
              .select('user_id, profiles(id, handle, display_name, avatar, conversation_goal, interests)')
              .eq('room_id', roomId);

            const memberIds = (members || []).map(m => m.user_id);
            if (!memberIds.includes(user.id)) {
              return NextResponse.json({ error: 'Access denied: You are not a member of this private compartment.' }, { status: 403 });
            }

            const otherMember = (members || []).find(m => m.user_id !== user.id);
            if (otherMember) {
              const prof = (otherMember as any).profiles;
              const avatarUrl = prof?.avatar?.startsWith('http')
                ? prof.avatar
                : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(prof?.handle || otherMember.user_id)}`;

              recipient = {
                id: otherMember.user_id,
                username: prof?.handle || 'passenger',
                displayName: prof?.display_name || prof?.handle || 'Passenger',
                avatarUrl,
                conversationTopics: [prof?.conversation_goal || 'Casual fun'],
                interests: prof?.interests || [],
              };

              ratingEligibility = await getRatingEligibility({
                journeyId: room.journey_id,
                roomId,
                raterId: user.id,
                targetUserId: otherMember.user_id,
              });
            }
          }

          // Record active presence in room (clears stale messages if previous occupants all left)
          const presence = await recordRoomPresence(roomId, user.id);

          // Update room activity timestamp (resets 30s inactivity timer)
          touchRoomActivity(roomId);

          // Fetch messages
          const { data: rawMessages } = await s
            .from('messages')
            .select('id, content, sender_id, created_at, profiles(handle, display_name, avatar)')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })
            .limit(200);

          const messages: Message[] = (rawMessages || []).map(m => {
            const prof = (m as any).profiles;
            const avatarUrl = prof?.avatar?.startsWith('http')
              ? prof.avatar
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(prof?.handle || m.sender_id)}`;

            return {
              id: m.id,
              conversationId: roomId,
              senderId: m.sender_id,
              senderName: prof?.display_name || prof?.handle || 'Passenger',
              senderAvatar: avatarUrl,
              content: m.content,
              createdAt: m.created_at,
            };
          });

          return NextResponse.json({
            messages,
            isBlocked: false,
            isClosed: false,
            isDisconnected: false,
            roomType: room.type,
            journeyId: room.journey_id,
            recipient,
            ratingEligibility,
            activeOccupants: presence.activeCount,
          });
        }
      } catch (err) {
        console.warn('Supabase room lookup error:', err);
      }
    }

    // Local DB fallback for unit tests
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
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation messages' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Check permanent chat ban
    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({ error: 'Your account is permanently restricted from sending messages.' }, { status: 403 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message exceeds 1000 characters limit.' }, { status: 400 });
    }

    const cleanContent = content.trim();
    const roomId = params.id;

    // Check if room is disconnected or inactive
    if (isRoomDisconnected(roomId)) {
      return NextResponse.json({ error: 'Chat is disconnected. The companion exited the room.' }, { status: 410 });
    }

    if (isRoomInactive(roomId)) {
      await closeRoomDueToInactivity(roomId);
      return NextResponse.json({ error: 'Chat has been closed after 30 seconds of inactivity.' }, { status: 410 });
    }

    // Check if it is a Supabase room
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const s = getSupabaseAdmin();
        const { data: room } = await s
          .from('rooms')
          .select('id, journey_id, type, status, journeys(status)')
          .eq('id', roomId)
          .maybeSingle();

        if (room) {
          const journeyStatus = (room as any).journeys?.status;
          if (journeyStatus === 'ended' || room.status === 'expired') {
            return NextResponse.json({ error: 'This conversation has ended.' }, { status: 410 });
          }

          if (room.type === 'private') {
            const { data: membership } = await s
              .from('room_members')
              .select('user_id')
              .eq('room_id', roomId)
              .eq('user_id', user.id)
              .maybeSingle();

            if (!membership) {
              return NextResponse.json({ error: 'Access denied: You are not a member of this private room.' }, { status: 403 });
            }
          }

          // Ensure sender presence is active
          await recordRoomPresence(roomId, user.id);

          // Insert into Supabase messages
          const { data: inserted, error: insErr } = await s
            .from('messages')
            .insert({
              room_id: roomId,
              sender_id: user.id,
              content: cleanContent,
            })
            .select('id, created_at')
            .single();

          if (insErr) {
            return NextResponse.json({ error: 'Failed to record message in database.' }, { status: 500 });
          }

          // Reset the 30-second inactivity countdown!
          touchRoomActivity(roomId);

          const { data: senderProf } = await s
            .from('profiles')
            .select('handle, display_name, avatar')
            .eq('id', user.id)
            .maybeSingle();

          const avatarUrl = senderProf?.avatar?.startsWith('http')
            ? senderProf.avatar
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(senderProf?.handle || user.id)}`;

          const message: Message = {
            id: inserted.id,
            conversationId: roomId,
            senderId: user.id,
            senderName: senderProf?.display_name || senderProf?.handle || 'You',
            senderAvatar: avatarUrl,
            content: cleanContent,
            createdAt: inserted.created_at,
          };

          return NextResponse.json({ success: true, message });
        }
      } catch (err) {
        console.warn('Supabase message post error:', err);
      }
    }

    // Local DB fallback for isolated tests
    const conversation = db.getConversationById(params.id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.participantIds.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const otherId = conversation.participantIds.find(id => id !== user.id);
    if (otherId && db.isBlocked(user.id, otherId)) {
      return NextResponse.json({ error: 'Cannot send message to a blocked user' }, { status: 403 });
    }

    const message = db.createMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: conversation.id,
      senderId: user.id,
      senderName: user.displayName || user.username,
      senderAvatar: user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user',
      content: cleanContent,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
