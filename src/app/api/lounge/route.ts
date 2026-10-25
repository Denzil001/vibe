import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getActiveJourney, getJourneyLounge, isUserPermanentlyBanned } from '@/lib/compartment-db';

export async function GET() {
  try {
    const user = await requireAuth();

    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({
        isBanned: true,
        error: 'Your account is permanently restricted from the Common Lounge.',
      }, { status: 403 });
    }

    const journey = await getActiveJourney();
    if (!journey || journey.status === 'ended') {
      return NextResponse.json({ error: 'There is no active journey lounge open.' }, { status: 404 });
    }

    const lounge = await getJourneyLounge(journey.id);
    if (!lounge) {
      return NextResponse.json({ error: 'Lounge room not initialized for this journey.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      roomId: lounge.id,
      journey: {
        id: journey.id,
        code: journey.code,
        name: journey.name,
      },
      room: lounge,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Lounge API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
