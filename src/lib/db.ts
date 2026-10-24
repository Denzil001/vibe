import fs from 'fs';
import path from 'path';
import { 
  User, 
  Journey, 
  Group, 
  GroupMember, 
  Conversation, 
  Message, 
  BlockRecord, 
  Report, 
  Activity, 
  ActivityAttempt, 
  AchievementBadge,
  ScoreEvent,
  RestrictionRecord,
  ReputationAppeal,
  QRToken
} from '@/types';

interface DatabaseSchema {
  users: User[];
  journeys: Journey[];
  groups: Group[];
  groupMembers: GroupMember[];
  conversations: Conversation[];
  messages: Message[];
  blocks: BlockRecord[];
  reports: Report[];
  activityAttempts: ActivityAttempt[];
  userAchievements: { userId: string; badgeKey: string; earnedAt: string }[];
  scoreEvents: ScoreEvent[];
  restrictions: RestrictionRecord[];
  appeals: ReputationAppeal[];
  qrTokens: QRToken[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge-1',
    key: 'first_profile',
    title: 'First Step',
    description: 'Completed your passenger profile and shared your journey goals',
    icon: 'UserCheck',
    category: 'onboarding',
  },
  {
    id: 'badge-2',
    key: 'first_journey',
    title: 'Track Finder',
    description: 'Configured your train journey details for discovery',
    icon: 'Train',
    category: 'onboarding',
  },
  {
    id: 'badge-3',
    key: 'community_member',
    title: 'Coach Comrade',
    description: 'Joined your first train-specific or topic community group',
    icon: 'Users',
    category: 'social',
  },
  {
    id: 'badge-4',
    key: 'first_conversation',
    title: 'Small Talk Hero',
    description: 'Started a meaningful, respectful 1-to-1 conversation',
    icon: 'MessageSquare',
    category: 'social',
  },
  {
    id: 'badge-5',
    key: 'quiz_master',
    title: 'Railways Scholar',
    description: 'Scored 80% or higher in the Indian Railways Trivia Quiz',
    icon: 'Award',
    category: 'learning',
  },
  {
    id: 'badge-6',
    key: 'language_learner',
    title: 'Polyglot Passenger',
    description: 'Completed the Hindi-English Travel Phrase Exchange',
    icon: 'Languages',
    category: 'learning',
  },
  {
    id: 'badge-7',
    key: 'safety_conscious',
    title: 'Guardian Angel',
    description: 'Reviewed safety resources, community guidelines, and verified official helplines',
    icon: 'ShieldCheck',
    category: 'safety',
  },
];

// Helper to hash password deterministically for dev/test
export function hashPassword(password: string): string {
  // Simple PBKDF2/SHA-256 equivalent using Node crypto
  const crypto = require('crypto');
  return crypto.pbkdf2Sync(password, 'vibe_salt_2026', 1000, 32, 'sha256').toString('hex');
}

const DEFAULT_PASSWORD_HASH = hashPassword('password123');

function getSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  const travelDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Tomorrow

  const users: User[] = [
    {
      id: 'usr_admin',
      email: 'admin@vibe.app',
      username: 'safety_officer',
      passwordHash: hashPassword('admin12345'),
      displayName: 'VIBE Safety Moderator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      bio: 'Official VIBE platform safety coordinator and community integrity supervisor.',
      interests: ['Community Safety', 'Conflict Resolution', 'Digital Well-being', 'Ethics in AI'],
      skillsToShare: ['Safety Best Practices', 'Community Guidelines'],
      skillsToLearn: ['Feedback Analysis'],
      learningGoals: ['Maintain high trust and zero-harassment passenger communities'],
      conversationTopics: ['Community Standards', 'Passenger Assistance'],
      languages: ['English', 'Hindi'],
      discoveryOptIn: false,
      profileVisibility: 'private',
      role: 'admin',
      points: 1000,
      baseScore: 100,
      reputationScore: 100,
      isRestricted: false,
      badges: ['safety_conscious'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_1',
      email: 'aarav@example.com',
      username: 'aarav_sharma',
      passwordHash: DEFAULT_PASSWORD_HASH,
      displayName: 'Aarav Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      bio: 'Full-stack software developer heading to Delhi for a tech conference. Love discussing system design, open source, and playing chess during long train rides.',
      interests: ['Tech & Coding', 'Chess', 'Trekking', 'Podcasts', 'Startup Ecosystem'],
      skillsToShare: ['React & Node.js', 'System Architecture', 'Chess Fundamentals'],
      skillsToLearn: ['Machine Learning', 'Public Speaking', 'Hindi Poetry'],
      learningGoals: ['Understand LLM inference optimizations during journey', 'Read 2 chapters of Designing Data-Intensive Applications'],
      conversationTopics: ['Software Engineering', 'Books & Sci-Fi', 'Mountain Hikes', 'Travel Stories'],
      languages: ['English', 'Hindi'],
      discoveryOptIn: true,
      profileVisibility: 'journey_only',
      role: 'passenger',
      points: 180,
      baseScore: 100,
      reputationScore: 100,
      isRestricted: false,
      badges: ['first_profile', 'first_journey', 'community_member', 'quiz_master'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_2',
      email: 'priya@example.com',
      username: 'priya_nair',
      passwordHash: DEFAULT_PASSWORD_HASH,
      displayName: 'Priya Nair',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      bio: 'Postgraduate data science researcher. Curious about AI for social impact, sustainable transit, and language learning. Looking for polite study buddies.',
      interests: ['Tech & Coding', 'Language Learning', 'Machine Learning', 'Data Ethics', 'Acoustic Music'],
      skillsToShare: ['Python & PyTorch', 'Data Visualization', 'Spanish (Beginner)'],
      skillsToLearn: ['Full-stack Web Dev', 'Cloud Deployment', 'Marathi'],
      learningGoals: ['Review transformer attention mechanisms', 'Exchange conversational Spanish practice'],
      conversationTopics: ['AI Ethics', 'Research Papers', 'Indie Music', 'Train Journey Nostalgia'],
      languages: ['English', 'Hindi', 'Malayalam'],
      discoveryOptIn: true,
      profileVisibility: 'journey_only',
      role: 'passenger',
      points: 220,
      baseScore: 100,
      reputationScore: 100,
      isRestricted: false,
      badges: ['first_profile', 'first_journey', 'community_member', 'language_learner'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_3',
      email: 'rohan@example.com',
      username: 'rohan_verma',
      passwordHash: DEFAULT_PASSWORD_HASH,
      displayName: 'Rohan Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      bio: 'Civil Services / UPSC aspirant traveling to North India. Keen on Indian history, constitutional law, public administration, and book exchanges.',
      interests: ['Civil Services / UPSC', 'Literature', 'Indian History', 'Debating', 'Economics'],
      skillsToShare: ['Current Affairs Summary', 'Constitutional Law Insights', 'Speed Reading'],
      skillsToLearn: ['Data Literacy', 'Productivity Systems', 'German'],
      learningGoals: ['Complete revision on Economic Survey chapters', 'Discuss history and policy with fellow passengers'],
      conversationTopics: ['Governance', 'History of Indian Railways', 'Classic Literature', 'Regional Geopolitics'],
      languages: ['English', 'Hindi'],
      discoveryOptIn: true,
      profileVisibility: 'journey_only',
      role: 'passenger',
      points: 140,
      baseScore: 100,
      reputationScore: 100,
      isRestricted: false,
      badges: ['first_profile', 'first_journey', 'community_member'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_4',
      email: 'sarah@example.com',
      username: 'sarah_j',
      passwordHash: DEFAULT_PASSWORD_HASH,
      displayName: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      bio: 'Freelance documentary photographer & backpacker exploring India by rail. Eager to practice basic conversational Hindi and swap travel stories.',
      interests: ['Photography', 'Language Learning', 'Travel Stories', 'Documentary Arts', 'Culinary Traditions'],
      skillsToShare: ['Composition & Mobile Photography', 'Travel Writing'],
      skillsToLearn: ['Conversational Hindi', 'Local Food Etiquette'],
      learningGoals: ['Master 20 essential conversational Hindi phrases during train trip', 'Document station architecture'],
      conversationTopics: ['Street Photography', 'Regional Dishes', 'Solo Travel Tips', 'Cultural Heritage'],
      languages: ['English'],
      discoveryOptIn: true,
      profileVisibility: 'journey_only',
      role: 'passenger',
      points: 160,
      baseScore: 100,
      reputationScore: 100,
      isRestricted: false,
      badges: ['first_profile', 'first_journey', 'community_member', 'language_learner'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const journeys: Journey[] = [
    {
      id: 'jrn_1',
      userId: 'usr_1',
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      travelDate: travelDate,
      boardingStation: 'Mumbai Central (MMCT)',
      destinationStation: 'New Delhi (NDLS)',
      durationHours: 15.5,
      discoveryEnabled: true,
      conversationGoals: ['Tech discussion', 'Casual chess or trivia', 'Knowledge sharing'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'jrn_2',
      userId: 'usr_2',
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      travelDate: travelDate,
      boardingStation: 'Surat (ST)',
      destinationStation: 'New Delhi (NDLS)',
      durationHours: 12.0,
      discoveryEnabled: true,
      conversationGoals: ['Study buddy', 'Language exchange', 'Tech & AI discussions'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'jrn_3',
      userId: 'usr_3',
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      travelDate: travelDate,
      boardingStation: 'Vadodara Jn (BRC)',
      destinationStation: 'Hazrat Nizamuddin (NZM)',
      durationHours: 11.0,
      discoveryEnabled: true,
      conversationGoals: ['Study group', 'Current affairs discussions', 'Book exchange'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'jrn_4',
      userId: 'usr_4',
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      travelDate: travelDate,
      boardingStation: 'Mumbai Central (MMCT)',
      destinationStation: 'Kota Jn (KOTA)',
      durationHours: 10.5,
      discoveryEnabled: true,
      conversationGoals: ['Language practice', 'Travel tips', 'Photography talk'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const groups: Group[] = [
    {
      id: 'grp_1',
      name: 'Mumbai Rajdhani (12951) Tech & Startups',
      description: 'A friendly community for software engineers, designers, founders, and students on the Mumbai Rajdhani route to discuss tech, code, and ideas.',
      trainNumber: '12951',
      category: 'Tech & Innovation',
      rules: [
        'Be respectful and professional in all interactions.',
        'No spam, recruitment spam, or aggressive self-promotion.',
        'Never share seat numbers, berths, or private ticket details in public chat.',
        'Respect quiet hours in train coaches (10 PM to 6 AM).'
      ],
      createdBy: 'usr_1',
      memberCount: 3,
      createdAt: now,
    },
    {
      id: 'grp_2',
      name: 'Hindi - English Travel Language Exchange',
      description: 'Practice conversational Hindi and English with fellow passengers during long transit hours. Polite, patient, and welcoming to all proficiency levels.',
      trainNumber: '12951',
      category: 'Language Exchange',
      rules: [
        'Encouraging and patient tone only — everyone is learning!',
        'No mock tests or harsh corrections; constructive guidance only.',
        'Keep topics centered on travel, food, culture, and daily life.'
      ],
      createdBy: 'usr_2',
      memberCount: 3,
      createdAt: now,
    },
    {
      id: 'grp_3',
      name: 'UPSC & Civil Services Journey Study Circle',
      description: 'Dedicated focus cohort for aspirants reviewing GS papers, current affairs, and essays while traveling.',
      trainNumber: '12951',
      category: 'Study & Exam Prep',
      rules: [
        'Evidence-backed, respectful discussions.',
        'Zero partisan political hostility or derogatory comments.',
        'Share notes and book recommendations willingly.'
      ],
      createdBy: 'usr_3',
      memberCount: 2,
      createdAt: now,
    },
    {
      id: 'grp_4',
      name: 'Rail Journeys Photography & Travel Tales',
      description: 'Share advice on capturing scenic ghats, station life, sunsets, and local culinary discoveries from across India.',
      category: 'Travel Tips & Food',
      rules: [
        'Always obtain verbal consent before taking or sharing photos of people.',
        'Do not lean out of train doors or compromise safety for a photo.',
        'Share authentic tips and respectful cultural observations.'
      ],
      createdBy: 'usr_4',
      memberCount: 3,
      createdAt: now,
    },
  ];

  const groupMembers: GroupMember[] = [
    { id: 'gm_1', groupId: 'grp_1', userId: 'usr_1', role: 'admin', joinedAt: now },
    { id: 'gm_2', groupId: 'grp_1', userId: 'usr_2', role: 'member', joinedAt: now },
    { id: 'gm_3', groupId: 'grp_1', userId: 'usr_3', role: 'member', joinedAt: now },
    { id: 'gm_4', groupId: 'grp_2', userId: 'usr_2', role: 'admin', joinedAt: now },
    { id: 'gm_5', groupId: 'grp_2', userId: 'usr_4', role: 'member', joinedAt: now },
    { id: 'gm_6', groupId: 'grp_2', userId: 'usr_1', role: 'member', joinedAt: now },
    { id: 'gm_7', groupId: 'grp_3', userId: 'usr_3', role: 'admin', joinedAt: now },
    { id: 'gm_8', groupId: 'grp_3', userId: 'usr_1', role: 'member', joinedAt: now },
    { id: 'gm_9', groupId: 'grp_4', userId: 'usr_4', role: 'admin', joinedAt: now },
    { id: 'gm_10', groupId: 'grp_4', userId: 'usr_2', role: 'member', joinedAt: now },
    { id: 'gm_11', groupId: 'grp_4', userId: 'usr_1', role: 'member', joinedAt: now },
  ];

  const conversations: Conversation[] = [
    {
      id: 'conv_1_2',
      participantIds: ['usr_1', 'usr_2'],
      lastMessage: 'Sounds great! I would love to check out your thoughts on PyTorch transformers.',
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const messages: Message[] = [
    // Group 1 messages
    {
      id: 'msg_g1_1',
      groupId: 'grp_1',
      senderId: 'usr_1',
      senderName: 'Aarav Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      content: 'Welcome everyone joining on the Mumbai Rajdhani! Charging points in B3 coach are working well. Anyone working on interesting projects today?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg_g1_2',
      groupId: 'grp_1',
      senderId: 'usr_2',
      senderName: 'Priya Nair',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      content: 'Hey Aarav! Boarding shortly at Surat. I am reviewing research on low-latency language models. Glad to see fellow builders here!',
      createdAt: new Date(Date.now() - 2400000).toISOString(),
    },
    {
      id: 'msg_g1_3',
      groupId: 'grp_1',
      senderId: 'usr_3',
      senderName: 'Rohan Verma',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      content: 'Boarding at Vadodara. If anyone wants to take a break later and discuss digital public infrastructure or IRCTC evolution, let me know!',
      createdAt: new Date(Date.now() - 1200000).toISOString(),
    },
    // Direct Conversation 1-to-1
    {
      id: 'msg_c1_1',
      conversationId: 'conv_1_2',
      senderId: 'usr_1',
      senderName: 'Aarav Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      content: 'Hi Priya! I noticed you are studying ML and also learning web development. I work in full-stack engineering and would love to exchange notes!',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'msg_c1_2',
      conversationId: 'conv_1_2',
      senderId: 'usr_2',
      senderName: 'Priya Nair',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      content: 'Sounds great! I would love to check out your thoughts on PyTorch transformers.',
      createdAt: now,
    },
  ];

  const blocks: BlockRecord[] = [];

  const reports: Report[] = [
    {
      id: 'rep_demo_1',
      reporterId: 'usr_2',
      reportedUserId: 'usr_demo_spammer',
      category: 'spam',
      reason: 'Repeated promotional links for an unauthorized commercial tour package.',
      status: 'pending',
      notes: 'Initial automated flag for review by moderator team.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const activityAttempts: ActivityAttempt[] = [
    {
      id: 'att_1',
      userId: 'usr_1',
      activityId: 'quiz_railways_gk',
      score: 5,
      maxScore: 5,
      pointsEarned: 50,
      completedAt: now,
    },
    {
      id: 'att_2',
      userId: 'usr_2',
      activityId: 'lang_hindi_english',
      score: 4,
      maxScore: 5,
      pointsEarned: 40,
      completedAt: now,
    },
  ];

  const userAchievements = [
    { userId: 'usr_1', badgeKey: 'first_profile', earnedAt: now },
    { userId: 'usr_1', badgeKey: 'first_journey', earnedAt: now },
    { userId: 'usr_1', badgeKey: 'community_member', earnedAt: now },
    { userId: 'usr_1', badgeKey: 'quiz_master', earnedAt: now },
    { userId: 'usr_2', badgeKey: 'first_profile', earnedAt: now },
    { userId: 'usr_2', badgeKey: 'first_journey', earnedAt: now },
    { userId: 'usr_2', badgeKey: 'community_member', earnedAt: now },
    { userId: 'usr_2', badgeKey: 'language_learner', earnedAt: now },
    { userId: 'usr_3', badgeKey: 'first_profile', earnedAt: now },
    { userId: 'usr_3', badgeKey: 'first_journey', earnedAt: now },
    { userId: 'usr_3', badgeKey: 'community_member', earnedAt: now },
    { userId: 'usr_4', badgeKey: 'first_profile', earnedAt: now },
    { userId: 'usr_4', badgeKey: 'first_journey', earnedAt: now },
    { userId: 'usr_4', badgeKey: 'community_member', earnedAt: now },
    { userId: 'usr_4', badgeKey: 'language_learner', earnedAt: now },
  ];

  const qrTokens: QRToken[] = [
    {
      id: 'qrt_public_1',
      token: 'vibe_onboard_public_welcome',
      type: 'public_entry',
      label: 'VIBE Community General Onboarding',
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      isRevoked: false,
      maxUses: 10000,
      usedCount: 42,
      createdBy: 'usr_admin',
      createdAt: now,
    },
    {
      id: 'qrt_journey_12951',
      token: 'vibe_jrn_12951_rajdhani',
      type: 'journey_join',
      targetId: 'jrn_1',
      label: 'Mumbai Rajdhani (12951) Passenger Coach B4',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      isRevoked: false,
      maxUses: 500,
      usedCount: 18,
      createdBy: 'usr_1',
      createdAt: now,
    },
    {
      id: 'qrt_group_grp1',
      token: 'vibe_grp_tech_startups',
      type: 'group_join',
      targetId: 'grp_1',
      label: 'Tech & Startups Cohort (12951)',
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      isRevoked: false,
      maxUses: 200,
      usedCount: 12,
      createdBy: 'usr_1',
      createdAt: now,
    },
  ];

  return {
    users,
    journeys,
    groups,
    groupMembers,
    conversations,
    messages,
    blocks,
    reports,
    activityAttempts,
    userAchievements,
    scoreEvents: [],
    restrictions: [],
    appeals: [],
    qrTokens,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.readFromDisk();
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(fileContent);
        let modified = false;
        if (!parsed.scoreEvents) { parsed.scoreEvents = []; modified = true; }
        if (!parsed.restrictions) { parsed.restrictions = []; modified = true; }
        if (!parsed.appeals) { parsed.appeals = []; modified = true; }
        if (!parsed.qrTokens || parsed.qrTokens.length === 0) {
          parsed.qrTokens = [
            {
              id: 'qrt_public_1',
              token: 'vibe_onboard_public_welcome',
              type: 'public_entry',
              label: 'VIBE Community General Onboarding',
              expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
              isRevoked: false,
              maxUses: 10000,
              usedCount: 42,
              createdBy: 'usr_admin',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'qrt_journey_12951',
              token: 'vibe_jrn_12951_rajdhani',
              type: 'journey_join',
              targetId: 'jrn_1',
              label: 'Mumbai Rajdhani (12951) Passenger Coach B4',
              expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
              isRevoked: false,
              maxUses: 500,
              usedCount: 18,
              createdBy: 'usr_1',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'qrt_group_grp1',
              token: 'vibe_grp_tech_startups',
              type: 'group_join',
              targetId: 'grp_1',
              label: 'Tech & Startups Cohort (12951)',
              expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
              isRevoked: false,
              maxUses: 200,
              usedCount: 12,
              createdBy: 'usr_1',
              createdAt: new Date().toISOString(),
            },
          ];
          modified = true;
        }
        for (const u of parsed.users) {
          if (!u.username) {
            u.username = u.email ? u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : `user_${u.id.slice(0, 6)}`;
            modified = true;
          }
          if (u.baseScore === undefined) { u.baseScore = 100; modified = true; }
          if (u.reputationScore === undefined) { u.reputationScore = 100; modified = true; }
          if (u.isRestricted === undefined) { u.isRestricted = false; modified = true; }
        }
        if (modified) {
          this.writeToDisk(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to read db.json, generating seed data', e);
    }
    const seed = getSeedData();
    this.writeToDisk(seed);
    return seed;
  }

  private writeToDisk(data: DatabaseSchema): void {
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (e) {
      console.error('Failed to write db.json', e);
    }
  }

  private save(): void {
    this.writeToDisk(this.data);
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { 
      ...this.data.users[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.save();
    return this.data.users[idx];
  }

  // Username validation & uniqueness
  getUserByUsername(username: string): User | undefined {
    const clean = username.trim().toLowerCase();
    return this.data.users.find(u => u.username && u.username.toLowerCase() === clean);
  }

  isUsernameAvailable(username: string, excludeUserId?: string): boolean {
    const clean = username.trim().toLowerCase();
    const reserved = [
      'admin', 'administrator', 'moderator', 'mod', 'railway', 'indianrailways',
      'irctc', 'railmadad', 'police', 'rpf', 'grp', 'security', 'official',
      'helpdesk', 'support', 'vibe', 'system', 'root', 'bot', 'vibe_official'
    ];
    if (reserved.includes(clean)) return false;
    const exists = this.data.users.some(u => 
      u.username && u.username.toLowerCase() === clean && u.id !== excludeUserId
    );
    return !exists;
  }

  validateUsername(username: string): { valid: boolean; error?: string } {
    const clean = username.trim();
    if (clean.length < 3 || clean.length > 20) {
      return { valid: false, error: 'Username must be between 3 and 20 characters long.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return { valid: false, error: 'Username may only contain letters, numbers, and underscores.' };
    }
    const reserved = [
      'admin', 'administrator', 'moderator', 'mod', 'railway', 'indianrailways',
      'irctc', 'railmadad', 'police', 'rpf', 'grp', 'security', 'official',
      'helpdesk', 'support', 'vibe', 'system', 'root', 'bot', 'vibe_official'
    ];
    if (reserved.includes(clean.toLowerCase())) {
      return { valid: false, error: 'This username is reserved for platform security and official operations.' };
    }
    return { valid: true };
  }

  updateUsername(userId: string, newUsername: string): { success: boolean; error?: string; user?: User } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const validation = this.validateUsername(newUsername);
    if (!validation.valid) return { success: false, error: validation.error };

    if (!this.isUsernameAvailable(newUsername, userId)) {
      return { success: false, error: 'Username is already taken by another passenger.' };
    }

    user.username = newUsername.trim();
    user.usernameUpdatedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    this.save();
    return { success: true, user };
  }

  generateSuggestedUsername(baseName?: string): string {
    const seed = (baseName ? baseName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'traveller') || 'passenger';
    for (let i = 0; i < 20; i++) {
      const rand = Math.floor(100 + Math.random() * 900);
      const candidate = `${seed.slice(0, 12)}_${rand}`;
      if (this.isUsernameAvailable(candidate)) {
        return candidate;
      }
    }
    return `passenger_${Date.now().toString().slice(-4)}`;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.journeys = this.data.journeys.filter(j => j.userId !== id);
    this.data.groupMembers = this.data.groupMembers.filter(gm => gm.userId !== id);
    this.data.blocks = this.data.blocks.filter(b => b.blockerId !== id && b.blockedId !== id);
    this.save();
    return this.data.users.length < initialLen;
  }

  // Journeys
  getJourneys(): Journey[] {
    return this.data.journeys;
  }

  getJourneyById(id: string): Journey | undefined {
    return this.data.journeys.find(j => j.id === id);
  }

  getJourneysByUser(userId: string): Journey[] {
    return this.data.journeys.filter(j => j.userId === userId);
  }

  getJourneyByUserId(userId: string): Journey | undefined {
    return this.data.journeys.find(j => j.userId === userId && j.status !== 'completed');
  }

  createJourney(journey: Journey): Journey {
    return this.saveJourney(journey);
  }

  saveJourney(journey: Journey): Journey {
    const idx = this.data.journeys.findIndex(j => j.id === journey.id);
    if (idx >= 0) {
      this.data.journeys[idx] = journey;
    } else {
      this.data.journeys.push(journey);
    }
    this.save();
    return journey;
  }

  deleteJourney(id: string): boolean {
    const len = this.data.journeys.length;
    this.data.journeys = this.data.journeys.filter(j => j.id !== id);
    this.save();
    return this.data.journeys.length < len;
  }

  // Groups
  getGroups(): Group[] {
    return this.data.groups;
  }

  getGroupById(id: string): Group | undefined {
    return this.data.groups.find(g => g.id === id);
  }

  createGroup(group: Group): Group {
    this.data.groups.push(group);
    this.data.groupMembers.push({
      id: `gm_${Date.now()}`,
      groupId: group.id,
      userId: group.createdBy,
      role: 'admin',
      joinedAt: new Date().toISOString(),
    });
    this.save();
    return group;
  }

  getGroupMembers(groupId: string): GroupMember[] {
    return this.data.groupMembers.filter(gm => gm.groupId === groupId);
  }

  isGroupMember(groupId: string, userId: string): boolean {
    return this.data.groupMembers.some(gm => gm.groupId === groupId && gm.userId === userId);
  }

  joinGroup(groupId: string, userId: string): boolean {
    if (this.isGroupMember(groupId, userId)) return true;
    const group = this.getGroupById(groupId);
    if (!group) return false;

    this.data.groupMembers.push({
      id: `gm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      groupId,
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
    });
    group.memberCount += 1;
    this.save();
    return true;
  }

  addGroupMember(groupId: string, userId: string): boolean {
    return this.joinGroup(groupId, userId);
  }

  leaveGroup(groupId: string, userId: string): boolean {
    const group = this.getGroupById(groupId);
    if (!group) return false;

    const initialLen = this.data.groupMembers.length;
    this.data.groupMembers = this.data.groupMembers.filter(
      gm => !(gm.groupId === groupId && gm.userId === userId)
    );
    if (this.data.groupMembers.length < initialLen) {
      group.memberCount = Math.max(0, group.memberCount - 1);
      this.save();
      return true;
    }
    return false;
  }

  // Conversations
  getConversations(userId: string): Conversation[] {
    return this.data.conversations.filter(c => c.participantIds.includes(userId));
  }

  getConversationById(id: string): Conversation | undefined {
    return this.data.conversations.find(c => c.id === id);
  }

  getOrCreateConversation(userA: string, userB: string): Conversation {
    const existing = this.data.conversations.find(
      c => c.participantIds.includes(userA) && c.participantIds.includes(userB)
    );
    if (existing) return existing;

    const now = new Date().toISOString();
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      participantIds: [userA, userB],
      createdAt: now,
      updatedAt: now,
    };
    this.data.conversations.push(newConv);
    this.save();
    return newConv;
  }

  // Messages
  getMessages(filters: { conversationId?: string; groupId?: string; limit?: number }): Message[] {
    let msgs = this.data.messages;
    if (filters.conversationId) {
      msgs = msgs.filter(m => m.conversationId === filters.conversationId);
    }
    if (filters.groupId) {
      msgs = msgs.filter(m => m.groupId === filters.groupId);
    }
    msgs = msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (filters.limit) {
      msgs = msgs.slice(-filters.limit);
    }
    return msgs;
  }

  createMessage(msg: Message): Message {
    this.data.messages.push(msg);
    if (msg.conversationId) {
      const conv = this.getConversationById(msg.conversationId);
      if (conv) {
        conv.lastMessage = msg.content;
        conv.lastMessageAt = msg.createdAt;
        conv.updatedAt = msg.createdAt;
      }
    }
    this.save();
    return msg;
  }

  // Blocks
  getBlocks(userId: string): BlockRecord[] {
    return this.data.blocks.filter(b => b.blockerId === userId);
  }

  isBlocked(userA: string, userB: string): boolean {
    return this.data.blocks.some(
      b => (b.blockerId === userA && b.blockedId === userB) || (b.blockerId === userB && b.blockedId === userA)
    );
  }

  addBlock(blockerId: string, blockedId: string): BlockRecord {
    const existing = this.data.blocks.find(b => b.blockerId === blockerId && b.blockedId === blockedId);
    if (existing) return existing;

    const record: BlockRecord = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      blockerId,
      blockedId,
      createdAt: new Date().toISOString(),
    };
    this.data.blocks.push(record);
    this.save();
    return record;
  }

  removeBlock(blockerId: string, blockedId: string): boolean {
    const len = this.data.blocks.length;
    this.data.blocks = this.data.blocks.filter(b => !(b.blockerId === blockerId && b.blockedId === blockedId));
    this.save();
    return this.data.blocks.length < len;
  }

  // Reports & Moderation
  getReports(): Report[] {
    return this.data.reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getReportById(id: string): Report | undefined {
    return this.data.reports.find(r => r.id === id);
  }

  createReport(report: Report): Report {
    this.data.reports.push(report);
    this.save();
    return report;
  }

  updateReport(id: string, updates: Partial<Report>): Report | undefined {
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.data.reports[idx] = { ...this.data.reports[idx], ...updates };
    this.save();
    return this.data.reports[idx];
  }

  // Activity Attempts & Badges
  recordActivityAttempt(attempt: ActivityAttempt): void {
    this.data.activityAttempts.push(attempt);
    const user = this.getUserById(attempt.userId);
    if (user) {
      user.points = (user.points || 0) + attempt.pointsEarned;
    }
    this.save();
  }

  getUserAchievements(userId: string): string[] {
    const user = this.getUserById(userId);
    if (!user) return [];
    return user.badges || [];
  }

  awardBadge(userId: string, badgeKey: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    if (!user.badges) user.badges = [];
    if (!user.badges.includes(badgeKey)) {
      user.badges.push(badgeKey);
      this.data.userAchievements.push({
        userId,
        badgeKey,
        earnedAt: new Date().toISOString(),
      });
      user.points = (user.points || 0) + 50; // Award 50 bonus points for badge
      this.save();
      return true;
    }
    return false;
  }

  // QR Token Management
  getQRTokens(): QRToken[] {
    if (!this.data.qrTokens) this.data.qrTokens = [];
    return this.data.qrTokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createQRToken(params: {
    type: 'public_entry' | 'journey_join' | 'group_join';
    targetId?: string;
    label?: string;
    expiresInHours?: number;
    maxUses?: number;
    createdBy?: string;
  }): QRToken {
    if (!this.data.qrTokens) this.data.qrTokens = [];
    const crypto = require('crypto');
    const tokenStr = `vbt_${crypto.randomBytes(12).toString('hex')}`;
    const hours = params.expiresInHours || 48;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 3600000).toISOString();

    const record: QRToken = {
      id: `qrt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      token: tokenStr,
      type: params.type,
      targetId: params.targetId,
      label: params.label || (params.type === 'journey_join' ? 'Journey Join Pass' : params.type === 'group_join' ? 'Group Join Pass' : 'VIBE Community Pass'),
      expiresAt,
      isRevoked: false,
      maxUses: params.maxUses || 500,
      usedCount: 0,
      createdBy: params.createdBy,
      createdAt: now.toISOString(),
    };

    this.data.qrTokens.push(record);
    this.save();
    return record;
  }

  validateQRToken(tokenString: string): { valid: boolean; error?: string; qrToken?: QRToken; targetJourney?: Journey; targetGroup?: Group } {
    if (!this.data.qrTokens) this.data.qrTokens = [];
    const token = this.data.qrTokens.find(t => t.token === tokenString.trim());
    if (!token) {
      return { valid: false, error: 'Invalid QR token. No matching pass found.' };
    }
    if (token.isRevoked) {
      return { valid: false, error: 'This QR pass has been revoked by safety administrators.' };
    }
    if (new Date(token.expiresAt) < new Date()) {
      return { valid: false, error: 'This QR pass has expired.' };
    }
    if (token.maxUses && token.usedCount >= token.maxUses) {
      return { valid: false, error: 'This QR pass has reached its maximum passenger usage limit.' };
    }

    let targetJourney: Journey | undefined;
    let targetGroup: Group | undefined;

    if (token.type === 'journey_join' && token.targetId) {
      targetJourney = this.getJourneyById(token.targetId);
    } else if (token.type === 'group_join' && token.targetId) {
      targetGroup = this.getGroupById(token.targetId);
    }

    return { valid: true, qrToken: token, targetJourney, targetGroup };
  }

  useQRToken(tokenString: string): boolean {
    if (!this.data.qrTokens) this.data.qrTokens = [];
    const token = this.data.qrTokens.find(t => t.token === tokenString.trim());
    if (!token) return false;
    token.usedCount = (token.usedCount || 0) + 1;
    this.save();
    return true;
  }

  revokeQRToken(tokenId: string): boolean {
    if (!this.data.qrTokens) this.data.qrTokens = [];
    const token = this.data.qrTokens.find(t => t.id === tokenId);
    if (!token) return false;
    token.isRevoked = true;
    this.save();
    return true;
  }

  // Reputation & Score Ledger Management
  getScoreEvents(userId?: string): ScoreEvent[] {
    if (!this.data.scoreEvents) this.data.scoreEvents = [];
    if (userId) {
      return this.data.scoreEvents.filter(e => e.targetUserId === userId || e.voterUserId === userId);
    }
    return this.data.scoreEvents;
  }

  getDistinctPositiveVoterCount(targetUserId: string, journeyId: string): number {
    if (!this.data.scoreEvents) this.data.scoreEvents = [];
    const distinctVoters = new Set(
      this.data.scoreEvents
        .filter(e => e.targetUserId === targetUserId && e.journeyId === journeyId && e.voteType === 'positive' && e.status === 'active')
        .map(e => e.voterUserId)
    );
    return distinctVoters.size;
  }

  hasUserVotedOnJourney(voterUserId: string, targetUserId: string, journeyId: string): boolean {
    if (!this.data.scoreEvents) this.data.scoreEvents = [];
    return this.data.scoreEvents.some(
      e => e.voterUserId === voterUserId && e.targetUserId === targetUserId && e.journeyId === journeyId && e.status === 'active'
    );
  }

  createScoreEvent(params: {
    journeyId: string;
    voterUserId: string;
    targetUserId: string;
    voteType: 'positive' | 'negative';
    reasonCategory?: string;
  }): { success: boolean; error?: string; event?: ScoreEvent; newScore?: number; isRestricted?: boolean } {
    if (!this.data.scoreEvents) this.data.scoreEvents = [];
    if (!this.data.restrictions) this.data.restrictions = [];

    const { journeyId, voterUserId, targetUserId, voteType, reasonCategory } = params;

    // Self voting prevention
    if (voterUserId === targetUserId) {
      return { success: false, error: 'Self-feedback is strictly disallowed.' };
    }

    const voter = this.getUserById(voterUserId);
    const target = this.getUserById(targetUserId);
    if (!voter || !target) {
      return { success: false, error: 'Voter or target passenger does not exist.' };
    }

    // Voter cannot be restricted
    this.checkAndExpireRestrictions();
    if (voter.isRestricted) {
      return { success: false, error: 'Accounts under temporary restriction cannot submit feedback.' };
    }

    // One vote per voter-target-journey combination
    if (this.hasUserVotedOnJourney(voterUserId, targetUserId, journeyId)) {
      return { success: false, error: 'You have already submitted feedback for this passenger on this journey. Duplicate voting is not permitted.' };
    }

    // Three-positive-voter limit per target per journey
    if (voteType === 'positive') {
      const distinctPositiveCount = this.getDistinctPositiveVoterCount(targetUserId, journeyId);
      if (distinctPositiveCount >= 3) {
        return { 
          success: false, 
          error: 'This passenger has already received the maximum 3 positive feedback recognitions from distinct travelers on this journey.' 
        };
      }
    }

    const delta = voteType === 'positive' ? 2 : -2;
    const now = new Date().toISOString();

    const event: ScoreEvent = {
      id: `se_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      journeyId,
      voterUserId,
      targetUserId,
      voteType,
      pointDelta: delta,
      reasonCategory: reasonCategory || (voteType === 'positive' ? 'Helpful and respectful interaction' : 'Difficult interaction'),
      status: 'active',
      createdAt: now,
    };

    this.data.scoreEvents.push(event);

    // Recalculate target score from base (100) + sum of active events
    const activeEvents = this.data.scoreEvents.filter(e => e.targetUserId === targetUserId && e.status === 'active');
    const computedScore = 100 + activeEvents.reduce((acc, curr) => acc + curr.pointDelta, 0);

    target.reputationScore = computedScore;
    target.updatedAt = now;

    // Check if score strictly drops below 90
    let isRestricted = target.isRestricted;
    if (computedScore < 90 && !target.isRestricted) {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      target.isRestricted = true;
      target.restrictionExpiresAt = expiry;
      target.restrictionReason = 'Reputation score fell below 90 points based on contextual journey interactions.';
      isRestricted = true;

      const restrictionRecord: RestrictionRecord = {
        id: `rst_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: targetUserId,
        triggerScore: computedScore,
        startedAt: now,
        expiresAt: expiry,
        reason: target.restrictionReason,
        policyVersion: 'v1.0-mvp-24h',
        status: 'active',
      };
      this.data.restrictions.push(restrictionRecord);
    }

    this.save();
    return { success: true, event, newScore: computedScore, isRestricted };
  }

  getScoreHistory(userId: string) {
    if (!this.data.scoreEvents) this.data.scoreEvents = [];
    const user = this.getUserById(userId);
    const events = this.data.scoreEvents
      .filter(e => e.targetUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(e => ({
        id: e.id,
        journeyId: e.journeyId,
        voteType: e.voteType,
        pointDelta: e.pointDelta,
        reasonCategory: e.reasonCategory,
        status: e.status,
        reversalReason: e.reversalReason,
        createdAt: e.createdAt,
      })); // Voter identity is hidden for privacy!

    return {
      baseScore: user?.baseScore ?? 100,
      currentScore: user?.reputationScore ?? 100,
      isRestricted: user?.isRestricted ?? false,
      restrictionExpiresAt: user?.restrictionExpiresAt,
      restrictionReason: user?.restrictionReason,
      events,
    };
  }

  reverseScoreEvent(eventId: string, moderatorId: string, reason: string): { success: boolean; error?: string; newScore?: number } {
    if (!this.data.scoreEvents) this.data.scoreEvents = [];
    const event = this.data.scoreEvents.find(e => e.id === eventId);
    if (!event) return { success: false, error: 'Score event not found' };
    if (event.status === 'reversed') return { success: false, error: 'Event has already been reversed' };

    const now = new Date().toISOString();
    event.status = 'reversed';
    event.reversalReason = reason;
    event.reversedBy = moderatorId;
    event.reversedAt = now;

    const target = this.getUserById(event.targetUserId);
    let computedScore = 100;
    if (target) {
      const activeEvents = this.data.scoreEvents.filter(e => e.targetUserId === target.id && e.status === 'active');
      computedScore = 100 + activeEvents.reduce((acc, curr) => acc + curr.pointDelta, 0);
      target.reputationScore = computedScore;
      target.updatedAt = now;

      // If score is now >= 90, lift restriction if it was caused by this score
      if (computedScore >= 90 && target.isRestricted) {
        target.isRestricted = false;
        target.restrictionExpiresAt = undefined;
        target.restrictionReason = undefined;

        // update active restriction record
        const activeRest = this.data.restrictions.find(r => r.userId === target.id && r.status === 'active');
        if (activeRest) {
          activeRest.status = 'lifted';
        }
      }
    }

    this.save();
    return { success: true, newScore: computedScore };
  }

  checkAndExpireRestrictions(): void {
    if (!this.data.restrictions) this.data.restrictions = [];
    const now = new Date();
    for (const r of this.data.restrictions) {
      if (r.status === 'active' && new Date(r.expiresAt) <= now) {
        r.status = 'expired';
        const user = this.getUserById(r.userId);
        if (user && user.isRestricted) {
          const hasOtherActive = this.data.restrictions.some(o => o.userId === user.id && o.status === 'active' && o.id !== r.id);
          if (!hasOtherActive) {
            user.isRestricted = false;
            user.restrictionExpiresAt = undefined;
            user.restrictionReason = undefined;
          }
        }
      }
    }
  }

  submitAppeal(userId: string, userExplanation: string, restrictionId?: string, scoreEventId?: string): ReputationAppeal {
    if (!this.data.appeals) this.data.appeals = [];
    const user = this.getUserById(userId);
    const appeal: ReputationAppeal = {
      id: `apl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      username: user?.username || user?.displayName,
      restrictionId,
      scoreEventId,
      userExplanation,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.data.appeals.push(appeal);
    this.save();
    return appeal;
  }

  getAppeals(): ReputationAppeal[] {
    if (!this.data.appeals) this.data.appeals = [];
    return this.data.appeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  decideAppeal(appealId: string, decision: 'approved' | 'rejected', notes: string, moderatorId: string): { success: boolean; error?: string } {
    if (!this.data.appeals) this.data.appeals = [];
    const appeal = this.data.appeals.find(a => a.id === appealId);
    if (!appeal) return { success: false, error: 'Appeal not found' };

    const now = new Date().toISOString();
    appeal.status = decision;
    appeal.decisionNotes = notes;
    appeal.moderatorId = moderatorId;
    appeal.resolvedAt = now;

    if (decision === 'approved') {
      const user = this.getUserById(appeal.userId);
      if (user) {
        user.isRestricted = false;
        user.restrictionExpiresAt = undefined;
        user.restrictionReason = undefined;
      }
      if (appeal.restrictionId) {
        const rest = this.data.restrictions.find(r => r.id === appeal.restrictionId);
        if (rest) rest.status = 'lifted';
      }
      if (appeal.scoreEventId) {
        this.reverseScoreEvent(appeal.scoreEventId, moderatorId, `Reversed following approved appeal ${appealId}: ${notes}`);
      }
    }

    this.save();
    return { success: true };
  }
}

// Global singleton instance
export const db = new Database();
