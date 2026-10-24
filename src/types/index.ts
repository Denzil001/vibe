export type UserRole = 'passenger' | 'moderator' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  usernameUpdatedAt?: string;
  passwordHash: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  skillsToShare: string[];
  skillsToLearn: string[];
  learningGoals: string[];
  conversationTopics: string[];
  languages: string[];
  discoveryOptIn: boolean;
  profileVisibility: 'public' | 'journey_only' | 'private';
  role: UserRole;
  points: number;
  baseScore: number;
  reputationScore: number;
  isRestricted: boolean;
  restrictionExpiresAt?: string;
  restrictionReason?: string;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface ScoreEvent {
  id: string;
  journeyId: string;
  voterUserId: string;
  targetUserId: string;
  voteType: 'positive' | 'negative';
  pointDelta: number; // +2 or -2
  reasonCategory?: string;
  status: 'active' | 'reversed';
  reversalReason?: string;
  reversalBy?: string;
  reversedBy?: string;
  reversedAt?: string;
  createdAt: string;
}

export interface RestrictionRecord {
  id: string;
  userId: string;
  triggerScore: number;
  startedAt: string;
  expiresAt: string;
  reason: string;
  policyVersion: string;
  status: 'active' | 'expired' | 'appealed' | 'lifted';
  appealId?: string;
}

export interface ReputationAppeal {
  id: string;
  userId: string;
  username?: string;
  restrictionId?: string;
  scoreEventId?: string;
  userExplanation: string;
  status: 'pending' | 'approved' | 'rejected';
  decisionNotes?: string;
  moderatorId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface QRToken {
  id: string;
  token: string;
  type: 'public_entry' | 'journey_join' | 'group_join';
  targetId?: string;
  label?: string;
  expiresAt: string;
  isRevoked: boolean;
  maxUses?: number;
  usedCount: number;
  createdBy?: string;
  createdAt: string;
}

export interface Journey {
  id: string;
  userId: string;
  trainNumber: string;
  trainName: string;
  travelDate: string; // YYYY-MM-DD
  boardingStation: string;
  destinationStation: string;
  durationHours?: number;
  discoveryEnabled: boolean;
  conversationGoals: string[];
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  trainNumber?: string;
  category: 'Language Exchange' | 'Study & Exam Prep' | 'Book Club & Stories' | 'Tech & Innovation' | 'Travel Tips & Food' | 'Casual Games & Trivia';
  rules: string[];
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId?: string | null;
  groupId?: string | null;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
}

export interface BlockRecord {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export type ReportCategory = 
  | 'harassment'
  | 'spam'
  | 'abusive'
  | 'unwanted_contact'
  | 'inappropriate_content'
  | 'impersonation'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string | null;
  reportedGroupId?: string | null;
  reportedMessageId?: string | null;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  notes?: string;
  moderatorId?: string | null;
  resolutionAction?: 'none' | 'warning_issued' | 'account_suspended' | 'content_removed' | 'dismissed';
  resolvedAt?: string | null;
  createdAt: string;
}

export interface MatchRecommendation {
  user: SafeUser;
  journey?: Journey;
  score: number; // 0 to 100
  sharedInterests: string[];
  sharedSkillsToLearn: string[];
  sharedLanguages: string[];
  explanation: string;
  sameTrain: boolean;
}

export interface ActivityQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'quiz' | 'language' | 'icebreaker';
  estimatedMinutes: number;
  pointsReward: number;
  questions?: ActivityQuizQuestion[];
  flashcards?: { prompt: string; answer: string; hint: string }[];
  icebreakerPrompts?: string[];
}

export interface ActivityAttempt {
  id: string;
  userId: string;
  activityId: string;
  score: number;
  maxScore: number;
  pointsEarned: number;
  completedAt: string;
}

export interface AchievementBadge {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'social' | 'learning' | 'safety';
}
