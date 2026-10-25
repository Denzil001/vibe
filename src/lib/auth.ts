import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db';
import { SafeUser, User } from '@/types';

const SESSION_COOKIE_NAME = 'vibe_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'vibe_default_session_secret_2026_secure';

export function signToken(payload: { userId: string; role: string; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null; // Expired

    return payload;
  } catch (e) {
    return null;
  }
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) return null;

    const payload = verifyToken(sessionToken);
    if (!payload?.userId) return null;

    // First attempt to load profile from Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { getSupabaseAdmin } = await import('./supabase/admin');
        const s = getSupabaseAdmin();
        const { data: profile } = await s
          .from('profiles')
          .select('*')
          .eq('id', payload.userId)
          .maybeSingle();

        if (profile) {
          let email = '';
          try {
            const { data: authUser } = await s.auth.admin.getUserById(payload.userId);
            if (authUser?.user?.email) {
              email = authUser.user.email;
            }
          } catch {
            // non-fatal
          }

          const isBanned = !!profile.chats_banned_at;
          const avatarUrl = profile.avatar?.startsWith('http') 
            ? profile.avatar 
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.handle || profile.id)}`;

          const safeUser: SafeUser = {
            id: profile.id,
            email,
            username: profile.handle,
            displayName: profile.display_name || profile.handle,
            avatarUrl,
            bio: profile.bio || '',
            interests: profile.interests || [],
            skillsToShare: [],
            skillsToLearn: [],
            learningGoals: [],
            conversationTopics: [profile.conversation_goal || 'Casual chat'],
            languages: [profile.language || 'en'],
            discoveryOptIn: true,
            profileVisibility: 'journey_only',
            role: (payload.role as any) || 'passenger',
            points: profile.reputation_points ?? 0,
            baseScore: profile.reputation_points ?? 0,
            reputationScore: profile.reputation_points ?? 0,
            isRestricted: isBanned,
            restrictionReason: profile.ban_reason || undefined,
            badges: ['first_profile'],
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          };
          return safeUser;
        }
      } catch (err) {
        // Fall back to local DB if Supabase query fails
      }
    }

    db.checkAndExpireRestrictions();
    const user = db.getUserById(payload.userId);
    if (!user) return null;

    return toSafeUser(user);
  } catch (e) {
    return null;
  }
}

export async function createSession(userId: string, role: string): Promise<string> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const token = signToken({ userId, role, exp });
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return token;
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireModerator(): Promise<SafeUser> {
  const user = await requireAuth();
  if (user.role !== 'moderator' && user.role !== 'admin') {
    throw new Error('FORBIDDEN_MODERATOR_ONLY');
  }
  return user;
}
