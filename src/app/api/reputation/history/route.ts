import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    db.checkAndExpireRestrictions();
    const history = db.getScoreHistory(user.id);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Reputation history error:', error);
    return NextResponse.json({ error: 'Failed to fetch reputation history.' }, { status: 500 });
  }
}
