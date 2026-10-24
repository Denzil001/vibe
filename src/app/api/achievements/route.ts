import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db, INITIAL_BADGES } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const userBadges = db.getUserAchievements(user.id);

    const allBadgesWithStatus = INITIAL_BADGES.map(b => ({
      ...b,
      isEarned: userBadges.includes(b.key),
    }));

    return NextResponse.json({
      badges: allBadgesWithStatus,
      points: user.points || 0,
      earnedCount: userBadges.length,
      totalCount: INITIAL_BADGES.length,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
