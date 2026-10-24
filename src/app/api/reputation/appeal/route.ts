import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { userExplanation, restrictionId, scoreEventId } = body;

    if (!userExplanation || userExplanation.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a clear explanation for your appeal (minimum 10 characters).' },
        { status: 400 }
      );
    }

    const appeal = db.submitAppeal(user.id, userExplanation.trim(), restrictionId, scoreEventId);

    return NextResponse.json({
      success: true,
      message: 'Your appeal has been submitted for review by the VIBE community moderation team.',
      appeal,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Reputation appeal error:', error);
    return NextResponse.json({ error: 'Failed to submit appeal.' }, { status: 500 });
  }
}
