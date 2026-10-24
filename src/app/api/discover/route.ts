import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPassengerMatches } from '@/lib/matching';

export async function GET() {
  try {
    const user = await requireAuth();

    // Check if user has discovery opted-in
    if (!user.discoveryOptIn) {
      return NextResponse.json({
        matches: [],
        discoveryDisabled: true,
        message: 'You currently have discovery turned off. Enable discovery in your profile to find fellow passengers.',
      });
    }

    const matches = getPassengerMatches(user.id);

    return NextResponse.json({
      matches,
      discoveryDisabled: false,
      scoringMethodology: {
        model: 'Weighted deterministic overlap model',
        factors: [
          'Same train & travel date (+30 pts)',
          'Shared interests overlap (+25 pts)',
          'Skill teaching/learning synergy (+20 pts)',
          'Preferred conversation topics (+10 pts)',
          'Shared conversational languages (+10 pts)',
          'Learning goals compatibility (+5 pts)'
        ],
        disclaimer: 'Compatibility scores reflect user-provided preferences and do not verify passenger identity, background, or safety.',
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to retrieve passenger matches' }, { status: 500 });
  }
}
