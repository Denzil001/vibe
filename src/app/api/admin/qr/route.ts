import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireModerator } from '@/lib/auth';

export async function GET() {
  try {
    await requireModerator();
    const tokens = db.getQRTokens();
    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Moderator privileges required' }, { status: 403 });
    }
    console.error('Fetch QR tokens error:', error);
    return NextResponse.json({ error: 'Failed to retrieve QR tokens' }, { status: 500 });
  }
}
