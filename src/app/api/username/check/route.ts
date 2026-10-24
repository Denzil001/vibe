import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json({ available: false, error: 'Username query parameter is required.' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    const validation = db.validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        error: validation.error,
        suggestions: [db.generateSuggestedUsername(username), db.generateSuggestedUsername('traveller')],
      });
    }

    const isAvailable = db.isUsernameAvailable(username, currentUser?.id);
    if (!isAvailable) {
      return NextResponse.json({
        available: false,
        error: 'Username is already taken by another passenger.',
        suggestions: [
          db.generateSuggestedUsername(username),
          db.generateSuggestedUsername(username),
          db.generateSuggestedUsername('rail_vibe'),
        ],
      });
    }

    return NextResponse.json({
      available: true,
      username: username.toLowerCase(),
    });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'Failed to check username availability.' }, { status: 500 });
  }
}
