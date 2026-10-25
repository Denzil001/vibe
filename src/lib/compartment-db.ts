import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

const BOARDING_PEPPER = process.env.BOARDING_CODE_PEPPER || '9c9e9f750d5e3bae9b1e21a529863f51fb36f15c49088d4a8eb4136ab90404b3';

export function parseQRText(rawText: string): { displayNameHint: string; boardingCode: string; valid: boolean } {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    return { displayNameHint: '', boardingCode: '', valid: false };
  }

  // Known format: "Aaromal S VT008M2" -> displayNameHint: "Aaromal S", boardingCode: "VT008M2"
  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 2) {
    const boardingCode = tokens[tokens.length - 1].toUpperCase();
    const displayNameHint = tokens.slice(0, tokens.length - 1).join(' ');
    // Boarding code is alphanumeric, 4 to 12 chars
    const isValidCode = /^[A-Z0-9]{4,12}$/.test(boardingCode);
    return {
      displayNameHint,
      boardingCode,
      valid: isValidCode,
    };
  }

  if (tokens.length === 1 && /^[A-Z0-9]{4,12}$/i.test(tokens[0])) {
    return {
      displayNameHint: 'Passenger',
      boardingCode: tokens[0].toUpperCase(),
      valid: true,
    };
  }

  return { displayNameHint: trimmed, boardingCode: '', valid: false };
}

export function hashBoardingCode(code: string): string {
  return crypto
    .createHmac('sha256', BOARDING_PEPPER)
    .update(code.trim().toUpperCase())
    .digest('hex');
}

export const RESERVED_HANDLES = [
  'admin', 'administrator', 'moderator', 'mod', 'railway', 'indianrailways',
  'irctc', 'railmadad', 'police', 'rpf', 'grp', 'security', 'official',
  'helpdesk', 'support', 'vibe', 'compartment', 'system', 'root', 'bot'
];

export async function isHandleAvailable(handle: string, excludeUserId?: string): Promise<boolean> {
  const clean = handle.trim().toLowerCase();
  if (clean.length < 3 || clean.length > 20) return false;
  if (!/^[a-z0-9_]+$/.test(clean)) return false;
  if (RESERVED_HANDLES.includes(clean)) return false;

  const s = getSupabaseAdmin();
  let query = s.from('profiles').select('id').ilike('handle', clean);
  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }
  const { data } = await query;
  return !data || data.length === 0;
}

export async function getActiveJourney(): Promise<any | null> {
  const s = getSupabaseAdmin();
  const code = process.env.NEXT_PUBLIC_DEFAULT_JOURNEY_CODE || 'HACK-EXP-01';
  const { data } = await s
    .from('journeys')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (data) return data;

  // Fallback to any active journey
  const { data: anyActive } = await s
    .from('journeys')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return anyActive || null;
}

export async function getJourneyLounge(journeyId: string): Promise<any | null> {
  const s = getSupabaseAdmin();
  const { data } = await s
    .from('rooms')
    .select('*')
    .eq('journey_id', journeyId)
    .eq('type', 'lounge')
    .maybeSingle();
  return data || null;
}

export async function getProfile(userId: string): Promise<any | null> {
  const s = getSupabaseAdmin();
  const { data } = await s
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data || null;
}

export async function isUserPermanentlyBanned(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  if (!profile) return false;
  return !!profile.chats_banned_at || (typeof profile.reputation_points === 'number' && profile.reputation_points < -50);
}

export async function validateAndClaimPass(
  userId: string,
  journeyId: string,
  rawCode: string,
  displayNameHint?: string
): Promise<{ success: boolean; error?: string; pass?: any }> {
  const s = getSupabaseAdmin();
  const code = rawCode.trim().toUpperCase();
  const codeHash = hashBoardingCode(code);
  const boardingMode = process.env.BOARDING_MODE || 'allowlist';

  // Check if this user already claimed a pass on this journey
  const { data: existingUserClaim } = await s
    .from('boarding_passes')
    .select('*')
    .eq('journey_id', journeyId)
    .eq('redeemed_by', userId)
    .maybeSingle();

  if (existingUserClaim) {
    // Safely re-admit same user
    await ensureJourneyParticipant(journeyId, userId, existingUserClaim.verification_source);
    return { success: true, pass: existingUserClaim };
  }

  // Look up pass by code hash
  const { data: pass } = await s
    .from('boarding_passes')
    .select('*')
    .eq('journey_id', journeyId)
    .eq('code_hash', codeHash)
    .maybeSingle();

  if (pass) {
    if (pass.status === 'redeemed') {
      if (pass.redeemed_by === userId) {
        await ensureJourneyParticipant(journeyId, userId, pass.verification_source);
        return { success: true, pass };
      }
      return { success: false, error: 'This boarding QR code has already been claimed by another passenger.' };
    }
    if (pass.status === 'revoked') {
      return { success: false, error: 'This boarding pass has been revoked by train organizers.' };
    }
    if (new Date(pass.expires_at) < new Date()) {
      return { success: false, error: 'This boarding pass has expired.' };
    }

    // Atomically claim available pass
    const now = new Date().toISOString();
    const { data: updatedPass, error: updateErr } = await s
      .from('boarding_passes')
      .update({
        status: 'redeemed',
        redeemed_by: userId,
        claimed_at: now,
      })
      .eq('id', pass.id)
      .eq('status', 'available')
      .select()
      .maybeSingle();

    if (updateErr || !updatedPass) {
      return { success: false, error: 'Failed to claim pass. It may have just been claimed by another passenger.' };
    }

    await ensureJourneyParticipant(journeyId, userId, pass.verification_source);
    return { success: true, pass: updatedPass };
  }

  // If not found in allowlist, check if unverified first claim demo mode is enabled
  if (boardingMode !== 'allowlist') {
    const journey = await getActiveJourney();
    if (journey?.allow_unverified_demo_claims) {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      const { data: newPass, error: createErr } = await s
        .from('boarding_passes')
        .insert({
          journey_id: journeyId,
          code_hash: codeHash,
          display_name_hint: displayNameHint || 'Passenger',
          status: 'redeemed',
          verification_source: 'unverified_first_claim',
          expires_at: expiresAt,
          redeemed_by: userId,
          claimed_at: now,
        })
        .select()
        .single();

      if (createErr) {
        return { success: false, error: 'Boarding code has already been claimed.' };
      }

      await ensureJourneyParticipant(journeyId, userId, 'unverified_first_claim');
      return { success: true, pass: newPass };
    }
  }

  return { success: false, error: 'Invalid boarding code. Not found in passenger manifest.' };
}

export async function ensureJourneyParticipant(
  journeyId: string,
  userId: string,
  verificationSource: string = 'organizer_allowlist'
): Promise<any> {
  const s = getSupabaseAdmin();
  const { data: existing } = await s
    .from('journey_participants')
    .select('*')
    .eq('journey_id', journeyId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.status !== 'active') {
      await s.from('journey_participants').update({ status: 'active', left_at: null }).eq('id', existing.id);
    }
    return existing;
  }

  const { data: created } = await s
    .from('journey_participants')
    .insert({
      journey_id: journeyId,
      user_id: userId,
      status: 'active',
      is_discoverable: true,
      availability_status: 'open_to_chat',
      verification_source: verificationSource,
      coach_label: 'Coach B',
    })
    .select()
    .single();

  return created;
}

export async function areUsersBlocked(userA: string, userB: string): Promise<boolean> {
  const s = getSupabaseAdmin();
  const { data } = await s
    .from('blocks')
    .select('id')
    .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`)
    .limit(1);
  return !!(data && data.length > 0);
}

export async function getEligibleDiscoveryCandidates(
  journeyId: string,
  userId: string
): Promise<any[]> {
  const s = getSupabaseAdmin();

  // Banned users cannot discover
  if (await isUserPermanentlyBanned(userId)) {
    return [];
  }

  // Fetch all active, discoverable participants on this journey
  const { data: participants } = await s
    .from('journey_participants')
    .select('user_id, coach_label, profiles(*)')
    .eq('journey_id', journeyId)
    .eq('status', 'active')
    .eq('is_discoverable', true)
    .neq('user_id', userId);

  if (!participants || participants.length === 0) return [];

  // Filter out:
  // 1. Permanently chat-banned users
  // 2. Users blocked in either direction
  // 3. Users already in active mutual chat or declined matches
  const { data: existingMatches } = await s
    .from('match_suggestions')
    .select('user_a_id, user_b_id, status, user_a_response, user_b_response')
    .eq('journey_id', journeyId)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

  const skippedOrAcceptedUserIds = new Set<string>();
  (existingMatches || []).forEach(m => {
    const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
    const myResponse = m.user_a_id === userId ? m.user_a_response : m.user_b_response;
    const otherResponse = m.user_a_id === userId ? m.user_b_response : m.user_a_response;
    if (
      m.status === 'mutual_accepted' ||
      m.status === 'blocked' ||
      m.status === 'declined' ||
      myResponse === 'declined' ||
      myResponse === 'accepted' ||
      otherResponse === 'accepted'
    ) {
      skippedOrAcceptedUserIds.add(otherId);
    }
  });

  const eligible: any[] = [];
  for (const p of participants) {
    const otherId = p.user_id;
    const profile = (p as any).profiles;
    if (!profile || profile.chats_banned_at) continue;
    if (skippedOrAcceptedUserIds.has(otherId)) continue;
    if (await areUsersBlocked(userId, otherId)) continue;

    eligible.push({
      userId: otherId,
      handle: profile.handle,
      displayName: profile.display_name,
      avatar: profile.avatar,
      conversationGoal: profile.conversation_goal,
      interests: profile.interests || [],
      bio: profile.bio || '',
      language: profile.language || 'en',
      coachLabel: p.coach_label,
    });
  }

  return eligible;
}

export async function rankCandidatesWithAI(
  myProfile: any,
  candidates: any[]
): Promise<any[]> {
  if (!candidates || candidates.length === 0) return [];

  // Deterministic scoring fallback
  const scored = candidates.map(c => {
    let score = 0;
    const sharedInterests = (myProfile.interests || []).filter((i: string) =>
      (c.interests || []).includes(i)
    );
    score += Math.min(40, sharedInterests.length * 15);

    if (myProfile.conversation_goal === c.conversationGoal) {
      score += 35;
    } else {
      score += 15;
    }

    if (myProfile.language === c.language) {
      score += 10;
    }

    score += 15; // Novelty

    let reason = sharedInterests.length > 0
      ? `Both interested in ${sharedInterests.slice(0, 2).join(' and ')}.`
      : `Both traveling with compatible journey focus on ${c.conversationGoal}.`;

    let icebreaker = `Ask @${c.handle} about their favorite project or interest in ${c.interests[0] || c.conversationGoal}!`;

    return {
      candidate: c,
      score: Math.min(100, score),
      sharedInterests,
      matchReason: reason,
      icebreaker,
      source: 'deterministic_fallback' as 'deterministic_fallback' | 'ai_gemini',
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // If Gemini API is available, enhance the top candidates with AI explanation
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('AQ.placeholder') || candidates.length === 0) {
    return scored;
  }

  try {
    const topCandidates = scored.slice(0, 5);
    const prompt = `You are the COMPARTMENT train social matchmaking assistant.
User Profile:
- Goal: ${myProfile.conversation_goal}
- Interests: ${(myProfile.interests || []).join(', ')}

Candidates:
${topCandidates.map((tc, idx) => `[${idx}] Handle: @${tc.candidate.handle}, Goal: ${tc.candidate.conversationGoal}, Interests: ${tc.candidate.interests.join(', ')}`).join('\n')}

For each candidate, return a JSON array of objects with:
- "index": number
- "score": number (compatibility score 50 to 99)
- "matchReason": short 1-sentence friendly explanation of why they make a great train conversation partner
- "icebreaker": friendly 1-sentence conversation starter question

Return ONLY raw JSON array.`;

    const modelsToTry = Array.from(
      new Set([process.env.GEMINI_MODEL || 'gemini-2.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'])
    );

    for (const modelName of modelsToTry) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (typeof item.index === 'number' && topCandidates[item.index]) {
                if (typeof item.score === 'number' && item.score >= 1 && item.score <= 100) {
                  topCandidates[item.index].score = Math.round(item.score);
                }
                if (typeof item.matchReason === 'string' && item.matchReason.trim()) {
                  topCandidates[item.index].matchReason = item.matchReason.trim();
                }
                if (typeof item.icebreaker === 'string' && item.icebreaker.trim()) {
                  topCandidates[item.index].icebreaker = item.icebreaker.trim();
                }
                topCandidates[item.index].source = 'ai_gemini';
              }
            });
            scored.sort((a, b) => b.score - a.score);
          }
        }
        break;
      }
    }
  } catch (err) {
    // Graceful fallback to deterministic reasons
  }

  return scored;
}

export async function respondToMatch(
  journeyId: string,
  userId: string,
  targetUserId: string,
  accept: boolean
): Promise<{ status: string; roomId?: string; error?: string }> {
  const s = getSupabaseAdmin();

  if (await isUserPermanentlyBanned(userId) || await isUserPermanentlyBanned(targetUserId)) {
    return { status: 'blocked', error: 'User is restricted from chat matches.' };
  }

  const [uA, uB] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];
  const isUserA = userId === uA;

  // Find or create match suggestion record
  const { data: match } = await s
    .from('match_suggestions')
    .select('*')
    .eq('journey_id', journeyId)
    .eq('user_a_id', uA)
    .eq('user_b_id', uB)
    .maybeSingle();

  const now = new Date().toISOString();
  const myResponse = accept ? 'accepted' : 'declined';

  if (!match) {
    if (!accept) {
      await s.from('match_suggestions').insert({
        journey_id: journeyId,
        user_a_id: uA,
        user_b_id: uB,
        user_a_response: isUserA ? 'declined' : 'pending',
        user_b_response: isUserA ? 'pending' : 'declined',
        status: 'declined',
        responded_at: now,
      });
      return { status: 'declined' };
    }

    await s.from('match_suggestions').insert({
      journey_id: journeyId,
      user_a_id: uA,
      user_b_id: uB,
      user_a_response: isUserA ? 'accepted' : 'pending',
      user_b_response: isUserA ? 'pending' : 'accepted',
      status: 'pending',
      responded_at: now,
    });
    return { status: 'pending' };
  }

  if (!accept) {
    if (match.room_id) {
      await s.from('messages').delete().eq('room_id', match.room_id);
      await s.from('rooms').update({ status: 'expired' }).eq('id', match.room_id);
    }
    await s.from('match_suggestions').update({
      user_a_response: isUserA ? 'declined' : match.user_a_response,
      user_b_response: !isUserA ? 'declined' : match.user_b_response,
      status: 'declined',
      updated_at: now,
      responded_at: now,
    }).eq('id', match.id);
    return { status: 'declined' };
  }

  // User accepts. Check if other user already accepted!
  const otherAccepted = isUserA ? match.user_b_response === 'accepted' : match.user_a_response === 'accepted';

  if (otherAccepted) {
    // MUTUAL ACCEPTANCE! Create exactly ONE private room
    if (match.room_id) {
      return { status: 'mutual_accepted', roomId: match.room_id };
    }

    const journey = await getActiveJourney();
    const expiresAt = journey?.ends_at || new Date(Date.now() + 48 * 3600000).toISOString();

    const { data: room, error: roomErr } = await s
      .from('rooms')
      .insert({
        journey_id: journeyId,
        type: 'private',
        status: 'active',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (roomErr || !room) {
      return { status: 'error', error: 'Failed to create private chat room.' };
    }

    // Add both participants to room_members
    await s.from('room_members').insert([
      { room_id: room.id, user_id: uA },
      { room_id: room.id, user_id: uB },
    ]);

    // Update match record
    await s.from('match_suggestions').update({
      user_a_response: 'accepted',
      user_b_response: 'accepted',
      status: 'mutual_accepted',
      room_id: room.id,
      updated_at: now,
      responded_at: now,
    }).eq('id', match.id);

    return { status: 'mutual_accepted', roomId: room.id };
  }

  // Only this user accepted so far
  await s.from('match_suggestions').update({
    user_a_response: isUserA ? 'accepted' : match.user_a_response,
    user_b_response: !isUserA ? 'accepted' : match.user_b_response,
    status: 'pending',
    updated_at: now,
    responded_at: now,
  }).eq('id', match.id);

  return { status: 'pending' };
}

export async function submitRating(params: {
  journeyId: string;
  roomId: string;
  raterId: string;
  targetUserId: string;
  ratingType: 'GOOD' | 'BAD';
}): Promise<{ success: boolean; error?: string; newScore?: number; isBanned?: boolean }> {
  const { journeyId, roomId, raterId, targetUserId, ratingType } = params;

  if (raterId === targetUserId) {
    return { success: false, error: 'Self-rating is strictly prohibited.' };
  }

  const s = getSupabaseAdmin();

  // Banned user cannot rate
  if (await isUserPermanentlyBanned(raterId)) {
    return { success: false, error: 'Permanently restricted accounts cannot submit ratings.' };
  }

  // Verify that both users share this room and that it's a private room for this journey
  const { data: room } = await s
    .from('rooms')
    .select('id, journey_id, type, status')
    .eq('id', roomId)
    .eq('journey_id', journeyId)
    .maybeSingle();

  if (!room || room.type !== 'private') {
    return { success: false, error: 'Rating requires a shared private conversation in this journey.' };
  }

  const { data: members } = await s
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId);

  const memberIds = (members || []).map(m => m.user_id);
  if (!memberIds.includes(raterId) || !memberIds.includes(targetUserId)) {
    return { success: false, error: 'Rating is only permitted between participants of this conversation.' };
  }

  // Rule: Same rater can rate a particular recipient at most once per journey
  const { data: existingRating } = await s
    .from('ratings')
    .select('id')
    .eq('journey_id', journeyId)
    .eq('rater_id', raterId)
    .eq('rated_user_id', targetUserId)
    .maybeSingle();

  if (existingRating) {
    return { success: false, error: 'You have already rated this passenger on this journey.' };
  }

  // Rule: Recipient can receive at most TWO GOOD ratings per journey across all raters
  if (ratingType === 'GOOD') {
    const { count: goodCount } = await s
      .from('ratings')
      .select('id', { count: 'exact', head: true })
      .eq('journey_id', journeyId)
      .eq('rated_user_id', targetUserId)
      .eq('rating_type', 'GOOD');

    if ((goodCount || 0) >= 2) {
      return {
        success: false,
        error: 'This passenger has already received the maximum two GOOD recognitions allowed for this journey.'
      };
    }
  }

  const pointsDelta = ratingType === 'GOOD' ? 2 : -2;

  // Insert rating record
  const { error: insertErr } = await s.from('ratings').insert({
    journey_id: journeyId,
    room_id: roomId,
    rater_id: raterId,
    rated_user_id: targetUserId,
    rating_type: ratingType,
    points_delta: pointsDelta,
  });

  if (insertErr) {
    return { success: false, error: 'Failed to record rating. ' + insertErr.message };
  }

  // Fetch recipient profile to update score
  const recipient = await getProfile(targetUserId);
  const currentScore = recipient?.reputation_points ?? 0;
  // Score capped above at 100, no lower bound
  const newScore = Math.min(100, currentScore + pointsDelta);

  const updatePayload: any = {
    reputation_points: newScore,
    updated_at: new Date().toISOString(),
  };

  // Rule: If score becomes strictly less than -50 (e.g. -52), set permanent chat ban
  let isBanned = !!recipient?.chats_banned_at;
  if (newScore < -50 && !isBanned) {
    updatePayload.chats_banned_at = new Date().toISOString();
    updatePayload.ban_reason = 'Permanent chat ban: reputation score fell strictly below -50 points.';
    isBanned = true;
  }

  await s.from('profiles').update(updatePayload).eq('id', targetUserId);

  return { success: true, newScore, isBanned };
}

export async function endJourney(
  journeyId: string
): Promise<{ success: boolean; messagesCleanedCount: number; error?: string }> {
  const s = getSupabaseAdmin();
  const now = new Date().toISOString();

  // Mark journey as ended
  const { error: jErr } = await s
    .from('journeys')
    .update({ status: 'ended', ended_at: now })
    .eq('id', journeyId);

  if (jErr) {
    return { success: false, messagesCleanedCount: 0, error: jErr.message };
  }

  // Lock all rooms belonging to this journey
  await s
    .from('rooms')
    .update({ status: 'expired' })
    .eq('journey_id', journeyId);

  // Idempotently clean up active chat messages for this journey
  const { data: journeyRooms } = await s
    .from('rooms')
    .select('id')
    .eq('journey_id', journeyId);

  let cleanedCount = 0;
  if (journeyRooms && journeyRooms.length > 0) {
    const roomIds = journeyRooms.map(r => r.id);
    const { count } = await s
      .from('messages')
      .delete({ count: 'exact' })
      .in('room_id', roomIds);
    cleanedCount = count || 0;
  }

  return { success: true, messagesCleanedCount: cleanedCount };
}

// ---------------------------------------------------------------------------
// Discovery Requests (Incoming / Outgoing / Mutual)
// ---------------------------------------------------------------------------
export async function getDiscoveryRequestsAndMatches(
  journeyId: string,
  userId: string
): Promise<{
  incomingRequests: any[];
  outgoingRequests: any[];
  mutualMatches: any[];
}> {
  const s = getSupabaseAdmin();

  if (await isUserPermanentlyBanned(userId)) {
    return { incomingRequests: [], outgoingRequests: [], mutualMatches: [] };
  }

  const { data: rows } = await s
    .from('match_suggestions')
    .select('*')
    .eq('journey_id', journeyId)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

  if (!rows || rows.length === 0) {
    return { incomingRequests: [], outgoingRequests: [], mutualMatches: [] };
  }

  const otherUserIds = Array.from(
    new Set(rows.map(r => (r.user_a_id === userId ? r.user_b_id : r.user_a_id)))
  );

  const { data: profiles } = await s
    .from('profiles')
    .select('*')
    .in('id', otherUserIds);

  const profileMap = new Map<string, any>();
  (profiles || []).forEach(p => profileMap.set(p.id, p));

  const incomingRequests: any[] = [];
  const outgoingRequests: any[] = [];
  const mutualMatches: any[] = [];

  for (const r of rows) {
    const isUserA = r.user_a_id === userId;
    const otherId = isUserA ? r.user_b_id : r.user_a_id;
    const myResp = isUserA ? r.user_a_response : r.user_b_response;
    const otherResp = isUserA ? r.user_b_response : r.user_a_response;

    if (r.status === 'declined' || r.status === 'blocked' || myResp === 'declined' || otherResp === 'declined') {
      continue;
    }

    const prof = profileMap.get(otherId);
    if (!prof || prof.chats_banned_at) continue;
    if (await areUsersBlocked(userId, otherId)) continue;

    const avatarUrl = prof.avatar?.startsWith('http')
      ? prof.avatar
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(prof.handle || otherId)}`;

    const userSummary = {
      id: otherId,
      username: prof.handle,
      displayName: prof.display_name || prof.handle,
      avatarUrl,
      conversationTopics: [prof.conversation_goal || 'Casual fun'],
      interests: prof.interests || [],
      bio: prof.bio || '',
      languages: [prof.language || 'en'],
      coachLabel: 'Coach B',
    };

    if (r.status === 'mutual_accepted' && r.room_id) {
      mutualMatches.push({
        matchId: r.id,
        roomId: r.room_id,
        targetUserId: otherId,
        user: userSummary,
        updatedAt: r.updated_at || r.created_at,
      });
    } else if (otherResp === 'accepted' && myResp === 'pending') {
      incomingRequests.push({
        matchId: r.id,
        targetUserId: otherId,
        user: userSummary,
        createdAt: r.created_at,
      });
    } else if (myResp === 'accepted' && otherResp === 'pending') {
      outgoingRequests.push({
        matchId: r.id,
        targetUserId: otherId,
        user: userSummary,
        createdAt: r.created_at,
      });
    }
  }

  return { incomingRequests, outgoingRequests, mutualMatches };
}

// ---------------------------------------------------------------------------
// Room Presence, Inactivity (30s) & Disconnect Engine (Private & Lounge)
// ---------------------------------------------------------------------------
export const PRESENCE_TTL_MS = 15000; // 15 seconds heartbeat window
export const ROOM_INACTIVITY_MS = 30000; // 30 seconds of inactivity auto-closes chatrooms

function getGlobalPresenceStore(): Map<string, Map<string, number>> {
  const g = globalThis as any;
  if (!g.__compartmentRoomPresence) {
    g.__compartmentRoomPresence = new Map<string, Map<string, number>>();
  }
  return g.__compartmentRoomPresence;
}

function getGlobalActivityStore(): Map<string, number> {
  const g = globalThis as any;
  if (!g.__compartmentRoomActivity) {
    g.__compartmentRoomActivity = new Map<string, number>();
  }
  return g.__compartmentRoomActivity;
}

function getGlobalDisconnectedStore(): Map<string, { disconnectedBy: string; timestamp: number }> {
  const g = globalThis as any;
  if (!g.__compartmentRoomDisconnected) {
    g.__compartmentRoomDisconnected = new Map<string, { disconnectedBy: string; timestamp: number }>();
  }
  return g.__compartmentRoomDisconnected;
}

export function touchRoomActivity(roomId: string): void {
  const store = getGlobalActivityStore();
  store.set(roomId, Date.now());
}

export function isRoomInactive(roomId: string): boolean {
  const store = getGlobalActivityStore();
  const last = store.get(roomId);
  if (!last) return false;
  return Date.now() - last >= ROOM_INACTIVITY_MS;
}

export function isRoomDisconnected(roomId: string): boolean {
  const store = getGlobalDisconnectedStore();
  return store.has(roomId);
}

export async function closeRoomDueToInactivity(roomId: string): Promise<void> {
  try {
    const s = getSupabaseAdmin();
    await s.from('rooms').update({ status: 'expired' }).eq('id', roomId);
    await clearRoomMessages(roomId);
    getGlobalActivityStore().delete(roomId);
    getGlobalPresenceStore().delete(roomId);
  } catch (err) {
    console.warn('Error closing room due to inactivity:', err);
  }
}

export async function disconnectPrivateRoom(
  roomId: string, 
  userId: string
): Promise<{ success: boolean; cleared: boolean }> {
  try {
    const s = getSupabaseAdmin();
    // Mark room as expired
    await s.from('rooms').update({ status: 'expired' }).eq('id', roomId);
    // Purge messages immediately
    const cleared = (await clearRoomMessages(roomId)) >= 0;
    // Mark disconnected state
    const discStore = getGlobalDisconnectedStore();
    discStore.set(roomId, { disconnectedBy: userId, timestamp: Date.now() });
    // Remove presence
    getGlobalPresenceStore().delete(roomId);
    getGlobalActivityStore().delete(roomId);

    return { success: true, cleared };
  } catch (err) {
    console.warn('Error disconnecting room:', err);
    return { success: false, cleared: false };
  }
}

export async function clearRoomMessages(roomId: string): Promise<number> {
  try {
    const s = getSupabaseAdmin();
    const { count } = await s
      .from('messages')
      .delete({ count: 'exact' })
      .eq('room_id', roomId);
    return count || 0;
  } catch (err) {
    console.warn('Error clearing room messages:', err);
    return 0;
  }
}

export async function recordRoomPresence(
  roomId: string,
  userId: string
): Promise<{ activeCount: number; clearedStale: boolean }> {
  const store = getGlobalPresenceStore();
  const now = Date.now();
  let roomMap = store.get(roomId);
  let clearedStale = false;

  if (!roomMap) {
    roomMap = new Map<string, number>();
    store.set(roomId, roomMap);
  } else {
    const hadUsers = roomMap.size > 0;
    for (const [uId, lastSeen] of Array.from(roomMap.entries())) {
      if (now - lastSeen > PRESENCE_TTL_MS) {
        roomMap.delete(uId);
      }
    }
    // If everyone previously in the room timed out so nobody was left, clear old history
    if (hadUsers && roomMap.size === 0) {
      await clearRoomMessages(roomId);
      clearedStale = true;
    }
  }

  roomMap.set(userId, now);
  return { activeCount: roomMap.size, clearedStale };
}

export async function leaveRoomAndClearIfEmpty(
  roomId: string,
  userId: string
): Promise<{ activeCount: number; cleared: boolean }> {
  const store = getGlobalPresenceStore();
  const now = Date.now();
  const roomMap = store.get(roomId);

  if (roomMap) {
    roomMap.delete(userId);
    for (const [uId, lastSeen] of Array.from(roomMap.entries())) {
      if (now - lastSeen > PRESENCE_TTL_MS) {
        roomMap.delete(uId);
      }
    }
  }

  const remaining = roomMap ? roomMap.size : 0;
  if (remaining === 0) {
    await clearRoomMessages(roomId);
    return { activeCount: 0, cleared: true };
  }

  return { activeCount: remaining, cleared: false };
}

export async function getRatingEligibility(params: {
  journeyId: string;
  roomId: string;
  raterId: string;
  targetUserId: string;
}): Promise<{ alreadyRated: boolean; recipientGoodCapReached: boolean }> {
  const { journeyId, raterId, targetUserId } = params;
  const s = getSupabaseAdmin();

  const { data: existingRating } = await s
    .from('ratings')
    .select('id')
    .eq('journey_id', journeyId)
    .eq('rater_id', raterId)
    .eq('rated_user_id', targetUserId)
    .maybeSingle();

  const { count: goodCount } = await s
    .from('ratings')
    .select('id', { count: 'exact', head: true })
    .eq('journey_id', journeyId)
    .eq('rated_user_id', targetUserId)
    .eq('rating_type', 'GOOD');

  return {
    alreadyRated: !!existingRating,
    recipientGoodCapReached: (goodCount || 0) >= 2,
  };
}
