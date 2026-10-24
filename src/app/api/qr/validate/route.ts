import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, error: 'QR token string is required.' }, { status: 400 });
    }

    const res = db.validateQRToken(token.trim());
    if (!res.valid) {
      return NextResponse.json({ valid: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      qrToken: {
        id: res.qrToken?.id,
        type: res.qrToken?.type,
        label: res.qrToken?.label,
        expiresAt: res.qrToken?.expiresAt,
      },
      targetJourney: res.targetJourney,
      targetGroup: res.targetGroup,
    });
  } catch (error) {
    console.error('QR validate error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate QR token.' }, { status: 500 });
  }
}
