import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireModerator } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireModerator();
    const body = await req.json();
    const { tokenId } = body;

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required.' }, { status: 400 });
    }

    const success = db.revokeQRToken(tokenId);
    if (!success) {
      return NextResponse.json({ error: 'Token not found or already revoked.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'QR pass token has been revoked immediately.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Moderator privileges required' }, { status: 403 });
    }
    console.error('Revoke QR token error:', error);
    return NextResponse.json({ error: 'Failed to revoke QR token' }, { status: 500 });
  }
}
