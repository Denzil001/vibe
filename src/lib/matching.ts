import { User, SafeUser, Journey, MatchRecommendation } from '@/types';
import { db } from './db';
import { toSafeUser } from './auth';

interface ScoreBreakdown {
  sameTrainScore: number;
  interestScore: number;
  skillSynergyScore: number;
  learningGoalScore: number;
  languageScore: number;
  topicScore: number;
  total: number;
}

/**
 * Calculates deterministic match compatibility between two passengers.
 * Weights:
 * - Same Train & Travel Date: 30 points
 * - Shared Interests overlap: 25 points
 * - Skill Synergy (User A wants to learn what User B can share or vice versa): 20 points
 * - Shared Conversation Topics: 10 points
 * - Common Languages: 10 points
 * - Learning Goal overlap: 5 points
 * Total potential: 100 points
 */
export function calculateMatchScore(
  userA: SafeUser | User,
  journeyA: Journey | undefined,
  userB: SafeUser | User,
  journeyB: Journey | undefined
): { score: number; breakdown: ScoreBreakdown; sharedInterests: string[]; sharedSkills: string[]; sharedLanguages: string[]; sameTrain: boolean } {
  // 1. Same train check
  const sameTrain = Boolean(
    journeyA && 
    journeyB && 
    journeyA.trainNumber === journeyB.trainNumber && 
    journeyA.travelDate === journeyB.travelDate
  );
  const sameTrainScore = sameTrain ? 30 : (journeyA && journeyB ? 10 : 0);

  // 2. Interest overlap
  const interestsA = new Set((userA.interests || []).map(i => i.toLowerCase().trim()));
  const interestsB = (userB.interests || []).map(i => i.toLowerCase().trim());
  const commonInterests = interestsB.filter(i => interestsA.has(i));
  const interestScore = Math.min(25, commonInterests.length * 8);

  // 3. Skill synergy: User A wants to learn what B shares, or B wants to learn what A shares
  const learnA = new Set((userA.skillsToLearn || []).map(s => s.toLowerCase().trim()));
  const shareB = (userB.skillsToShare || []).map(s => s.toLowerCase().trim());
  const synergyAB = shareB.filter(s => learnA.has(s));

  const learnB = new Set((userB.skillsToLearn || []).map(s => s.toLowerCase().trim()));
  const shareA = (userA.skillsToShare || []).map(s => s.toLowerCase().trim());
  const synergyBA = shareA.filter(s => learnB.has(s));

  const allSynergies = Array.from(new Set([...synergyAB, ...synergyBA]));
  const skillSynergyScore = Math.min(20, allSynergies.length * 10);

  // 4. Conversation topics overlap
  const topicsA = new Set((userA.conversationTopics || []).map(t => t.toLowerCase().trim()));
  const topicsB = (userB.conversationTopics || []).map(t => t.toLowerCase().trim());
  const commonTopics = topicsB.filter(t => topicsA.has(t));
  const topicScore = Math.min(10, commonTopics.length * 5);

  // 5. Common languages
  const langsA = new Set((userA.languages || []).map(l => l.toLowerCase().trim()));
  const langsB = (userB.languages || []).map(l => l.toLowerCase().trim());
  const commonLangs = langsB.filter(l => langsA.has(l));
  const languageScore = commonLangs.length > 0 ? 10 : 0;

  // 6. Learning goals overlap
  const goalsA = (userA.learningGoals || []).join(' ').toLowerCase();
  const goalsB = (userB.learningGoals || []).join(' ').toLowerCase();
  let goalScore = 0;
  if (goalsA && goalsB) {
    const wordsA = new Set(goalsA.split(/\s+/).filter(w => w.length > 4));
    const wordsB = goalsB.split(/\s+/).filter(w => wordsA.has(w));
    if (wordsB.length > 0) goalScore = 5;
  }

  const total = Math.min(100, Math.round(
    sameTrainScore + interestScore + skillSynergyScore + topicScore + languageScore + goalScore
  ));

  return {
    score: total,
    breakdown: {
      sameTrainScore,
      interestScore,
      skillSynergyScore,
      learningGoalScore: goalScore,
      languageScore,
      topicScore,
      total,
    },
    sharedInterests: commonInterests.map(i => {
      // Find original casing
      return userB.interests.find(orig => orig.toLowerCase().trim() === i) || i;
    }),
    sharedSkills: allSynergies,
    sharedLanguages: commonLangs.map(l => {
      return userB.languages.find(orig => orig.toLowerCase().trim() === l) || l;
    }),
    sameTrain,
  };
}

/**
 * Generates transparent, human-readable reason why connection was suggested.
 */
export function generateMatchExplanation(
  targetUser: SafeUser | User,
  sameTrain: boolean,
  trainNumber?: string,
  sharedInterests: string[] = [],
  sharedSkills: string[] = [],
  sharedLanguages: string[] = []
): string {
  const parts: string[] = [];

  if (sameTrain && trainNumber) {
    parts.push(`traveling on the same train (${trainNumber})`);
  }

  if (sharedInterests.length > 0) {
    const list = sharedInterests.slice(0, 2).join(' and ');
    parts.push(`both enjoy ${list}`);
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

/**
 * Finds eligible passenger matches for a user, respecting discovery preferences,
 * visibility rules, and active blocks.
 */
export function getPassengerMatches(currentUserId: string): MatchRecommendation[] {
  const currentUser = db.getUserById(currentUserId);
  if (!currentUser) return [];

  // Check if current user has opted into discovery
  if (!currentUser.discoveryOptIn) {
    return [];
  }

  const currentJourney = db.getJourneyByUserId(currentUserId);
  const allUsers = db.getUsers();
  const allJourneys = db.getJourneys();

  const recommendations: MatchRecommendation[] = [];

  for (const candidate of allUsers) {
    // 1. Skip self
    if (candidate.id === currentUserId) continue;

    // 2. Skip admin/moderator system accounts from discovery
    if (candidate.role === 'admin' || candidate.role === 'moderator') continue;

    // 3. Respect discoveryOptIn
    if (!candidate.discoveryOptIn) continue;

    // 4. Respect profileVisibility
    if (candidate.profileVisibility === 'private') continue;

    // 5. Respect blocks
    if (db.isBlocked(currentUserId, candidate.id)) continue;

    // Get candidate journey
    const candidateJourney = allJourneys.find(
      j => j.userId === candidate.id && j.status !== 'completed'
    );

    // If candidate visibility is journey_only, they must have an active journey
    if (candidate.profileVisibility === 'journey_only' && !candidateJourney) {
      continue;
    }

    const { score, sharedInterests, sharedSkills, sharedLanguages, sameTrain } = calculateMatchScore(
      currentUser,
      currentJourney,
      candidate,
      candidateJourney
    );

    // Filter out very low or non-existent matches
    if (score < 15) continue;

    const explanation = generateMatchExplanation(
      candidate,
      sameTrain,
      candidateJourney?.trainNumber,
      sharedInterests,
      sharedSkills,
      sharedLanguages
    );

    recommendations.push({
      user: toSafeUser(candidate),
      journey: candidateJourney,
      score,
      sharedInterests,
      sharedSkillsToLearn: sharedSkills,
      sharedLanguages,
      explanation,
      sameTrain,
    });
  }

  // Sort by highest match score first, with same-train preference
  return recommendations.sort((a, b) => b.score - a.score);
}
