import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getActiveJourney, endJourney } from '@/lib/compartment-db';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const { adminSecret, journeyId } = body;

    const configuredSecret = process.env.DEMO_ADMIN_SECRET;
    const isAuthorized = 
      (user && (user.role === 'admin' || user.role === 'moderator')) ||
      (configuredSecret && adminSecret && adminSecret.trim() === configuredSecret.trim());

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Organizer admin access required.' }, { status: 403 });
    }

    let targetJourneyId = journeyId;
    if (!targetJourneyId) {
      const activeJourney = await getActiveJourney();
      if (!activeJourney) {
        return NextResponse.json({ error: 'No active journey found to end.' }, { status: 404 });
      }
      targetJourneyId = activeJourney.id;
    }

    const result = await endJourney(targetJourneyId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to end journey.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Journey successfully ended. Rooms closed and messages cleaned up.',
      journeyId: targetJourneyId,
      messagesCleanedCount: result.messagesCleanedCount,
    });
  } catch (error: any) {
    console.error('End journey error:', error);
    return NextResponse.json({ error: 'Internal server error while ending journey.' }, { status: 500 });
  }
}
