import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Journey } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { targetUserId, journeyId, voteType, reasonCategory } = body;

    if (!targetUserId || !journeyId || !voteType) {
      return NextResponse.json(
        { error: 'Target passenger ID, journey ID, and feedback type are required.' },
        { status: 400 }
      );
    }

    if (voteType !== 'positive' && voteType !== 'negative') {
      return NextResponse.json(
        { error: 'Feedback type must be either "positive" (+2) or "negative" (-2).' },
        { status: 400 }
      );
    }

    if (user.id === targetUserId) {
      return NextResponse.json(
        { error: 'You cannot submit feedback for your own profile.' },
        { status: 400 }
      );
    }

    // Check voter restriction
    if (user.isRestricted) {
      return NextResponse.json(
        { error: 'Your account is under temporary interaction restriction. Feedback submission is disabled.' },
        { status: 403 }
      );
    }

    // Verify journey context
    const voterJourneys: Journey[] = db.getJourneysByUser(user.id);
    const targetJourneys: Journey[] = db.getJourneysByUser(targetUserId);

    // Either journeyId matches directly or they share the same train and travel date
    const targetJourney = targetJourneys.find((j: Journey) => j.id === journeyId) || targetJourneys[0];
    const voterJourney = voterJourneys.find((j: Journey) => j.id === journeyId) || 
      voterJourneys.find((j: Journey) => targetJourney && j.trainNumber === targetJourney.trainNumber && j.travelDate === targetJourney.travelDate);

    if (!voterJourney || !targetJourney) {
      return NextResponse.json(
        { error: 'You may only submit feedback for passengers who shared your verified or entered train journey context.' },
        { status: 403 }
      );
    }

    const effectiveJourneyId = targetJourney.id;

    const res = db.createScoreEvent({
      journeyId: effectiveJourneyId,
      voterUserId: user.id,
      targetUserId,
      voteType,
      reasonCategory,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: voteType === 'positive' 
        ? 'Positive interaction recorded (+2 reputation points). Thank you for fostering a welcoming train community!'
        : 'Constructive interaction feedback recorded (-2 reputation points).',
      newScore: res.newScore,
      isRestricted: res.isRestricted,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Reputation vote error:', error);
    return NextResponse.json({ error: 'Failed to record passenger feedback.' }, { status: 500 });
  }
}
