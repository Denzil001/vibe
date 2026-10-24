import { NextResponse } from 'next/server';
import { requireModerator } from '@/lib/auth';
import { db } from '@/lib/db';
import { ReportStatus } from '@/types';

export async function GET() {
  try {
    const moderator = await requireModerator();
    const reports = db.getReports();

    // Enrich reports with reporter and reported user display names
    const enriched = reports.map(r => {
      const reporter = db.getUserById(r.reporterId);
      const reportedUser = r.reportedUserId ? db.getUserById(r.reportedUserId) : null;
      const reportedGroup = r.reportedGroupId ? db.getGroupById(r.reportedGroupId) : null;

      return {
        ...r,
        reporterName: reporter?.displayName || 'Unknown Passenger',
        reportedUserName: reportedUser?.displayName || null,
        reportedGroupName: reportedGroup?.name || null,
      };
    });

    return NextResponse.json({ reports: enriched });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Access denied. Moderator privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const moderator = await requireModerator();
    const body = await req.json();
    const { reportId, status, notes, resolutionAction } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required.' }, { status: 400 });
    }

    const validStatuses: ReportStatus[] = ['pending', 'under_review', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      moderatorId: moderator.id,
      notes: notes || '',
    };

    if (status) updates.status = status;
    if (resolutionAction) updates.resolutionAction = resolutionAction;
    if (status === 'resolved' || status === 'dismissed') {
      updates.resolvedAt = new Date().toISOString();
    }

    const updated = db.updateReport(reportId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_MODERATOR_ONLY') {
      return NextResponse.json({ error: 'Access denied. Moderator privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update report.' }, { status: 500 });
  }
}
