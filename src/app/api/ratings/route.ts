import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { submitRating, isUserPermanentlyBanned, getActiveJourney } from '@/lib/compartment-db';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({
        error: 'Your account is permanently restricted from participating in community ratings.',
      }, { status: 403 });
    }

    const body = await req.json();
    const { journeyId, roomId, targetUserId, ratingType } = body;

    if (!roomId || !targetUserId || !ratingType) {
      return NextResponse.json({
        error: 'roomId, targetUserId, and ratingType (GOOD or BAD) are required.',
      }, { status: 400 });
    }

    if (ratingType !== 'GOOD' && ratingType !== 'BAD') {
      return NextResponse.json({
        error: 'ratingType must be either "GOOD" (+2) or "BAD" (-2).',
      }, { status: 400 });
    }

    let effectiveJourneyId = journeyId;
    if (!effectiveJourneyId) {
      const activeJourney = await getActiveJourney();
      if (!activeJourney || activeJourney.status === 'ended') {
        return NextResponse.json({ error: 'No active journey for rating.' }, { status: 400 });
      }
      effectiveJourneyId = activeJourney.id;
    }

    const result = await submitRating({
      journeyId: effectiveJourneyId,
      roomId,
      raterId: user.id,
      targetUserId,
      ratingType,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: ratingType === 'GOOD' 
        ? 'Positive recognition recorded (+2 points).' 
        : 'Feedback recorded (-2 points).',
      newScore: result.newScore,
      isBanned: result.isBanned,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Ratings API error:', error);
    return NextResponse.json({ error: 'Internal server error recording rating.' }, { status: 500 });
  }
}
