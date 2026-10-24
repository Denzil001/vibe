import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireModerator } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const mod = await requireModerator();
    const body = await req.json();
    const { eventId, reason } = body;

    if (!eventId || !reason) {
      return NextResponse.json({ error: 'Score event ID and justifiable audit reason are required.' }, { status: 400 });
    }

    const res = db.reverseScoreEvent(eventId, mod.id, reason.trim());
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Score event successfully reversed and reconciled in the reputation ledger.',
      newScore: res.newScore,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Moderator privileges required' }, { status: 403 });
    }
    console.error('Reverse score event error:', error);
    return NextResponse.json({ error: 'Failed to reverse score event' }, { status: 500 });
  }
}
