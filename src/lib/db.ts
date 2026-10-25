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
  ActivityAttempt, 
  AchievementBadge,
  ScoreEvent,
  RestrictionRecord,
  ReputationAppeal,
  QRToken
} from '@/types';
import { getSupabaseAdmin } from './supabase/admin';

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

// Ensure data directory exists for local caching
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // Ignore errors in environments with read-only root
  }
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
  const crypto = require('crypto');
  return crypto.pbkdf2Sync(password, 'vibe_salt_2026', 1000, 32, 'sha256').toString('hex');
}

const DEFAULT_PASSWORD_HASH = hashPassword('password123');

function getSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  const travelDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

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
      trainName: 'Mumbai Tejas Rajdhani Express',
      travelDate,
      boardingStation: 'Mumbai Central (MMCT)',
      destinationStation: 'New Delhi (NDLS)',
      durationHours: 15.5,
      discoveryEnabled: true,
      conversationGoals: ['Tech discussions', 'System architecture', 'Chess games'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'jrn_2',
      userId: 'usr_2',
      trainNumber: '12951',
      trainName: 'Mumbai Tejas Rajdhani Express',
      travelDate,
      boardingStation: 'Surat (ST)',
      destinationStation: 'New Delhi (NDLS)',
      durationHours: 12.0,
      discoveryEnabled: true,
      conversationGoals: ['AI ethics study', 'Language practice', 'Tech networking'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'jrn_3',
      userId: 'usr_3',
      trainNumber: '12951',
      trainName: 'Mumbai Tejas Rajdhani Express',
      travelDate,
      boardingStation: 'Vadodara Jn (BRC)',
      destinationStation: 'Hazrat Nizamuddin (NZM)',
      durationHours: 11.5,
      discoveryEnabled: true,
      conversationGoals: ['History & policy debate', 'Book discussions'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'jrn_4',
      userId: 'usr_4',
      trainNumber: '12951',
      trainName: 'Mumbai Tejas Rajdhani Express',
      travelDate,
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
    { id: 'gm_10', groupId: 'grp_4', userId: 'usr_1', role: 'member', joinedAt: now },
    { id: 'gm_11', groupId: 'grp_4', userId: 'usr_2', role: 'member', joinedAt: now },
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
    {
      id: 'msg_1',
      groupId: 'grp_1',
      senderId: 'usr_1',
      senderName: 'Aarav Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      content: 'Welcome passengers to the Mumbai Rajdhani Tech Cohort! Anyone else looking into WebAssembly or Edge AI optimizations?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg_2',
      groupId: 'grp_1',
      senderId: 'usr_2',
      senderName: 'Priya Nair',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      content: 'Hey Aarav! Yes, working on lightweight models for low-bandwidth scenarios like train travel. Great to meet you.',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'msg_3',
      conversationId: 'conv_1_2',
      senderId: 'usr_1',
      senderName: 'Aarav Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      content: 'Hi Priya, saw you are in Coach B2 as well. Let me know if you want to collaborate on the PyTorch paper discussion later.',
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'msg_4',
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

export class Database {
  private data: DatabaseSchema;
  private isSupabaseSyncing = false;

  constructor() {
    this.data = this.readFromDisk();
    this.initSupabaseSync();
  }

  private isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  private initSupabaseSync(): void {
    if (this.isSupabaseConfigured() && typeof window === 'undefined') {
      this.syncFromSupabase().catch(() => {});
    }
  }

  public async syncFromSupabase(): Promise<void> {
    if (!this.isSupabaseConfigured() || this.isSupabaseSyncing) return;
    this.isSupabaseSyncing = true;
    try {
      const s = getSupabaseAdmin();
      const [
        profRes,
        jrnRes,
        grpRes,
        gmRes,
        convRes,
        msgRes,
        blkRes,
        repRes,
        qrRes,
        seRes,
        rstRes,
        aplRes,
        attRes,
        achRes
      ] = await Promise.all([
        s.from('profiles').select('*'),
        s.from('journeys').select('*'),
        s.from('groups').select('*'),
        s.from('group_members').select('*'),
        s.from('conversations').select('*'),
        s.from('messages').select('*'),
        s.from('blocks').select('*'),
        s.from('reports').select('*'),
        s.from('qr_tokens').select('*'),
        s.from('score_events').select('*'),
        s.from('restrictions').select('*'),
        s.from('appeals').select('*'),
        s.from('activity_attempts').select('*'),
        s.from('user_achievements').select('*'),
      ]);

      if (profRes.data && profRes.data.length > 0) {
        this.data.users = profRes.data.map(p => ({
          id: p.id,
          email: p.email,
          username: p.username,
          usernameUpdatedAt: p.username_updated_at || undefined,
          passwordHash: p.password_hash || DEFAULT_PASSWORD_HASH,
          displayName: p.display_name,
          avatarUrl: p.avatar_url || '',
          bio: p.bio || '',
          interests: p.interests || [],
          skillsToShare: p.skills_to_share || [],
          skillsToLearn: p.skills_to_learn || [],
          learningGoals: p.learning_goals || [],
          conversationTopics: p.conversation_topics || [],
          languages: p.languages || [],
          discoveryOptIn: p.discovery_opt_in ?? true,
          profileVisibility: p.profile_visibility || 'journey_only',
          role: p.role || 'passenger',
          points: p.points ?? 50,
          baseScore: p.base_score ?? 100,
          reputationScore: p.reputation_score ?? 100,
          isRestricted: p.is_restricted ?? false,
          restrictionExpiresAt: p.restriction_expires_at || undefined,
          restrictionReason: p.restriction_reason || undefined,
          badges: p.badges || [],
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
      }

      if (jrnRes.data) {
        this.data.journeys = jrnRes.data.map(j => ({
          id: j.id,
          userId: j.user_id,
          trainNumber: j.train_number,
          trainName: j.train_name,
          travelDate: j.travel_date,
          boardingStation: j.boarding_station,
          destinationStation: j.destination_station,
          durationHours: j.duration_hours ? Number(j.duration_hours) : undefined,
          discoveryEnabled: j.discovery_enabled ?? true,
          conversationGoals: j.conversation_goals || [],
          status: j.status || 'upcoming',
          createdAt: j.created_at,
          updatedAt: j.updated_at,
        }));
      }

      if (grpRes.data) {
        this.data.groups = grpRes.data.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          trainNumber: g.train_number || undefined,
          category: g.category,
          rules: g.rules || [],
          createdBy: g.created_by,
          memberCount: g.member_count ?? 1,
          createdAt: g.created_at,
        }));
      }

      if (gmRes.data) {
        this.data.groupMembers = gmRes.data.map(m => ({
          id: m.id,
          groupId: m.group_id,
          userId: m.user_id,
          role: m.role || 'member',
          joinedAt: m.joined_at,
        }));
      }

      if (convRes.data) {
        this.data.conversations = convRes.data.map(c => ({
          id: c.id,
          participantIds: c.participant_ids as [string, string],
          lastMessage: c.last_message || undefined,
          lastMessageAt: c.last_message_at || undefined,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }

      if (msgRes.data) {
        this.data.messages = msgRes.data.map(m => ({
          id: m.id,
          conversationId: m.conversation_id || null,
          groupId: m.group_id || null,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderAvatar: m.sender_avatar || '',
          content: m.content,
          createdAt: m.created_at,
        }));
      }

      if (blkRes.data) {
        this.data.blocks = blkRes.data.map(b => ({
          id: b.id,
          blockerId: b.blocker_id,
          blockedId: b.blocked_id,
          createdAt: b.created_at,
        }));
      }

      if (repRes.data) {
        this.data.reports = repRes.data.map(r => ({
          id: r.id,
          reporterId: r.reporter_id,
          reportedUserId: r.reported_user_id || null,
          reportedGroupId: r.reported_group_id || null,
          reportedMessageId: r.reported_message_id || null,
          category: r.category as any,
          reason: r.reason,
          status: r.status as any,
          notes: r.notes || undefined,
          moderatorId: r.moderator_id || null,
          resolutionAction: r.resolution_action as any,
          resolvedAt: r.resolved_at || null,
          createdAt: r.created_at,
        }));
      }

      if (qrRes.data) {
        this.data.qrTokens = qrRes.data.map(q => ({
          id: q.id,
          token: q.token,
          type: q.type as any,
          targetId: q.target_id || undefined,
          label: q.label || undefined,
          expiresAt: q.expires_at,
          isRevoked: q.is_revoked ?? false,
          maxUses: q.max_uses || undefined,
          usedCount: q.used_count ?? 0,
          createdBy: q.created_by || undefined,
          createdAt: q.created_at,
        }));
      }

      if (seRes.data) {
        this.data.scoreEvents = seRes.data.map(e => ({
          id: e.id,
          journeyId: e.journey_id,
          voterUserId: e.voter_user_id,
          targetUserId: e.target_user_id,
          voteType: e.vote_type as any,
          pointDelta: e.point_delta,
          reasonCategory: e.reason_category || undefined,
          status: e.status as any,
          reversalReason: e.reversal_reason || undefined,
          reversalBy: e.reversal_by || undefined,
          reversedBy: e.reversed_by || undefined,
          reversedAt: e.reversed_at || undefined,
          createdAt: e.created_at,
        }));
      }

      if (rstRes.data) {
        this.data.restrictions = rstRes.data.map(r => ({
          id: r.id,
          userId: r.user_id,
          triggerScore: r.trigger_score,
          startedAt: r.started_at,
          expiresAt: r.expires_at,
          reason: r.reason,
          policyVersion: r.policy_version,
          status: r.status as any,
          appealId: r.appeal_id || undefined,
        }));
      }

      if (aplRes.data) {
        this.data.appeals = aplRes.data.map(a => ({
          id: a.id,
          userId: a.user_id,
          username: a.username || undefined,
          restrictionId: a.restriction_id || undefined,
          scoreEventId: a.score_event_id || undefined,
          userExplanation: a.user_explanation,
          status: a.status as any,
          decisionNotes: a.decision_notes || undefined,
          moderatorId: a.moderator_id || undefined,
          createdAt: a.created_at,
          resolvedAt: a.resolved_at || undefined,
        }));
      }

      if (attRes.data) {
        this.data.activityAttempts = attRes.data.map(a => ({
          id: a.id,
          userId: a.user_id,
          activityId: a.activity_id,
          score: a.score,
          maxScore: a.max_score,
          pointsEarned: a.points_earned,
          completedAt: a.completed_at,
        }));
      }

      if (achRes.data) {
        this.data.userAchievements = achRes.data.map(a => ({
          userId: a.user_id,
          badgeKey: a.badge_key,
          earnedAt: a.earned_at,
        }));
      }

      this.writeToDisk(this.data);
    } catch (e) {
      // Background sync error
    } finally {
      this.isSupabaseSyncing = false;
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(fileContent);
        if (!parsed.scoreEvents) parsed.scoreEvents = [];
        if (!parsed.restrictions) parsed.restrictions = [];
        if (!parsed.appeals) parsed.appeals = [];
        if (!parsed.qrTokens) parsed.qrTokens = [];
        return parsed;
      }
    } catch {
      // Fallback
    }
    return getSeedData();
  }

  private writeToDisk(data: DatabaseSchema): void {
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch {
      // Ignore write failures in read-only / test environments
    }
  }

  private save(): void {
    this.writeToDisk(this.data);
  }

  private async asyncSupabaseWrite(action: (s: ReturnType<typeof getSupabaseAdmin>) => Promise<any>): Promise<void> {
    if (!this.isSupabaseConfigured() || typeof window !== 'undefined') return;
    try {
      const s = getSupabaseAdmin();
      await action(s);
    } catch {
      // Safe background persistence
    }
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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('profiles').upsert({
        id: user.id,
        email: user.email,
        username: user.username,
        password_hash: user.passwordHash,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        interests: user.interests,
        skills_to_share: user.skillsToShare,
        skills_to_learn: user.skillsToLearn,
        learning_goals: user.learningGoals,
        conversation_topics: user.conversationTopics,
        languages: user.languages,
        discovery_opt_in: user.discoveryOptIn,
        profile_visibility: user.profileVisibility,
        role: user.role,
        points: user.points,
        base_score: user.baseScore,
        reputation_score: user.reputationScore,
        is_restricted: user.isRestricted,
        badges: user.badges,
      });
    });

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
    const updated = this.data.users[idx];
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      const payload: any = { updated_at: updated.updatedAt };
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.interests !== undefined) payload.interests = updates.interests;
      if (updates.skillsToShare !== undefined) payload.skills_to_share = updates.skillsToShare;
      if (updates.skillsToLearn !== undefined) payload.skills_to_learn = updates.skillsToLearn;
      if (updates.learningGoals !== undefined) payload.learning_goals = updates.learningGoals;
      if (updates.conversationTopics !== undefined) payload.conversation_topics = updates.conversationTopics;
      if (updates.languages !== undefined) payload.languages = updates.languages;
      if (updates.discoveryOptIn !== undefined) payload.discovery_opt_in = updates.discoveryOptIn;
      if (updates.profileVisibility !== undefined) payload.profile_visibility = updates.profileVisibility;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.points !== undefined) payload.points = updates.points;
      if (updates.reputationScore !== undefined) payload.reputation_score = updates.reputationScore;
      if (updates.isRestricted !== undefined) payload.is_restricted = updates.isRestricted;
      if (updates.restrictionExpiresAt !== undefined) payload.restriction_expires_at = updates.restrictionExpiresAt;
      if (updates.restrictionReason !== undefined) payload.restriction_reason = updates.restrictionReason;
      if (updates.badges !== undefined) payload.badges = updates.badges;
      if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
      await s.from('profiles').update(payload).eq('id', id);
    });

    return updated;
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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('profiles').update({
        username: user.username,
        username_updated_at: user.usernameUpdatedAt,
        updated_at: user.updatedAt,
      }).eq('id', userId);
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('profiles').delete().eq('id', id);
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('journeys').upsert({
        id: journey.id,
        user_id: journey.userId,
        train_number: journey.trainNumber,
        train_name: journey.trainName,
        travel_date: journey.travelDate,
        boarding_station: journey.boardingStation,
        destination_station: journey.destinationStation,
        duration_hours: journey.durationHours,
        discovery_enabled: journey.discoveryEnabled,
        conversation_goals: journey.conversationGoals,
        status: journey.status,
      });
    });

    return journey;
  }

  deleteJourney(id: string): boolean {
    const len = this.data.journeys.length;
    this.data.journeys = this.data.journeys.filter(j => j.id !== id);
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('journeys').delete().eq('id', id);
    });

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
    const memberId = `gm_${Date.now()}`;
    this.data.groupMembers.push({
      id: memberId,
      groupId: group.id,
      userId: group.createdBy,
      role: 'admin',
      joinedAt: new Date().toISOString(),
    });
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('groups').insert({
        id: group.id,
        name: group.name,
        description: group.description,
        train_number: group.trainNumber,
        category: group.category,
        rules: group.rules,
        created_by: group.createdBy,
        member_count: group.memberCount,
      });
      await s.from('group_members').insert({
        id: memberId,
        group_id: group.id,
        user_id: group.createdBy,
        role: 'admin',
      });
    });

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

    const gmId = `gm_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.data.groupMembers.push({
      id: gmId,
      groupId,
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
    });
    group.memberCount += 1;
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('group_members').insert({
        id: gmId,
        group_id: groupId,
        user_id: userId,
        role: 'member',
      });
      await s.from('groups').update({ member_count: group.memberCount }).eq('id', groupId);
    });

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

      this.asyncSupabaseWrite(async (s) => {
        await s.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
        await s.from('groups').update({ member_count: group.memberCount }).eq('id', groupId);
      });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('conversations').insert({
        id: newConv.id,
        participant_ids: newConv.participantIds,
        created_at: newConv.createdAt,
        updated_at: newConv.updatedAt,
      });
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('messages').insert({
        id: msg.id,
        conversation_id: msg.conversationId || null,
        group_id: msg.groupId || null,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_avatar: msg.senderAvatar,
        content: msg.content,
        created_at: msg.createdAt,
      });
      if (msg.conversationId) {
        await s.from('conversations').update({
          last_message: msg.content,
          last_message_at: msg.createdAt,
          updated_at: msg.createdAt,
        }).eq('id', msg.conversationId);
      }
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('blocks').insert({
        id: record.id,
        blocker_id: record.blockerId,
        blocked_id: record.blockedId,
        created_at: record.createdAt,
      });
    });

    return record;
  }

  removeBlock(blockerId: string, blockedId: string): boolean {
    const len = this.data.blocks.length;
    this.data.blocks = this.data.blocks.filter(b => !(b.blockerId === blockerId && b.blockedId === blockedId));
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('reports').insert({
        id: report.id,
        reporter_id: report.reporterId,
        reported_user_id: report.reportedUserId || null,
        reported_group_id: report.reportedGroupId || null,
        reported_message_id: report.reportedMessageId || null,
        category: report.category,
        reason: report.reason,
        status: report.status,
        notes: report.notes || null,
        moderator_id: report.moderatorId || null,
        resolution_action: report.resolutionAction || null,
        resolved_at: report.resolvedAt || null,
        created_at: report.createdAt,
      });
    });

    return report;
  }

  updateReport(id: string, updates: Partial<Report>): Report | undefined {
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.data.reports[idx] = { ...this.data.reports[idx], ...updates };
    const updated = this.data.reports[idx];
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.moderatorId !== undefined) payload.moderator_id = updates.moderatorId;
      if (updates.resolutionAction !== undefined) payload.resolution_action = updates.resolutionAction;
      if (updates.resolvedAt !== undefined) payload.resolved_at = updates.resolvedAt;
      await s.from('reports').update(payload).eq('id', id);
    });

    return updated;
  }

  // Activity Attempts & Badges
  recordActivityAttempt(attempt: ActivityAttempt): void {
    this.data.activityAttempts.push(attempt);
    const user = this.getUserById(attempt.userId);
    if (user) {
      user.points = (user.points || 0) + attempt.pointsEarned;
    }
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('activity_attempts').insert({
        id: attempt.id,
        user_id: attempt.userId,
        activity_id: attempt.activityId,
        score: attempt.score,
        max_score: attempt.maxScore,
        points_earned: attempt.pointsEarned,
        completed_at: attempt.completedAt,
      });
      if (user) {
        await s.from('profiles').update({ points: user.points }).eq('id', user.id);
      }
    });
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
      user.points = (user.points || 0) + 50;
      this.save();

      this.asyncSupabaseWrite(async (s) => {
        await s.from('user_achievements').insert({
          user_id: userId,
          badge_key: badgeKey,
        });
        await s.from('profiles').update({
          badges: user.badges,
          points: user.points,
        }).eq('id', userId);
      });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('qr_tokens').insert({
        id: record.id,
        token: record.token,
        type: record.type,
        target_id: record.targetId || null,
        label: record.label,
        expires_at: record.expiresAt,
        is_revoked: record.isRevoked,
        max_uses: record.maxUses,
        used_count: record.usedCount,
        created_by: record.createdBy || null,
      });
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('qr_tokens').update({ used_count: token.usedCount }).eq('token', token.token);
    });

    return true;
  }

  revokeQRToken(tokenId: string): boolean {
    if (!this.data.qrTokens) this.data.qrTokens = [];
    const token = this.data.qrTokens.find(t => t.id === tokenId);
    if (!token) return false;
    token.isRevoked = true;
    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('qr_tokens').update({ is_revoked: true }).eq('id', tokenId);
    });

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
    let restrictionRecord: RestrictionRecord | undefined;

    if (computedScore < 90 && !target.isRestricted) {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      target.isRestricted = true;
      target.restrictionExpiresAt = expiry;
      target.restrictionReason = 'Reputation score fell below 90 points based on contextual journey interactions.';
      isRestricted = true;

      restrictionRecord = {
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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('score_events').insert({
        id: event.id,
        journey_id: event.journeyId,
        voter_user_id: event.voterUserId,
        target_user_id: event.targetUserId,
        vote_type: event.voteType,
        point_delta: event.pointDelta,
        reason_category: event.reasonCategory,
        status: event.status,
      });
      await s.from('profiles').update({
        reputation_score: target.reputationScore,
        is_restricted: target.isRestricted,
        restriction_expires_at: target.restrictionExpiresAt,
        restriction_reason: target.restrictionReason,
        updated_at: target.updatedAt,
      }).eq('id', targetUserId);

      if (restrictionRecord) {
        await s.from('restrictions').insert({
          id: restrictionRecord.id,
          user_id: restrictionRecord.userId,
          trigger_score: restrictionRecord.triggerScore,
          started_at: restrictionRecord.startedAt,
          expires_at: restrictionRecord.expiresAt,
          reason: restrictionRecord.reason,
          policy_version: restrictionRecord.policyVersion,
          status: restrictionRecord.status,
        });
      }
    });

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
      }));

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

      if (computedScore >= 90 && target.isRestricted) {
        target.isRestricted = false;
        target.restrictionExpiresAt = undefined;
        target.restrictionReason = undefined;

        const activeRest = this.data.restrictions.find(r => r.userId === target.id && r.status === 'active');
        if (activeRest) {
          activeRest.status = 'lifted';
        }
      }
    }

    this.save();

    this.asyncSupabaseWrite(async (s) => {
      await s.from('score_events').update({
        status: 'reversed',
        reversal_reason: reason,
        reversed_by: moderatorId,
        reversed_at: now,
      }).eq('id', eventId);

      if (target) {
        await s.from('profiles').update({
          reputation_score: target.reputationScore,
          is_restricted: target.isRestricted,
          restriction_expires_at: target.restrictionExpiresAt,
          restriction_reason: target.restrictionReason,
          updated_at: target.updatedAt,
        }).eq('id', target.id);
      }
    });

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
        this.asyncSupabaseWrite(async (s) => {
          await s.from('restrictions').update({ status: 'expired' }).eq('id', r.id);
          if (user) {
            await s.from('profiles').update({
              is_restricted: user.isRestricted,
              restriction_expires_at: user.restrictionExpiresAt,
              restriction_reason: user.restrictionReason,
            }).eq('id', user.id);
          }
        });
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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('appeals').insert({
        id: appeal.id,
        user_id: appeal.userId,
        username: appeal.username,
        restriction_id: appeal.restrictionId || null,
        score_event_id: appeal.scoreEventId || null,
        user_explanation: appeal.userExplanation,
        status: appeal.status,
      });
    });

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

    this.asyncSupabaseWrite(async (s) => {
      await s.from('appeals').update({
        status: decision,
        decision_notes: notes,
        moderator_id: moderatorId,
        resolved_at: now,
      }).eq('id', appealId);
    });

    return { success: true };
  }
}

// Global singleton instance
export const db = new Database();
