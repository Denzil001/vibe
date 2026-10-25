import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getActiveJourney, respondToMatch, isUserPermanentlyBanned } from '@/lib/compartment-db';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({ error: 'Your account is permanently restricted from chatting.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, accept } = body;

    if (!targetUserId || typeof accept !== 'boolean') {
      return NextResponse.json({ error: 'targetUserId and boolean accept are required.' }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot match with yourself.' }, { status: 400 });
    }

    const journey = await getActiveJourney();
    if (!journey || journey.status === 'ended') {
      return NextResponse.json({ error: 'No active journey currently taking match responses.' }, { status: 400 });
    }

    const result = await respondToMatch(journey.id, user.id, targetUserId, accept);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      roomId: result.roomId,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Match respond error:', error);
    return NextResponse.json({ error: 'Internal server error processing match response.' }, { status: 500 });
  }
}
