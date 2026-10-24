import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Report, ReportCategory } from '@/types';

export async function GET() {
  try {
    const user = await requireAuth();
    // Return reports filed by this user
    const reports = db.getReports().filter(r => r.reporterId === user.id);
    return NextResponse.json({ reports });
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

    const {
      reportedUserId,
      reportedGroupId,
      reportedMessageId,
      category,
      reason,
    } = body;

    const validCategories: ReportCategory[] = [
      'harassment',
      'spam',
      'abusive',
      'unwanted_contact',
      'inappropriate_content',
      'impersonation',
      'other',
    ];

    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'A valid report category is required.' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a clear description of the issue (at least 5 characters).' },
        { status: 400 }
      );
    }

    const report: Report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      reporterId: user.id,
      reportedUserId: reportedUserId || null,
      reportedGroupId: reportedGroupId || null,
      reportedMessageId: reportedMessageId || null,
      category,
      reason: reason.trim().slice(0, 1000),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.createReport(report);

    // If report targeted a user, also offer automatic block
    if (reportedUserId) {
      db.addBlock(user.id, reportedUserId);
    }

    return NextResponse.json({
      success: true,
      report,
      message: 'Report submitted for moderation review. The reported user has also been automatically blocked from contacting you.',
      safetyNotice: 'Important: In case of immediate safety threats or criminal emergencies on a train, please alert onboard TTE/RPF staff or dial RailMadad at 139 directly.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
