import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('VIBE — QR Onboarding, Username & Journey Reputation Test Suite', () => {

  // Isolated Mock DB state for unit testing logic
  let users = [];
  let scoreEvents = [];
  let restrictions = [];
  let appeals = [];
  let qrTokens = [];

  const RESERVED_USERNAMES = [
    'admin', 'administrator', 'moderator', 'mod', 'railway', 'indianrailways',
    'irctc', 'railmadad', 'police', 'rpf', 'grp', 'security', 'official',
    'helpdesk', 'support', 'vibe', 'system', 'root', 'bot', 'vibe_official'
  ];

  function validateUsername(username) {
    const clean = String(username || '').trim();
    if (clean.length < 3 || clean.length > 20) {
      return { valid: false, error: 'Username must be between 3 and 20 characters long.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return { valid: false, error: 'Username may only contain letters, numbers, and underscores.' };
    }
    if (RESERVED_USERNAMES.includes(clean.toLowerCase())) {
      return { valid: false, error: 'This username is reserved for platform security and official operations.' };
    }
    return { valid: true };
  }

  function isUsernameAvailable(username, excludeUserId) {
    const clean = String(username || '').trim().toLowerCase();
    if (RESERVED_USERNAMES.includes(clean)) return false;
    return !users.some(u => u.username && u.username.toLowerCase() === clean && u.id !== excludeUserId);
  }

  function updateUsername(userId, newUsername) {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const validation = validateUsername(newUsername);
    if (!validation.valid) return { success: false, error: validation.error };

    if (!isUsernameAvailable(newUsername, userId)) {
      return { success: false, error: 'Username is already taken by another passenger.' };
    }

    user.username = newUsername.trim();
    user.updatedAt = new Date().toISOString();
    return { success: true, user };
  }

  function createQRToken({ type, targetId, label, expiresInHours = 48, maxUses = 500, createdBy }) {
    const tokenStr = `vbt_${crypto.randomBytes(12).toString('hex')}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();
    const token = {
      id: `qrt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      token: tokenStr,
      type,
      targetId,
      label,
      expiresAt,
      isRevoked: false,
      maxUses,
      usedCount: 0,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    qrTokens.push(token);
    return token;
  }

  function validateQRToken(tokenString) {
    const token = qrTokens.find(t => t.token === tokenString?.trim());
    if (!token) return { valid: false, error: 'Invalid QR token.' };
    if (token.isRevoked) return { valid: false, error: 'This QR pass has been revoked.' };
    if (new Date(token.expiresAt) < new Date()) return { valid: false, error: 'This QR pass has expired.' };
    if (token.maxUses && token.usedCount >= token.maxUses) return { valid: false, error: 'Maximum usage limit reached.' };
    return { valid: true, token };
  }

  function useQRToken(tokenString) {
    const val = validateQRToken(tokenString);
    if (!val.valid) return false;
    val.token.usedCount += 1;
    return true;
  }

  function getDistinctPositiveVoters(targetUserId, journeyId) {
    return new Set(
      scoreEvents
        .filter(e => e.targetUserId === targetUserId && e.journeyId === journeyId && e.voteType === 'positive' && e.status === 'active')
        .map(e => e.voterUserId)
    ).size;
  }

  function hasUserVotedOnJourney(voterUserId, targetUserId, journeyId) {
    return scoreEvents.some(
      e => e.voterUserId === voterUserId && e.targetUserId === targetUserId && e.journeyId === journeyId && e.status === 'active'
    );
  }

  function createScoreEvent({ journeyId, voterUserId, targetUserId, voteType }) {
    if (voterUserId === targetUserId) {
      return { success: false, error: 'Self-feedback is strictly disallowed.' };
    }

    const voter = users.find(u => u.id === voterUserId);
    const target = users.find(u => u.id === targetUserId);
    if (!voter || !target) return { success: false, error: 'Voter or target not found' };

    if (voter.isRestricted) {
      return { success: false, error: 'Accounts under temporary restriction cannot submit feedback.' };
    }

    if (hasUserVotedOnJourney(voterUserId, targetUserId, journeyId)) {
      return { success: false, error: 'Duplicate feedback is not permitted on the same journey.' };
    }

    if (voteType === 'positive') {
      const distinctCount = getDistinctPositiveVoters(targetUserId, journeyId);
      if (distinctCount >= 3) {
        return { success: false, error: 'Target passenger has reached the maximum 3 positive recognitions on this journey.' };
      }
    }

    const pointDelta = voteType === 'positive' ? 2 : -2;
    const event = {
      id: `se_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      journeyId,
      voterUserId,
      targetUserId,
      voteType,
      pointDelta,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    scoreEvents.push(event);

    // Calculate new target score
    const activeEvents = scoreEvents.filter(e => e.targetUserId === targetUserId && e.status === 'active');
    const newScore = 100 + activeEvents.reduce((acc, curr) => acc + curr.pointDelta, 0);
    target.reputationScore = newScore;

    // Restriction threshold: strictly below 90
    if (newScore < 90 && !target.isRestricted) {
      target.isRestricted = true;
      target.restrictionExpiresAt = new Date(Date.now() + 24 * 3600000).toISOString();
      restrictions.push({
        userId: targetUserId,
        triggerScore: newScore,
        status: 'active',
        expiresAt: target.restrictionExpiresAt,
      });
    }

    return { success: true, event, newScore, isRestricted: target.isRestricted };
  }

  function reverseScoreEvent(eventId, moderatorId, reason) {
    const event = scoreEvents.find(e => e.id === eventId);
    if (!event || event.status === 'reversed') return { success: false };
    event.status = 'reversed';
    event.reversalReason = reason;

    const target = users.find(u => u.id === event.targetUserId);
    if (target) {
      const activeEvents = scoreEvents.filter(e => e.targetUserId === target.id && e.status === 'active');
      const newScore = 100 + activeEvents.reduce((acc, curr) => acc + curr.pointDelta, 0);
      target.reputationScore = newScore;
      if (newScore >= 90 && target.isRestricted) {
        target.isRestricted = false;
        target.restrictionExpiresAt = undefined;
      }
      return { success: true, newScore };
    }
    return { success: true };
  }

  beforeEach(() => {
    users = [
      { id: 'u1', username: 'aarav_sharma', baseScore: 100, reputationScore: 100, isRestricted: false },
      { id: 'u2', username: 'priya_nair', baseScore: 100, reputationScore: 100, isRestricted: false },
      { id: 'u3', username: 'rohan_v', baseScore: 100, reputationScore: 100, isRestricted: false },
      { id: 'u4', username: 'sarah_j', baseScore: 100, reputationScore: 100, isRestricted: false },
      { id: 'u5', username: 'vikram_k', baseScore: 100, reputationScore: 100, isRestricted: false },
    ];
    scoreEvents = [];
    restrictions = [];
    appeals = [];
    qrTokens = [];
  });

  // 1. USERNAME TESTS
  describe('Username System & Identity Rules', () => {
    test('accepts valid usernames between 3 and 20 alphanumeric characters', () => {
      assert.equal(validateUsername('maya_99').valid, true);
      assert.equal(validateUsername('raj_express').valid, true);
      assert.equal(validateUsername('dev123').valid, true);
    });

    test('rejects usernames that are too short or too long', () => {
      assert.equal(validateUsername('ab').valid, false);
      assert.equal(validateUsername('a_very_long_username_exceeding_twenty_chars').valid, false);
    });

    test('rejects usernames with special characters or spaces', () => {
      assert.equal(validateUsername('maya@vibe').valid, false);
      assert.equal(validateUsername('priya nair').valid, false);
      assert.equal(validateUsername('user!name').valid, false);
    });

    test('rejects reserved administrative and railway official names', () => {
      assert.equal(validateUsername('admin').valid, false);
      assert.equal(validateUsername('IRCTC').valid, false);
      assert.equal(validateUsername('RailMadad').valid, false);
      assert.equal(validateUsername('police').valid, false);
      assert.equal(validateUsername('moderator').valid, false);
    });

    test('enforces case-insensitive username uniqueness', () => {
      assert.equal(isUsernameAvailable('Aarav_Sharma'), false);
      assert.equal(isUsernameAvailable('AARAV_SHARMA'), false);
      assert.equal(isUsernameAvailable('new_traveller'), true);
    });

    test('allows user to change to an available username while preserving internal ID and score', () => {
      const user = users.find(u => u.id === 'u1');
      user.reputationScore = 104; // User had earned points
      const originalId = user.id;

      const res = updateUsername('u1', 'aarav_coder');
      assert.equal(res.success, true);
      assert.equal(user.username, 'aarav_coder');
      assert.equal(user.id, originalId);
      assert.equal(user.reputationScore, 104); // Points preserved!
    });

    test('prevents claiming another existing user\'s username', () => {
      const res = updateUsername('u1', 'priya_nair');
      assert.equal(res.success, false);
      assert.match(res.error, /already taken/i);
    });
  });

  // 2. QR ONBOARDING TESTS
  describe('QR Token Validation & Pass Mechanics', () => {
    test('generates opaque URL-safe tokens with expiration', () => {
      const token = createQRToken({ type: 'journey_join', targetId: 'jrn_12951', label: 'Rajdhani Coach B4' });
      assert.ok(token.token.startsWith('vbt_'));
      assert.ok(token.token.length >= 20);
      assert.equal(token.isRevoked, false);
      assert.equal(token.usedCount, 0);
    });

    test('validates an active, unexpired QR token successfully', () => {
      const token = createQRToken({ type: 'public_entry', label: 'Welcome Pass' });
      const val = validateQRToken(token.token);
      assert.equal(val.valid, true);
      assert.equal(val.token.id, token.id);
    });

    test('rejects expired tokens', () => {
      const token = createQRToken({ type: 'public_entry', expiresInHours: -1 }); // already expired
      const val = validateQRToken(token.token);
      assert.equal(val.valid, false);
      assert.match(val.error, /expired/i);
    });

    test('rejects revoked tokens immediately', () => {
      const token = createQRToken({ type: 'journey_join', targetId: 'jrn_1' });
      token.isRevoked = true;
      const val = validateQRToken(token.token);
      assert.equal(val.valid, false);
      assert.match(val.error, /revoked/i);
    });

    test('rejects tokens that reach their maximum usage limit', () => {
      const token = createQRToken({ type: 'journey_join', maxUses: 2 });
      assert.equal(useQRToken(token.token), true); // usage 1
      assert.equal(useQRToken(token.token), true); // usage 2
      assert.equal(useQRToken(token.token), false); // usage 3 rejected!
    });

    test('rejects arbitrary or unknown token strings without granting authentication', () => {
      const val = validateQRToken('malicious_forged_token_xyz');
      assert.equal(val.valid, false);
      assert.match(val.error, /invalid/i);
    });
  });

  // 3. REPUTATION SCORING TESTS
  describe('Reputation Scoring, Cap & Ledger Rules', () => {
    test('all new passenger accounts start with baseline 100 points', () => {
      const u = users[0];
      assert.equal(u.baseScore, 100);
      assert.equal(u.reputationScore, 100);
    });

    test('a valid positive vote awards exactly +2 points', () => {
      const res = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'positive' });
      assert.equal(res.success, true);
      assert.equal(res.newScore, 102);
      assert.equal(users[0].reputationScore, 102);
    });

    test('a valid negative vote subtracts exactly -2 points', () => {
      const res = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'negative' });
      assert.equal(res.success, true);
      assert.equal(res.newScore, 98);
      assert.equal(users[0].reputationScore, 98);
    });

    test('rejects self-voting attempts', () => {
      const res = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u1', targetUserId: 'u1', voteType: 'positive' });
      assert.equal(res.success, false);
      assert.match(res.error, /self/i);
    });

    test('rejects duplicate voting by same voter on same journey', () => {
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'positive' });
      const dup = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'positive' });
      assert.equal(dup.success, false);
      assert.match(dup.error, /duplicate/i);
    });

    test('enforces maximum 3 distinct positive voters per target on a single journey', () => {
      // 1st distinct positive voter
      assert.equal(createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'positive' }).success, true);
      // 2nd distinct positive voter
      assert.equal(createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u3', targetUserId: 'u1', voteType: 'positive' }).success, true);
      // 3rd distinct positive voter
      assert.equal(createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u4', targetUserId: 'u1', voteType: 'positive' }).success, true);
      assert.equal(users[0].reputationScore, 106);

      // 4th distinct positive voter -> MUST BE REJECTED!
      const fourth = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u5', targetUserId: 'u1', voteType: 'positive' });
      assert.equal(fourth.success, false);
      assert.match(fourth.error, /maximum 3 positive/i);
      assert.equal(users[0].reputationScore, 106); // Score did not increase beyond cap
    });

    test('negative voting remains available from eligible voters even after positive cap is reached', () => {
      // Max out positive cap (3 voters)
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'positive' });
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u3', targetUserId: 'u1', voteType: 'positive' });
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u4', targetUserId: 'u1', voteType: 'positive' });
      assert.equal(users[0].reputationScore, 106);

      // 4th voter (u5) casts negative vote -> MUST BE ACCEPTED (no 3-voter cap on negative feedback)
      const neg = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u5', targetUserId: 'u1', voteType: 'negative' });
      assert.equal(neg.success, true);
      assert.equal(neg.newScore, 104);
      assert.equal(users[0].reputationScore, 104);
    });

    test('reversing a score event reconciles target score accurately', () => {
      const { event } = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'negative' });
      assert.equal(users[0].reputationScore, 98);

      const rev = reverseScoreEvent(event.id, 'mod_1', 'Confirmed mistaken feedback submission');
      assert.equal(rev.success, true);
      assert.equal(rev.newScore, 100);
      assert.equal(users[0].reputationScore, 100);
    });
  });

  // 4. RESTRICTION THRESHOLD & ENFORCEMENT TESTS
  describe('Temporary Restriction Threshold (<90) & Appeals', () => {
    test('a score of 91 or 90 does not trigger restriction', () => {
      const u = users[0];
      // Reduce by 10 points (5 negative votes) -> 100 - 10 = 90
      // We need distinct voters and journeys
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'negative' }); // 98
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u3', targetUserId: 'u1', voteType: 'negative' }); // 96
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u4', targetUserId: 'u1', voteType: 'negative' }); // 94
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u5', targetUserId: 'u1', voteType: 'negative' }); // 92
      
      assert.equal(u.reputationScore, 92);
      assert.equal(u.isRestricted, false);

      // Add vote on another journey to reach exactly 90
      createScoreEvent({ journeyId: 'jrn_2', voterUserId: 'u2', targetUserId: 'u1', voteType: 'negative' }); // 90
      assert.equal(u.reputationScore, 90);
      assert.equal(u.isRestricted, false); // Exactly 90 is NOT restricted!
    });

    test('a score strictly below 90 (e.g. 88) triggers temporary restriction and sets 24h expiry', () => {
      const u = users[0];
      // 5 negative votes -> 90
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u2', targetUserId: 'u1', voteType: 'negative' });
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u3', targetUserId: 'u1', voteType: 'negative' });
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u4', targetUserId: 'u1', voteType: 'negative' });
      createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u5', targetUserId: 'u1', voteType: 'negative' });
      createScoreEvent({ journeyId: 'jrn_2', voterUserId: 'u2', targetUserId: 'u1', voteType: 'negative' }); // 90

      // 6th negative vote -> 88 (strictly below 90)
      const res = createScoreEvent({ journeyId: 'jrn_2', voterUserId: 'u3', targetUserId: 'u1', voteType: 'negative' });
      assert.equal(res.newScore, 88);
      assert.equal(res.isRestricted, true);
      assert.equal(u.isRestricted, true);
      assert.ok(u.restrictionExpiresAt);
      assert.ok(new Date(u.restrictionExpiresAt).getTime() > Date.now());
    });

    test('restricted user cannot submit feedback to other passengers', () => {
      const u = users[0];
      u.isRestricted = true; // Mark as restricted
      const attempt = createScoreEvent({ journeyId: 'jrn_1', voterUserId: 'u1', targetUserId: 'u2', voteType: 'positive' });
      assert.equal(attempt.success, false);
      assert.match(attempt.error, /restrict/i);
    });

    test('changing username does not lift or bypass active restriction', () => {
      const u = users[0];
      u.isRestricted = true;
      u.restrictionExpiresAt = new Date(Date.now() + 24 * 3600000).toISOString();

      const change = updateUsername('u1', 'aarav_alias_99');
      assert.equal(change.success, true);
      assert.equal(u.isRestricted, true); // Still restricted!
      assert.ok(u.restrictionExpiresAt);
    });
  });

});
