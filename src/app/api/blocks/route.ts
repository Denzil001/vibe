import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const blocks = db.getBlocks(user.id);
    return NextResponse.json({ blocks });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { blockedUserId } = body;

    if (!blockedUserId) {
      return NextResponse.json({ error: 'Blocked user ID is required.' }, { status: 400 });
    }

    if (blockedUserId === user.id) {
      return NextResponse.json({ error: 'You cannot block your own account.' }, { status: 400 });
    }

    const blockRecord = db.addBlock(user.id, blockedUserId);

    return NextResponse.json({
      success: true,
      message: 'User has been blocked. Direct messaging and matching discovery between both accounts are now disabled.',
      block: blockRecord,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { blockedUserId } = body;

    if (!blockedUserId) {
      return NextResponse.json({ error: 'Blocked user ID is required.' }, { status: 400 });
    }

    const success = db.removeBlock(user.id, blockedUserId);

    return NextResponse.json({
      success,
      message: 'User has been unblocked.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
  }
}
