import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Group } from '@/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const allGroups = db.getGroups();
    
    // Add isMember flag for the current user
    const groupsWithStatus = allGroups.map(g => ({
      ...g,
      isMember: db.isGroupMember(g.id, user.id),
    }));

    return NextResponse.json({ groups: groupsWithStatus });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { name, description, category, trainNumber, rules } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Group name, description, and category are required.' },
        { status: 400 }
      );
    }

    if (name.trim().length < 3 || name.trim().length > 60) {
      return NextResponse.json(
        { error: 'Group name must be between 3 and 60 characters.' },
        { status: 400 }
      );
    }

    const defaultRules = [
      'Be polite, constructive, and respectful.',
      'Never share coach berths, seat numbers, or personal phone numbers publicly.',
      'No commercial promotions, spam, or disruptive behavior.',
      'Report any safety concerns or harassment immediately.',
    ];

    const newGroup: Group = {
      id: `grp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name.trim(),
      description: description.trim().slice(0, 300),
      category,
      trainNumber: trainNumber ? String(trainNumber).trim().toUpperCase() : undefined,
      rules: Array.isArray(rules) && rules.length > 0 ? rules : defaultRules,
      createdBy: user.id,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    db.createGroup(newGroup);
    db.awardBadge(user.id, 'community_member');

    return NextResponse.json({
      success: true,
      group: { ...newGroup, isMember: true },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
