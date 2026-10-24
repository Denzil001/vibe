import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActivityAttempt } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { activityId, score, maxScore } = body;

    if (!activityId || typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json({ error: 'Valid activityId, score, and maxScore are required.' }, { status: 400 });
    }

    const calculatedPoints = Math.round((score / Math.max(1, maxScore)) * 50);

    const attempt: ActivityAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      activityId,
      score,
      maxScore,
      pointsEarned: calculatedPoints,
      completedAt: new Date().toISOString(),
    };

    db.recordActivityAttempt(attempt);

    // Award badges based on activity milestones
    const percentage = (score / Math.max(1, maxScore)) * 100;
    const badgesAwarded: string[] = [];

    if (activityId === 'quiz_railways_gk' && percentage >= 80) {
      if (db.awardBadge(user.id, 'quiz_master')) {
        badgesAwarded.push('quiz_master');
      }
    }

    if (activityId === 'lang_hindi_english' && percentage >= 60) {
      if (db.awardBadge(user.id, 'language_learner')) {
        badgesAwarded.push('language_learner');
      }
    }

    const updatedUser = db.getUserById(user.id);

    return NextResponse.json({
      success: true,
      pointsEarned: calculatedPoints,
      totalPoints: updatedUser?.points || 0,
      badgesAwarded,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to record attempt.' }, { status: 500 });
  }
}
