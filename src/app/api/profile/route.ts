import { NextResponse } from 'next/server';
import { requireAuth, toSafeUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isHandleAvailable } from '@/lib/compartment-db';

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

    const allowedFields = [
      'displayName',
      'handle',
      'username',
      'avatar',
      'avatarUrl',
      'bio',
      'interests',
      'conversationGoal',
      'conversationTopics',
      'language',
      'languages',
      'discoveryOptIn',
      'profileVisibility',
    ];

    // Sanitize and validate inputs
    const newDisplayName = (body.displayName || '').trim();
    if (body.displayName !== undefined && newDisplayName.length < 2) {
      return NextResponse.json({ error: 'Display name must be at least 2 characters.' }, { status: 400 });
    }

    const requestedHandle = (body.handle || body.username || '').trim().toLowerCase();
    if (requestedHandle && requestedHandle !== currentUser.username.toLowerCase()) {
      const available = await isHandleAvailable(requestedHandle, currentUser.id);
      if (!available) {
        return NextResponse.json({ error: 'This handle is invalid or already taken.' }, { status: 409 });
      }
    }

    const conversationGoal = body.conversationGoal || (Array.isArray(body.conversationTopics) ? body.conversationTopics[0] : 'Casual fun');
    const interests = Array.isArray(body.interests) ? body.interests : currentUser.interests;
    const avatar = body.avatar || body.avatarUrl || currentUser.avatarUrl;
    const language = body.language || (Array.isArray(body.languages) ? body.languages[0] : 'en');
    const bio = typeof body.bio === 'string' ? body.bio.slice(0, 500) : currentUser.bio;

    // Update in Supabase profiles
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const s = getSupabaseAdmin();
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (newDisplayName) updatePayload.display_name = newDisplayName;
        if (requestedHandle) updatePayload.handle = requestedHandle;
        if (avatar) updatePayload.avatar = avatar;
        if (conversationGoal) updatePayload.conversation_goal = conversationGoal;
        if (interests) updatePayload.interests = interests;
        if (bio !== undefined) updatePayload.bio = bio;
        if (language) updatePayload.language = language;

        await s.from('profiles').update(updatePayload).eq('id', currentUser.id);
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }

    // Update local DB cache for tests
    const localUpdates: Record<string, any> = {};
    if (newDisplayName) localUpdates.displayName = newDisplayName;
    if (requestedHandle) localUpdates.username = requestedHandle;
    if (avatar) localUpdates.avatarUrl = avatar;
    if (bio !== undefined) localUpdates.bio = bio;
    if (interests) localUpdates.interests = interests;
    if (conversationGoal) localUpdates.conversationTopics = [conversationGoal];

    const updated = db.updateUser(currentUser.id, localUpdates);

    return NextResponse.json({
      success: true,
      user: {
        ...currentUser,
        displayName: newDisplayName || currentUser.displayName,
        username: requestedHandle || currentUser.username,
        avatarUrl: avatar || currentUser.avatarUrl,
        bio: bio !== undefined ? bio : currentUser.bio,
        interests: interests || currentUser.interests,
        conversationTopics: [conversationGoal || 'Casual fun'],
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
