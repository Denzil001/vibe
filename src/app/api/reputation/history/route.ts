import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const s = getSupabaseAdmin();
        const { data: profile } = await s
          .from('profiles')
          .select('reputation_points, chats_banned_at, ban_reason')
          .eq('id', user.id)
          .maybeSingle();

        const { data: ratings } = await s
          .from('ratings')
          .select('id, journey_id, room_id, rating_type, points_delta, created_at, journeys(name, code)')
          .eq('rated_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        const events = (ratings || []).map(r => ({
          id: r.id,
          journeyName: (r as any).journeys?.name || 'Journey',
          ratingType: r.rating_type,
          delta: r.points_delta,
          pointDelta: r.points_delta,
          description: r.rating_type === 'GOOD' ? 'Received Positive Recognition' : 'Received Critical Conduct Rating',
          createdAt: r.created_at,
        }));

        const currentScore = profile?.reputation_points ?? 0;
        const isBanned = !!profile?.chats_banned_at || currentScore < -50;

        return NextResponse.json({
          success: true,
          history: {
            currentScore,
            isBanned,
            banReason: profile?.ban_reason || null,
            events,
          },
        });
      } catch (err) {
        console.warn('Supabase reputation history fallback to local db:', err);
      }
    }

    db.checkAndExpireRestrictions();
    const history = db.getScoreHistory(user.id);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Reputation history error:', error);
    return NextResponse.json({ error: 'Failed to fetch reputation history.' }, { status: 500 });
  }
}
