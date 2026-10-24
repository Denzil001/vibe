import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const group = db.getGroupById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const isMember = db.isGroupMember(group.id, user.id);
    const members = db.getGroupMembers(group.id);

    return NextResponse.json({
      group: {
        ...group,
        isMember,
        memberCount: members.length,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (user.isRestricted) {
      return NextResponse.json(
        { 
          error: `Your account is under temporary interaction restriction until ${user.restrictionExpiresAt || 'expiry'} because your community score fell below 90. You cannot join new groups.` 
        },
        { status: 403 }
      );
    }

    const group = db.getGroupById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const success = db.joinGroup(group.id, user.id);
    if (success) {
      db.awardBadge(user.id, 'community_member');
    }

    return NextResponse.json({
      success,
      isMember: true,
      message: 'Joined group community successfully.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const group = db.getGroupById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const success = db.leaveGroup(group.id, user.id);
    return NextResponse.json({
      success,
      isMember: false,
      message: 'Left group successfully.',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 });
  }
}
