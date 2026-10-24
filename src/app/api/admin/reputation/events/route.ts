import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireModerator } from '@/lib/auth';

export async function GET() {
  try {
    await requireModerator();
    const events = db.getScoreEvents();
    return NextResponse.json({
      success: true,
      events: events.map(e => {
        const voter = db.getUserById(e.voterUserId);
        const target = db.getUserById(e.targetUserId);
        return {
          ...e,
          voterUsername: voter?.username || voter?.displayName || 'Unknown',
          targetUsername: target?.username || target?.displayName || 'Unknown',
        };
      }),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Moderator privileges required' }, { status: 403 });
    }
    console.error('Fetch score events error:', error);
    return NextResponse.json({ error: 'Failed to retrieve score events' }, { status: 500 });
  }
}
