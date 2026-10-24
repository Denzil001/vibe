import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Journey } from '@/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const journey = db.getJourneyByUserId(user.id);
    return NextResponse.json({ journey });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const {
      trainNumber,
      trainName,
      travelDate,
      boardingStation,
      destinationStation,
      durationHours,
      discoveryEnabled,
      conversationGoals,
    } = body;

    if (!trainNumber || !boardingStation || !destinationStation || !travelDate) {
      return NextResponse.json(
        { error: 'Train number, travel date, boarding station, and destination station are required.' },
        { status: 400 }
      );
    }

    // Validate travel date is not in the past (before today)
    const today = new Date().toISOString().split('T')[0];
    if (travelDate < today) {
      return NextResponse.json(
        { error: 'Travel date cannot be in the past.' },
        { status: 400 }
      );
    }

    const existingJourney = db.getJourneyByUserId(user.id);
    const now = new Date().toISOString();

    const journey: Journey = {
      id: existingJourney ? existingJourney.id : `jrn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      trainNumber: String(trainNumber).trim().toUpperCase(),
      trainName: (trainName || `Train ${trainNumber}`).trim(),
      travelDate,
      boardingStation: boardingStation.trim(),
      destinationStation: destinationStation.trim(),
      durationHours: durationHours ? Number(durationHours) : undefined,
      discoveryEnabled: discoveryEnabled !== undefined ? Boolean(discoveryEnabled) : true,
      conversationGoals: Array.isArray(conversationGoals) ? conversationGoals : [],
      status: 'active',
      createdAt: existingJourney ? existingJourney.createdAt : now,
      updatedAt: now,
    };

    db.saveJourney(journey);
    db.awardBadge(user.id, 'first_journey');

    return NextResponse.json({
      success: true,
      journey,
      notice: 'Journey details saved. Note: Details are user-provided and voluntary; they are not linked to live IRCTC booking records.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to save journey' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    const journey = db.getJourneyByUserId(user.id);
    if (journey) {
      db.deleteJourney(journey.id);
    }
    return NextResponse.json({ success: true, message: 'Journey ended successfully.' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to end journey' }, { status: 500 });
  }
}
