import { NextResponse } from 'next/server';
import { requireAuth, clearSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const user = await requireAuth();

    // Delete user and associated journeys, memberships, blocks
    db.deleteUser(user.id);
    await clearSession();

    return NextResponse.json({
      success: true,
      message: 'Account and associated personal journey data successfully deleted.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
