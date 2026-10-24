import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireModerator } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const mod = await requireModerator();
    const appealId = params.id;
    const body = await req.json();
    const { decision, notes } = body;

    if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
      return NextResponse.json({ error: 'Valid decision ("approved" or "rejected") is required.' }, { status: 400 });
    }

    const res = db.decideAppeal(appealId, decision, notes || '', mod.id);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Appeal has been ${decision}. Audit record updated.`,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Moderator privileges required' }, { status: 403 });
    }
    console.error('Decide appeal error:', error);
    return NextResponse.json({ error: 'Failed to process appeal decision' }, { status: 500 });
  }
}
