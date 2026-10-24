import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, toSafeUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { newUsername } = body;

    if (!newUsername || typeof newUsername !== 'string') {
      return NextResponse.json({ error: 'New username is required.' }, { status: 400 });
    }

    const res = db.updateUsername(user.id, newUsername);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Username updated successfully. Your journey scores, history, and records remain intact.',
      user: toSafeUser(res.user!),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Username update error:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}
