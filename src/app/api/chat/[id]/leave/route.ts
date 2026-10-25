import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { leaveRoomAndClearIfEmpty, disconnectPrivateRoom } from '@/lib/compartment-db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const roomId = params.id;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body may be empty
    }

    if (body.disconnect) {
      const discResult = await disconnectPrivateRoom(roomId, user.id);
      return NextResponse.json({
        success: true,
        roomId,
        disconnected: true,
        historyCleared: discResult.cleared,
      });
    }

    const result = await leaveRoomAndClearIfEmpty(roomId, user.id);

    return NextResponse.json({
      success: true,
      roomId,
      activeCount: result.activeCount,
      historyCleared: result.cleared,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Leave room error:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
