import { NextResponse } from 'next/server';
import { db, hashPassword } from '@/lib/db';
import { createSession, toSafeUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const { data: authData, error: authErr } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authData?.user && !authErr) {
          const userId = authData.user.id;
          const s = getSupabaseAdmin();
          const { data: profile } = await s
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          await createSession(userId, 'passenger');

          const avatarUrl = profile?.avatar?.startsWith('http') 
            ? profile.avatar 
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile?.handle || userId)}`;

          return NextResponse.json({
            success: true,
            user: {
              id: userId,
              email: cleanEmail,
              username: profile?.handle || cleanEmail.split('@')[0],
              displayName: profile?.display_name || profile?.handle || 'Passenger',
              avatarUrl,
              bio: profile?.bio || '',
              interests: profile?.interests || [],
              skillsToShare: [],
              skillsToLearn: [],
              learningGoals: [],
              conversationTopics: [profile?.conversation_goal || 'Casual fun'],
              languages: [profile?.language || 'en'],
              discoveryOptIn: true,
              profileVisibility: 'journey_only',
              role: 'passenger',
              points: profile?.reputation_points ?? 0,
              baseScore: profile?.reputation_points ?? 0,
              reputationScore: profile?.reputation_points ?? 0,
              isRestricted: !!profile?.chats_banned_at,
              restrictionReason: profile?.ban_reason,
              badges: ['first_profile'],
              createdAt: profile?.created_at || new Date().toISOString(),
              updatedAt: profile?.updated_at || new Date().toISOString(),
            },
          });
        }
      } catch (sbErr) {
        console.warn('Supabase sign-in fallback attempt:', sbErr);
      }
    }

    // 2. Fallback to local DB (for offline test suite)
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    await createSession(user.id, user.role);

    return NextResponse.json({
      success: true,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
