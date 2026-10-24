import { NextResponse } from 'next/server';
import { requireAuth, toSafeUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();

    const allowedUpdates = [
      'displayName',
      'avatarUrl',
      'bio',
      'interests',
      'skillsToShare',
      'skillsToLearn',
      'learningGoals',
      'conversationTopics',
      'languages',
      'discoveryOptIn',
      'profileVisibility',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // Input validations
    if (updates.displayName !== undefined) {
      if (typeof updates.displayName !== 'string' || updates.displayName.trim().length < 2) {
        return NextResponse.json({ error: 'Display name must be at least 2 characters.' }, { status: 400 });
      }
      updates.displayName = updates.displayName.trim();
    }

    if (updates.bio !== undefined) {
      updates.bio = String(updates.bio).slice(0, 500); // 500 char max limit
    }

    if (updates.profileVisibility && !['public', 'journey_only', 'private'].includes(updates.profileVisibility)) {
      return NextResponse.json({ error: 'Invalid profile visibility value.' }, { status: 400 });
    }

    if (body.username !== undefined && body.username.trim() !== currentUser.username) {
      const uRes = db.updateUsername(currentUser.id, body.username);
      if (!uRes.success) {
        return NextResponse.json({ error: uRes.error }, { status: 400 });
      }
    }

    const updated = db.updateUser(currentUser.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: toSafeUser(updated),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
