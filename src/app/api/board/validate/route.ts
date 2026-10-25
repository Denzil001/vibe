import { NextResponse } from 'next/server';
import { parseQRText, hashBoardingCode, getActiveJourney } from '@/lib/compartment-db';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rawQR } = body;

    if (!rawQR || typeof rawQR !== 'string') {
      return NextResponse.json({ valid: false, error: 'QR text is required.' }, { status: 400 });
    }

    const parsed = parseQRText(rawQR);
    if (!parsed.valid || !parsed.boardingCode) {
      return NextResponse.json({
        valid: false,
        displayNameHint: parsed.displayNameHint,
        error: 'Unrecognized food QR format. Expected passenger name and boarding code (e.g., Aaromal S VT008M2).'
      }, { status: 400 });
    }

    const journey = await getActiveJourney();
    if (!journey || journey.status === 'ended') {
      return NextResponse.json({
        valid: false,
        error: 'There is no active journey open for boarding at this time.'
      }, { status: 400 });
    }

    const codeHash = hashBoardingCode(parsed.boardingCode);
    const s = getSupabaseAdmin();
    const { data: pass } = await s
      .from('boarding_passes')
      .select('status, expires_at, display_name_hint, redeemed_by')
      .eq('journey_id', journey.id)
      .eq('code_hash', codeHash)
      .maybeSingle();

    if (pass) {
      if (pass.status === 'revoked') {
        return NextResponse.json({ valid: false, error: 'This boarding pass has been revoked by train organizers.' }, { status: 400 });
      }
      if (new Date(pass.expires_at) < new Date()) {
        return NextResponse.json({ valid: false, error: 'This boarding pass has expired.' }, { status: 400 });
      }
      if (pass.status === 'redeemed') {
        return NextResponse.json({
          valid: false,
          isAlreadyClaimed: true,
          error: 'This boarding pass has already been claimed by another passenger.'
        }, { status: 409 });
      }

      return NextResponse.json({
        valid: true,
        displayNameHint: parsed.displayNameHint || pass.display_name_hint || 'Passenger',
        journey: {
          id: journey.id,
          code: journey.code,
          name: journey.name,
        }
      });
    }

    // If boardingMode allows unverified demo claims
    const boardingMode = process.env.BOARDING_MODE || 'allowlist';
    if (boardingMode !== 'allowlist' && journey.allow_unverified_demo_claims) {
      return NextResponse.json({
        valid: true,
        displayNameHint: parsed.displayNameHint || 'Passenger',
        journey: {
          id: journey.id,
          code: journey.code,
          name: journey.name,
        },
        mode: 'first_claim_demo'
      });
    }

    return NextResponse.json({
      valid: false,
      error: 'Boarding code not found in passenger manifest. Please check with train organizer.'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Board validate error:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error while validating boarding pass.' }, { status: 500 });
  }
}
