import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parseQRText, validateAndClaimPass, getActiveJourney } from '@/lib/compartment-db';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to claim a boarding pass.' }, { status: 401 });
    }

    const body = await req.json();
    const { rawQR, boardingCode, displayNameHint, journeyId } = body;

    let targetCode = (boardingCode || '').trim().toUpperCase();
    let nameHint = displayNameHint || user.displayName;

    if (rawQR && !targetCode) {
      const parsed = parseQRText(rawQR);
      if (parsed.valid && parsed.boardingCode) {
        targetCode = parsed.boardingCode;
        if (parsed.displayNameHint) nameHint = parsed.displayNameHint;
      } else {
        return NextResponse.json({ error: 'Invalid QR code payload format.' }, { status: 400 });
      }
    }

    if (!targetCode) {
      return NextResponse.json({ error: 'Boarding code is required.' }, { status: 400 });
    }

    let targetJourneyId = journeyId;
    if (!targetJourneyId) {
      const activeJourney = await getActiveJourney();
      if (!activeJourney || activeJourney.status === 'ended') {
        return NextResponse.json({ error: 'No active journey currently accepting passengers.' }, { status: 400 });
      }
      targetJourneyId = activeJourney.id;
    }

    const result = await validateAndClaimPass(user.id, targetJourneyId, targetCode, nameHint);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to claim boarding pass.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      journeyId: targetJourneyId,
      passId: result.pass?.id,
      coachLabel: 'Coach B',
    });
  } catch (error: any) {
    console.error('Board claim error:', error);
    return NextResponse.json({ error: 'Internal server error while claiming boarding pass.' }, { status: 500 });
  }
}
