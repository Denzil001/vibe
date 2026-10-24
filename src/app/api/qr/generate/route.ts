import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { type, targetId, label, expiresInHours } = body;

    if (!type || !['public_entry', 'journey_join', 'group_join'].includes(type)) {
      return NextResponse.json({ error: 'Valid QR token type is required.' }, { status: 400 });
    }

    const tokenRecord = db.createQRToken({
      type,
      targetId,
      label,
      expiresInHours: expiresInHours || 72,
      createdBy: user.id,
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const joinUrl = `${protocol}://${host}/join?token=${tokenRecord.token}`;

    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return NextResponse.json({
      success: true,
      token: tokenRecord,
      joinUrl,
      qrDataUrl,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('QR generate error:', error);
    return NextResponse.json({ error: 'Failed to generate QR pass.' }, { status: 500 });
  }
}
