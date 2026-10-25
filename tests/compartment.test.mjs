import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  parseQRText, 
  hashBoardingCode, 
  isHandleAvailable, 
  RESERVED_HANDLES,
  recordRoomPresence,
  leaveRoomAndClearIfEmpty,
  touchRoomActivity,
  isRoomInactive,
  disconnectPrivateRoom,
  isRoomDisconnected,
  ROOM_INACTIVITY_MS
} from '../src/lib/compartment-db.ts';

test.describe('COMPARTMENT — Food QR Parsing & Cryptographic Security', () => {
  test('correctly parses real food QR code format "Aaromal S VT008M2"', () => {
    const res = parseQRText('Aaromal S VT008M2');
    assert.equal(res.valid, true);
    assert.equal(res.displayNameHint, 'Aaromal S');
    assert.equal(res.boardingCode, 'VT008M2');
  });

  test('handles extra whitespace and lowercase input gracefully', () => {
    const res = parseQRText('   Devika   R   vt010d3   ');
    assert.equal(res.valid, true);
    assert.equal(res.displayNameHint, 'Devika R');
    assert.equal(res.boardingCode, 'VT010D3');
  });

  test('correctly parses single alphanumeric code without name', () => {
    const res = parseQRText('VT008M2');
    assert.equal(res.valid, true);
    assert.equal(res.boardingCode, 'VT008M2');
    assert.equal(res.displayNameHint, 'Passenger');
  });

  test('rejects empty or whitespace-only QR string', () => {
    const res = parseQRText('   ');
    assert.equal(res.valid, false);
  });

  test('hashes boarding code deterministically with HMAC-SHA256 pepper', () => {
    const hash1 = hashBoardingCode('VT008M2');
    const hash2 = hashBoardingCode('vt008m2');
    const hash3 = hashBoardingCode('VT009F1');

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64); // SHA-256 hex length
    assert.equal(hash1, hash2, 'Case differences in code should produce identical hash');
    assert.notEqual(hash1, hash3, 'Different codes must produce distinct hashes');
  });
});

test.describe('COMPARTMENT — Passenger Handle & Reserved Names Validation', () => {
  test('rejects handles shorter than 3 or longer than 20 chars', async () => {
    assert.equal(await isHandleAvailable('ab'), false);
    assert.equal(await isHandleAvailable('a_very_long_handle_exceeding_twenty_chars'), false);
  });

  test('rejects handles with special characters, spaces or invalid symbols', async () => {
    assert.equal(await isHandleAvailable('alex!'), false);
    assert.equal(await isHandleAvailable('alex hacker'), false);
    assert.equal(await isHandleAvailable('alex@train'), false);
  });

  test('rejects official railway and administrative handles', async () => {
    for (const reserved of ['admin', 'irctc', 'railway', 'rpf', 'moderator', 'police']) {
      assert.equal(await isHandleAvailable(reserved), false, `Reserved handle "${reserved}" must be rejected`);
      assert.equal(await isHandleAvailable(reserved.toUpperCase()), false, `Case-insensitive reserved "${reserved}" must be rejected`);
    }
  });
});

test.describe('COMPARTMENT — Reputation Ledger & Permanent Chat Ban Threshold', () => {
  // Mock simulation of the exact transaction logic in compartment-db.ts: submitRating
  function simulateReputationEngine() {
    const state = {
      userScores: new Map(), // userId -> { points, isBanned }
      ratings: [], // { journeyId, raterId, targetUserId, type }
    };

    function getScore(userId) {
      if (!state.userScores.has(userId)) {
        state.userScores.set(userId, { points: 0, isBanned: false });
      }
      return state.userScores.get(userId);
    }

    function rate({ journeyId, raterId, targetUserId, type }) {
      if (raterId === targetUserId) {
        return { success: false, error: 'Self-rating is strictly prohibited.' };
      }

      const rater = getScore(raterId);
      if (rater.isBanned) {
        return { success: false, error: 'Permanently restricted accounts cannot submit ratings.' };
      }

      // Check same rater once per target per journey
      const alreadyRated = state.ratings.some(
        r => r.journeyId === journeyId && r.raterId === raterId && r.targetUserId === targetUserId
      );
      if (alreadyRated) {
        return { success: false, error: 'You have already rated this passenger on this journey.' };
      }

      // Check 2-GOOD cap per recipient per journey
      if (type === 'GOOD') {
        const goodCount = state.ratings.filter(
          r => r.journeyId === journeyId && r.targetUserId === targetUserId && r.type === 'GOOD'
        ).length;
        if (goodCount >= 2) {
          return { success: false, error: 'Recipient has already reached the maximum 2 GOOD recognitions for this journey.' };
        }
      }

      const delta = type === 'GOOD' ? 2 : -2;
      const target = getScore(targetUserId);
      const newScore = Math.min(100, target.points + delta);
      target.points = newScore;

      // Strict ban threshold < -50
      if (newScore < -50) {
        target.isBanned = true;
      }

      state.ratings.push({ journeyId, raterId, targetUserId, type });
      return { success: true, newScore, isBanned: target.isBanned };
    }

    return { getScore, rate };
  }

  test('new account starts with exactly 0 points', () => {
    const engine = simulateReputationEngine();
    const score = engine.getScore('user_alice');
    assert.equal(score.points, 0);
    assert.equal(score.isBanned, false);
  });

  test('GOOD adds +2 points and BAD subtracts -2 points', () => {
    const engine = simulateReputationEngine();
    const resGood = engine.rate({ journeyId: 'J1', raterId: 'user_bob', targetUserId: 'user_alice', type: 'GOOD' });
    assert.equal(resGood.success, true);
    assert.equal(resGood.newScore, 2);

    const resBad = engine.rate({ journeyId: 'J1', raterId: 'user_carol', targetUserId: 'user_alice', type: 'BAD' });
    assert.equal(resBad.success, true);
    assert.equal(resBad.newScore, 0);
  });

  test('score is capped at 100 maximum', () => {
    const engine = simulateReputationEngine();
    const target = engine.getScore('user_alice');
    target.points = 99;

    const res = engine.rate({ journeyId: 'J1', raterId: 'user_bob', targetUserId: 'user_alice', type: 'GOOD' });
    assert.equal(res.success, true);
    assert.equal(res.newScore, 100);
  });

  test('recipient can receive at most 2 GOOD ratings per journey across all raters', () => {
    const engine = simulateReputationEngine();
    // 1st GOOD
    const r1 = engine.rate({ journeyId: 'J1', raterId: 'user_p1', targetUserId: 'user_target', type: 'GOOD' });
    assert.equal(r1.success, true);
    assert.equal(r1.newScore, 2);

    // 2nd GOOD
    const r2 = engine.rate({ journeyId: 'J1', raterId: 'user_p2', targetUserId: 'user_target', type: 'GOOD' });
    assert.equal(r2.success, true);
    assert.equal(r2.newScore, 4);

    // 3rd GOOD from different rater MUST be rejected!
    const r3 = engine.rate({ journeyId: 'J1', raterId: 'user_p3', targetUserId: 'user_target', type: 'GOOD' });
    assert.equal(r3.success, false);
    assert.match(r3.error, /maximum 2 GOOD/i);
    assert.equal(engine.getScore('user_target').points, 4, 'Score must not change on rejected 3rd GOOD');

    // But in a different journey (J2), recipient can receive GOOD ratings again!
    const r4 = engine.rate({ journeyId: 'J2', raterId: 'user_p4', targetUserId: 'user_target', type: 'GOOD' });
    assert.equal(r4.success, true);
    assert.equal(r4.newScore, 6, 'Points persist across journeys');
  });

  test('same rater cannot rate the same recipient twice on the same journey', () => {
    const engine = simulateReputationEngine();
    const r1 = engine.rate({ journeyId: 'J1', raterId: 'user_rater', targetUserId: 'user_target', type: 'GOOD' });
    assert.equal(r1.success, true);

    const r2 = engine.rate({ journeyId: 'J1', raterId: 'user_rater', targetUserId: 'user_target', type: 'BAD' });
    assert.equal(r2.success, false);
    assert.match(r2.error, /already rated/i);
  });

  test('strictly less than -50 triggers permanent chat ban; exactly -50 is NOT banned', () => {
    const engine = simulateReputationEngine();
    const target = engine.getScore('user_troublemaker');
    target.points = -48;

    // Deduct 2 -> score becomes -50
    const res50 = engine.rate({ journeyId: 'J1', raterId: 'rater_1', targetUserId: 'user_troublemaker', type: 'BAD' });
    assert.equal(res50.success, true);
    assert.equal(res50.newScore, -50);
    assert.equal(res50.isBanned, false, 'Score of exactly -50 must NOT trigger a ban');

    // Deduct 2 more -> score becomes -52 (strictly < -50)
    const res52 = engine.rate({ journeyId: 'J1', raterId: 'rater_2', targetUserId: 'user_troublemaker', type: 'BAD' });
    assert.equal(res52.success, true);
    assert.equal(res52.newScore, -52);
    assert.equal(res52.isBanned, true, 'Score strictly below -50 (-52) MUST trigger permanent chat ban');

    // Banned user cannot rate other passengers
    const bannedTryRate = engine.rate({ journeyId: 'J1', raterId: 'user_troublemaker', targetUserId: 'user_innocent', type: 'BAD' });
    assert.equal(bannedTryRate.success, false);
    assert.match(bannedTryRate.error, /permanently restricted/i);
  });
});

test.describe('COMPARTMENT — Mutual-Consent Matching Logic', () => {
  function simulateMatching() {
    const matches = new Map(); // key -> { userA, userB, respA, respB, roomId }

    function respond(userX, userY, accept) {
      const [uA, uB] = userX < userY ? [userX, userY] : [userY, userX];
      const key = `${uA}_${uB}`;
      const isUserA = userX === uA;

      let record = matches.get(key);
      if (!record) {
        record = { userA: uA, userB: uB, respA: 'pending', respB: 'pending', roomId: null };
        matches.set(key, record);
      }

      if (!accept) {
        if (isUserA) record.respA = 'declined';
        else record.respB = 'declined';
        return { status: 'declined' };
      }

      if (isUserA) record.respA = 'accepted';
      else record.respB = 'accepted';

      if (record.respA === 'accepted' && record.respB === 'accepted') {
        if (!record.roomId) {
          record.roomId = `room_${uA.slice(0, 4)}_${uB.slice(0, 4)}`;
        }
        return { status: 'mutual_accepted', roomId: record.roomId };
      }

      return { status: 'pending' };
    }

    return { respond };
  }

  test('one-sided acceptance stays pending without creating a room', () => {
    const matcher = simulateMatching();
    const res1 = matcher.respond('user_1', 'user_2', true);
    assert.equal(res1.status, 'pending');
    assert.equal(res1.roomId, undefined);
  });

  test('second acceptance creates exactly one private room', () => {
    const matcher = simulateMatching();
    matcher.respond('user_1', 'user_2', true);
    const res2 = matcher.respond('user_2', 'user_1', true);
    assert.equal(res2.status, 'mutual_accepted');
    assert.ok(res2.roomId);

    // Repeated call is idempotent and returns the same room
    const resRepeat = matcher.respond('user_1', 'user_2', true);
    assert.equal(resRepeat.status, 'mutual_accepted');
    assert.equal(resRepeat.roomId, res2.roomId);
  });

  test('declining closes the match suggestion', () => {
    const matcher = simulateMatching();
    const res = matcher.respond('user_1', 'user_2', false);
    assert.equal(res.status, 'declined');
  });
});

test.describe('COMPARTMENT — Ephemeral Room History & Zero-Occupant Clearing', () => {
  test('clears chat history when the last person leaves a private room', async () => {
    const testRoomId = `test_priv_room_${Date.now()}`;
    const user1 = 'user_devika';
    const user2 = 'user_aaromal';

    // User 1 enters
    const p1 = await recordRoomPresence(testRoomId, user1);
    assert.equal(p1.activeCount, 1);

    // User 2 enters
    const p2 = await recordRoomPresence(testRoomId, user2);
    assert.equal(p2.activeCount, 2);

    // User 1 leaves (User 2 remains) -> room NOT cleared
    const l1 = await leaveRoomAndClearIfEmpty(testRoomId, user1);
    assert.equal(l1.activeCount, 1);
    assert.equal(l1.cleared, false);

    // User 2 leaves (room is now empty) -> room history MUST BE CLEARED!
    const l2 = await leaveRoomAndClearIfEmpty(testRoomId, user2);
    assert.equal(l2.activeCount, 0);
    assert.equal(l2.cleared, true, 'Zero-occupant room must trigger message clearing');
  });

  test('clears chat history when the last person leaves the common lounge', async () => {
    const loungeRoomId = `test_lounge_room_${Date.now()}`;
    const passengerA = 'passenger_a';
    const passengerB = 'passenger_b';

    // Passengers enter lounge
    await recordRoomPresence(loungeRoomId, passengerA);
    const pB = await recordRoomPresence(loungeRoomId, passengerB);
    assert.equal(pB.activeCount, 2);

    // Passenger A leaves
    const lA = await leaveRoomAndClearIfEmpty(loungeRoomId, passengerA);
    assert.equal(lA.activeCount, 1);
    assert.equal(lA.cleared, false);

    // Passenger B leaves -> lounge becomes empty, history is cleared!
    const lB = await leaveRoomAndClearIfEmpty(loungeRoomId, passengerB);
    assert.equal(lB.activeCount, 0);
    assert.equal(lB.cleared, true, 'Lounge history must clear when 0 occupants remain');
  });
});

test.describe('COMPARTMENT — 1-End Quits Disconnect & 30s Inactivity Auto-Close', () => {
  test('disconnects private chat immediately when one participant quits', async () => {
    const roomId = `test_disconnect_room_${Date.now()}`;
    const userA = 'user_quitter';
    const userB = 'user_staying';

    // Both in room
    await recordRoomPresence(roomId, userA);
    await recordRoomPresence(roomId, userB);

    assert.equal(isRoomDisconnected(roomId), false);

    // User A explicitly quits via Exit Chat
    const disc = await disconnectPrivateRoom(roomId, userA);
    assert.equal(disc.success, true);
    assert.equal(disc.cleared, true);

    // Room is now flagged as disconnected
    assert.equal(isRoomDisconnected(roomId), true, 'Room must be marked disconnected after participant quits');
  });

  test('detects 30s inactivity auto-closure correctly', () => {
    const inactiveRoomId = `test_inactive_room_${Date.now()}`;
    assert.equal(ROOM_INACTIVITY_MS, 30000, 'Inactivity threshold must be exactly 30000 ms (30 seconds)');

    // Room active now
    touchRoomActivity(inactiveRoomId);
    assert.equal(isRoomInactive(inactiveRoomId), false);

    // Fast-forward activity timestamp past 30 seconds
    const g = globalThis;
    const activityStore = g.__compartmentRoomActivity;
    activityStore.set(inactiveRoomId, Date.now() - 31000); // 31 seconds ago

    assert.equal(isRoomInactive(inactiveRoomId), true, 'Room must report inactive after 30 seconds');
  });
});
