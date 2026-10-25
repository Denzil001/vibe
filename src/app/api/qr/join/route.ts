import { NextResponse } from 'next/server';
import { db, hashPassword } from '@/lib/db';
import { getCurrentUser, createSession, toSafeUser } from '@/lib/auth';
import { User, Journey } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, signupData } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'QR token is required.' }, { status: 400 });
    }

    const validation = db.validateQRToken(token.trim());
    if (!validation.valid || !validation.qrToken) {
      return NextResponse.json({ error: validation.error || 'Invalid QR token' }, { status: 400 });
    }

    let currentUser = await getCurrentUser();

    // If unauthenticated and signupData is provided, create the user
    if (!currentUser && signupData) {
      const { email, password, displayName, username } = signupData;
      if (!email || !password || !displayName) {
        return NextResponse.json({ error: 'Email, password, and display name are required for new passenger registration.' }, { status: 400 });
      }

      if (db.getUserByEmail(email)) {
        return NextResponse.json({ error: 'An account with this email address already exists. Please login instead.' }, { status: 409 });
      }

      const cleanUsername = username?.trim() || db.generateSuggestedUsername(displayName);
      const val = db.validateUsername(cleanUsername);
      if (!val.valid) {
        return NextResponse.json({ error: val.error }, { status: 400 });
      }
      if (!db.isUsernameAvailable(cleanUsername)) {
        return NextResponse.json({ error: 'Username is taken. Please select an available username.' }, { status: 409 });
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        passwordHash: hashPassword(password),
        displayName: displayName.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        bio: 'Joined via VIBE train QR onboarding.',
        interests: ['Train Travel', 'Community & AI'],
        skillsToShare: [],
        skillsToLearn: [],
        learningGoals: [],
        conversationTopics: ['Travel Experiences', 'Community Projects'],
        languages: ['English', 'Hindi'],
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
      currentUser = toSafeUser(newUser);
    }

    if (!currentUser) {
      return NextResponse.json({
        requiresAuth: true,
        message: 'Valid QR token. Please login or create a passenger username to complete joining.',
        qrToken: {
          id: validation.qrToken.id,
          type: validation.qrToken.type,
          label: validation.qrToken.label,
          targetJourney: validation.targetJourney,
          targetGroup: validation.targetGroup,
        },
      });
    }

    // Process destination join action
    let destinationRedirect = '/carriage';
    if (validation.qrToken.type === 'journey_join' && validation.targetJourney) {
      const tj = validation.targetJourney;
      // Ensure user has an active journey record for this train
      const existingJourney = db.getJourneysByUser(currentUser.id).find((j: Journey) => j.trainNumber === tj.trainNumber);
      if (!existingJourney) {
        const userJourney: Journey = {
          id: `jrn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userId: currentUser.id,
          trainNumber: tj.trainNumber,
          trainName: tj.trainName,
          travelDate: tj.travelDate,
          boardingStation: tj.boardingStation,
          destinationStation: tj.destinationStation,
          discoveryEnabled: true,
          conversationGoals: ['Connect with passengers in this coach', 'Learn something new'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.createJourney(userJourney);
      }
      destinationRedirect = '/discover';
    } else if (validation.qrToken.type === 'group_join' && validation.targetGroup) {
      db.addGroupMember(validation.targetGroup.id, currentUser.id);
      destinationRedirect = `/groups/${validation.targetGroup.id}`;
    }

    // Atomically increment token usage
    db.useQRToken(token.trim());

    return NextResponse.json({
      success: true,
      message: `Successfully boarded into ${validation.qrToken.label || 'VIBE Community'}!`,
      redirectUrl: destinationRedirect,
      user: currentUser,
    });
  } catch (error) {
    console.error('QR join error:', error);
    return NextResponse.json({ error: 'Failed to process QR pass join.' }, { status: 500 });
  }
}
