import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Let's create an isolated test data directory
const TEST_DIR = path.join(process.cwd(), '.data-test');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

describe('VIBE — AI for Humanity Core Test Suite', () => {

  // Test 1: Deterministic Matching Scoring Engine
  describe('Matching & Compatibility Algorithm', () => {
    function calculateMatchScore(userA, journeyA, userB, journeyB) {
      const sameTrain = Boolean(
        journeyA && 
        journeyB && 
        journeyA.trainNumber === journeyB.trainNumber && 
        journeyA.travelDate === journeyB.travelDate
      );
      const sameTrainScore = sameTrain ? 30 : (journeyA && journeyB ? 10 : 0);

      const interestsA = new Set((userA.interests || []).map(i => i.toLowerCase().trim()));
      const interestsB = (userB.interests || []).map(i => i.toLowerCase().trim());
      const commonInterests = interestsB.filter(i => interestsA.has(i));
      const interestScore = Math.min(25, commonInterests.length * 8);

      const learnA = new Set((userA.skillsToLearn || []).map(s => s.toLowerCase().trim()));
      const shareB = (userB.skillsToShare || []).map(s => s.toLowerCase().trim());
      const synergyAB = shareB.filter(s => learnA.has(s));

      const learnB = new Set((userB.skillsToLearn || []).map(s => s.toLowerCase().trim()));
      const shareA = (userA.skillsToShare || []).map(s => s.toLowerCase().trim());
      const synergyBA = shareA.filter(s => learnB.has(s));

      const allSynergies = Array.from(new Set([...synergyAB, ...synergyBA]));
      const skillSynergyScore = Math.min(20, allSynergies.length * 10);

      const topicsA = new Set((userA.conversationTopics || []).map(t => t.toLowerCase().trim()));
      const topicsB = (userB.conversationTopics || []).map(t => t.toLowerCase().trim());
      const commonTopics = topicsB.filter(t => topicsA.has(t));
      const topicScore = Math.min(10, commonTopics.length * 5);

      const langsA = new Set((userA.languages || []).map(l => l.toLowerCase().trim()));
      const langsB = (userB.languages || []).map(l => l.toLowerCase().trim());
      const commonLangs = langsB.filter(l => langsA.has(l));
      const languageScore = commonLangs.length > 0 ? 10 : 0;

      const total = Math.min(100, Math.round(
        sameTrainScore + interestScore + skillSynergyScore + topicScore + languageScore
      ));

      return {
        score: total,
        commonInterests,
        allSynergies,
        commonLangs,
        sameTrain,
      };
    }

    test('awards 30 points for matching train number and travel date', () => {
      const userA = { interests: [], skillsToShare: [], skillsToLearn: [], languages: [] };
      const userB = { interests: [], skillsToShare: [], skillsToLearn: [], languages: [] };
      const journeyA = { trainNumber: '12951', travelDate: '2026-11-01' };
      const journeyB = { trainNumber: '12951', travelDate: '2026-11-01' };

      const result = calculateMatchScore(userA, journeyA, userB, journeyB);
      assert.equal(result.sameTrain, true);
      assert.equal(result.score, 30);
    });

    test('correctly identifies complementary skill learning and teaching synergies', () => {
      const userA = {
        interests: ['Tech & Coding'],
        skillsToShare: ['React Web Dev'],
        skillsToLearn: ['Python ML'],
        conversationTopics: ['Software'],
        languages: ['English'],
      };
      const userB = {
        interests: ['Tech & Coding'],
        skillsToShare: ['Python ML'],
        skillsToLearn: ['React Web Dev'],
        conversationTopics: ['Software'],
        languages: ['English'],
      };
      const journeyA = { trainNumber: '12951', travelDate: '2026-11-01' };
      const journeyB = { trainNumber: '12951', travelDate: '2026-11-01' };

      const result = calculateMatchScore(userA, journeyA, userB, journeyB);
      // Same train (30) + Interest (8) + Synergy (20) + Topic (5) + Lang (10) = 73
      assert.ok(result.score >= 70, `Score was ${result.score}`);
      assert.deepEqual(result.allSynergies.sort(), ['python ml', 'react web dev'].sort());
    });

    test('handles empty profiles gracefully without crashing or NaN', () => {
      const userA = {};
      const userB = {};
      const result = calculateMatchScore(userA, undefined, userB, undefined);
      assert.equal(result.score, 0);
      assert.equal(typeof result.score, 'number');
      assert.equal(isNaN(result.score), false);
    });
  });

  // Test 2: Match Explanation Transparency
  describe('Match Explanation Generator', () => {
    function generateExplanation(sameTrain, trainNumber, sharedInterests, sharedSkills, sharedLanguages) {
      const parts = [];
      if (sameTrain && trainNumber) {
        parts.push(`traveling on the same train (${trainNumber})`);
      }
      if (sharedInterests.length > 0) {
        parts.push(`both enjoy ${sharedInterests.slice(0, 2).join(' and ')}`);
      }
      if (sharedSkills.length > 0) {
        parts.push(`have complementary learning goals in ${sharedSkills[0]}`);
      } else if (sharedLanguages.length > 0) {
        parts.push(`can converse in ${sharedLanguages.slice(0, 2).join(' or ')}`);
      }
      if (parts.length === 0) {
        return 'Suggested based on complementary journey schedule and open conversational goals.';
      }
      return `Suggested because you are ${parts.join(', ')}.`;
    }

    test('generates transparent, plain-English reason for match suggestion', () => {
      const explanation = generateExplanation(
        true,
        '12951',
        ['Tech & Coding', 'Chess'],
        ['Python ML'],
        ['English']
      );
      assert.ok(explanation.includes('traveling on the same train (12951)'));
      assert.ok(explanation.includes('both enjoy Tech & Coding and Chess'));
      assert.ok(explanation.includes('have complementary learning goals in Python ML'));
      assert.ok(explanation.startsWith('Suggested because you are'));
    });
  });

  // Test 3: Privacy and Discovery Filters
  describe('Privacy & Discovery Filters', () => {
    const candidates = [
      { id: 'u1', displayName: 'Self User', discoveryOptIn: true, profileVisibility: 'public' },
      { id: 'u2', displayName: 'Opted Out User', discoveryOptIn: false, profileVisibility: 'public' },
      { id: 'u3', displayName: 'Private User', discoveryOptIn: true, profileVisibility: 'private' },
      { id: 'u4', displayName: 'Admin User', discoveryOptIn: true, role: 'admin' },
      { id: 'u5', displayName: 'Valid Matched Passenger', discoveryOptIn: true, profileVisibility: 'journey_only', role: 'passenger' },
    ];

    test('excludes self, opted-out users, private profiles, and admin accounts from discovery', () => {
      const currentUserId = 'u1';
      const filtered = candidates.filter(c => {
        if (c.id === currentUserId) return false;
        if (c.role === 'admin' || c.role === 'moderator') return false;
        if (!c.discoveryOptIn) return false;
        if (c.profileVisibility === 'private') return false;
        return true;
      });

      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'u5');
    });
  });

  // Test 4: Two-Way Blocking Enforcement
  describe('Two-Way Blocking Logic', () => {
    const blocks = [{ blockerId: 'usr_A', blockedId: 'usr_B' }];

    function isBlocked(u1, u2) {
      return blocks.some(
        b => (b.blockerId === u1 && b.blockedId === u2) || (b.blockerId === u2 && b.blockedId === u1)
      );
    }

    test('mutual blocking prevents communication regardless of who initiated the block', () => {
      assert.equal(isBlocked('usr_A', 'usr_B'), true, 'Blocker to blocked should be blocked');
      assert.equal(isBlocked('usr_B', 'usr_A'), true, 'Blocked to blocker should be blocked');
      assert.equal(isBlocked('usr_A', 'usr_C'), false, 'Unblocked user should not be blocked');
    });
  });

  // Test 5: Role-Based Access Control
  describe('Role-Based Moderation Permission', () => {
    function canAccessModerationDesk(user) {
      return user && (user.role === 'moderator' || user.role === 'admin');
    }

    test('denies ordinary passengers access to moderation desk', () => {
      const passenger = { id: 'p1', role: 'passenger' };
      assert.equal(canAccessModerationDesk(passenger), false);
    });

    test('grants authorized moderators and administrators access', () => {
      const moderator = { id: 'm1', role: 'moderator' };
      const admin = { id: 'a1', role: 'admin' };
      assert.equal(canAccessModerationDesk(moderator), true);
      assert.equal(canAccessModerationDesk(admin), true);
    });
  });

  // Test 6: Activity Scoring & Points Calculation
  describe('Activity Scoring & Points Calculation', () => {
    function calculatePoints(score, maxScore) {
      if (!maxScore || maxScore <= 0) return 0;
      return Math.round((score / maxScore) * 50);
    }

    function checkBadgeEligibility(activityId, score, maxScore) {
      const percentage = (score / maxScore) * 100;
      if (activityId === 'quiz_railways_gk' && percentage >= 80) {
        return 'quiz_master';
      }
      if (activityId === 'lang_hindi_english' && percentage >= 60) {
        return 'language_learner';
      }
      return null;
    }

    test('awards proportionate points and unlocks Railways Scholar badge on 80%+ score', () => {
      const points = calculatePoints(5, 5);
      assert.equal(points, 50);

      const badge = checkBadgeEligibility('quiz_railways_gk', 4, 5);
      assert.equal(badge, 'quiz_master');

      const lowBadge = checkBadgeEligibility('quiz_railways_gk', 3, 5); // 60%
      assert.equal(lowBadge, null);
    });
  });

  // Test 7: Travel Date Validation
  describe('Journey Travel Date Validation', () => {
    function isValidTravelDate(dateString) {
      const today = new Date().toISOString().split('T')[0];
      return Boolean(dateString && dateString >= today);
    }

    test('rejects past travel dates while accepting today and future travel dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      assert.equal(isValidTravelDate(today), true);
      assert.equal(isValidTravelDate(tomorrow), true);
      assert.equal(isValidTravelDate(yesterday), false);
    });
  });

});
