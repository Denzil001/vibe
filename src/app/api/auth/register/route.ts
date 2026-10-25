import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, hashPassword } from '@/lib/db';
import { createSession, toSafeUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName, username, interests, languages } = body;

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Email, password, and display name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    let finalUsername = '';
    if (username && username.trim()) {
      const cleanUsername = username.trim();
      const val = db.validateUsername(cleanUsername);
      if (!val.valid) {
        return NextResponse.json({ error: val.error }, { status: 400 });
      }
      if (!db.isUsernameAvailable(cleanUsername)) {
        return NextResponse.json({ error: 'Username is already taken by another passenger.' }, { status: 409 });
      }
      finalUsername = cleanUsername;
    } else {
      finalUsername = db.generateSuggestedUsername(displayName);
    }

    let userId: string = crypto.randomUUID();
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const s = getSupabaseAdmin();
        const { data: authData, error: authErr } = await s.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: { role: 'passenger' }
        });
        if (authData?.user?.id) {
          userId = authData.user.id;
        } else if (authErr) {
          console.warn('Supabase auth create user warning:', authErr.message);
        }
      } catch (err) {
        console.warn('Supabase auth admin error, using generated UUID:', err);
      }
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: userId,
      email: email.trim().toLowerCase(),
      username: finalUsername,
      passwordHash: hashPassword(password),
      displayName: displayName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      bio: '',
      interests: Array.isArray(interests) ? interests : ['Train Travel', 'Reading'],
      skillsToShare: [],
      skillsToLearn: [],
      learningGoals: [],
      conversationTopics: ['Travel Experiences', 'Favorite Books'],
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['English', 'Hindi'],
      discoveryOptIn: true,
      profileVisibility: 'journey_only',
      role: 'passenger',
      points: 50,
      baseScore: 100,
      reputationScore: 100,
      isRestricted: false,
      badges: ['first_profile'],
      createdAt: now,
      updatedAt: now,
    };

    db.createUser(newUser);
    await createSession(newUser.id, newUser.role);

    return NextResponse.json({
      success: true,
      user: toSafeUser(newUser),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
