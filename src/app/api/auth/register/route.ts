import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, hashPassword } from '@/lib/db';
import { createSession, toSafeUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isHandleAvailable, validateAndClaimPass } from '@/lib/compartment-db';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName, username, interests, languages, boardingCode, journeyId } = body;

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

    const cleanEmail = email.trim().toLowerCase();
    const s = getSupabaseAdmin();

    // Check handle availability
    let finalHandle = (username || displayName.replace(/[^a-zA-Z0-9_]/g, '_')).toLowerCase().slice(0, 20);
    if (finalHandle.length < 3) finalHandle = `pass_${finalHandle}`;

    const handleOk = await isHandleAvailable(finalHandle);
    if (!handleOk) {
      finalHandle = `${finalHandle.slice(0, 15)}_${Math.floor(100 + Math.random() * 900)}`;
    }

    let userId: string = crypto.randomUUID();

    // Create user in Supabase Auth
    try {
      const { data: authData, error: authErr } = await s.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { displayName, handle: finalHandle, role: 'passenger' }
      });

      if (authErr) {
        if (authErr.message.includes('already registered') || authErr.message.includes('unique')) {
          return NextResponse.json(
            { error: 'An account with this email address already exists.' },
            { status: 409 }
          );
        }
        console.warn('Supabase auth create user warning:', authErr.message);
      } else if (authData?.user?.id) {
        userId = authData.user.id;
      }
    } catch (err: any) {
      console.warn('Supabase auth admin error:', err.message);
    }

    const now = new Date().toISOString();
    const userInterests = Array.isArray(interests) && interests.length > 0 
      ? interests 
      : ['Technology & AI', 'Music', 'Train Travel'];

    // Insert or upsert into Supabase profiles
    try {
      await s.from('profiles').upsert({
        id: userId,
        email: cleanEmail,
        handle: finalHandle,
        display_name: displayName.trim(),
        avatar: 'avatar_1',
        conversation_goal: 'Casual fun',
        interests: userInterests,
        bio: '',
        language: 'en',
        reputation_points: 0, // Starts at 0 per COMPARTMENT specification
        created_at: now,
        updated_at: now,
      }, { onConflict: 'id' });
    } catch (pErr) {
      console.error('Error creating profile in Supabase:', pErr);
    }

    // If boardingCode was provided during registration, claim it now!
    if (boardingCode && journeyId) {
      try {
        await validateAndClaimPass(userId, journeyId, boardingCode, displayName);
      } catch (claimErr) {
        console.warn('Auto-claiming boarding pass on register warning:', claimErr);
      }
    }

    // Keep local cache in sync for tests
    const newUser: User = {
      id: userId,
      email: cleanEmail,
      username: finalHandle,
      passwordHash: hashPassword(password),
      displayName: displayName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalHandle)}`,
      bio: '',
      interests: userInterests,
      skillsToShare: [],
      skillsToLearn: [],
      learningGoals: [],
      conversationTopics: ['Casual fun'],
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['en'],
      discoveryOptIn: true,
      profileVisibility: 'journey_only',
      role: 'passenger',
      points: 0,
      baseScore: 0,
      reputationScore: 0,
      isRestricted: false,
      badges: ['first_profile'],
      createdAt: now,
      updatedAt: now,
    };

    try {
      db.createUser(newUser);
    } catch {
      // ignore in case db already had it
    }

    await createSession(userId, 'passenger');

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
