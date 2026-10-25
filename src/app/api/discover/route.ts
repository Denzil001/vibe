import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPassengerMatches } from '@/lib/matching';
import { 
  getActiveJourney, 
  getEligibleDiscoveryCandidates, 
  getDiscoveryRequestsAndMatches,
  rankCandidatesWithAI, 
  getProfile,
  isUserPermanentlyBanned 
} from '@/lib/compartment-db';

export async function GET() {
  try {
    const user = await requireAuth();

    // Check if permanently chat-banned
    if (await isUserPermanentlyBanned(user.id)) {
      return NextResponse.json({
        matches: [],
        incomingRequests: [],
        outgoingRequests: [],
        mutualMatches: [],
        isBanned: true,
        message: 'Your account is permanently restricted from passenger discovery and chat.',
      }, { status: 403 });
    }

    const journey = await getActiveJourney();

    if (journey && journey.status === 'active') {
      const myProfile = (await getProfile(user.id)) || {
        conversation_goal: user.conversationTopics?.[0] || 'Casual fun',
        interests: user.interests || [],
        language: user.languages?.[0] || 'en',
      };

      const [eligibleCandidates, requestState] = await Promise.all([
        getEligibleDiscoveryCandidates(journey.id, user.id),
        getDiscoveryRequestsAndMatches(journey.id, user.id),
      ]);

      const ranked = await rankCandidatesWithAI(myProfile, eligibleCandidates);

      const formattedMatches = ranked.map(r => ({
        userId: r.candidate.userId,
        targetUserId: r.candidate.userId,
        score: r.score,
        matchReason: r.matchReason,
        explanation: r.matchReason,
        icebreaker: r.icebreaker,
        source: r.source,
        user: {
          id: r.candidate.userId,
          username: r.candidate.handle,
          displayName: r.candidate.displayName,
          avatarUrl: r.candidate.avatar?.startsWith('http') 
            ? r.candidate.avatar 
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(r.candidate.handle)}`,
          conversationTopics: [r.candidate.conversationGoal],
          interests: r.candidate.interests,
          languages: [r.candidate.language || 'en'],
          coachLabel: r.candidate.coachLabel || 'Coach B',
        },
        sharedInterests: r.sharedInterests || [],
      }));

      return NextResponse.json({
        matches: formattedMatches,
        incomingRequests: requestState.incomingRequests,
        outgoingRequests: requestState.outgoingRequests,
        mutualMatches: requestState.mutualMatches,
        journey: {
          id: journey.id,
          code: journey.code,
          name: journey.name,
        },
        discoveryDisabled: false,
      });
    }

    // Fallback to local matching logic for isolated offline tests
    const matches = getPassengerMatches(user.id);
    return NextResponse.json({
      matches,
      incomingRequests: [],
      outgoingRequests: [],
      mutualMatches: [],
      discoveryDisabled: false,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Discover error:', error);
    return NextResponse.json({ error: 'Failed to retrieve passenger matches' }, { status: 500 });
  }
}
