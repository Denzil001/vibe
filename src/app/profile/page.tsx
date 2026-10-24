'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X,
  Languages,
  BookOpen,
  EyeOff,
  Train,
  Flame,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Scale
} from 'lucide-react';
import { SafeUser } from '@/types';

const AVAILABLE_INTERESTS = [
  'Tech & Coding',
  'Civil Services / UPSC',
  'Language Learning',
  'Literature & Books',
  'Chess & Puzzles',
  'Photography',
  'Startup Ecosystem',
  'Indian History',
  'Acoustic Music',
  'Travel Stories',
  'Cooking & Regional Food',
  'Science & Astronomy',
];

const AVAILABLE_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  
  // Mutable Fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; error?: string; suggestions?: string[] }>({ checking: false });
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [usernameSuccessMsg, setUsernameSuccessMsg] = useState('');

  const [interests, setInterests] = useState<string[]>([]);
  const [skillsToShare, setSkillsToShare] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [conversationTopics, setConversationTopics] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [discoveryOptIn, setDiscoveryOptIn] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'journey_only' | 'private'>('journey_only');

  // Input helpers
  const [newShareSkill, setNewShareSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Score History & Appeal states
  const [scoreHistory, setScoreHistory] = useState<any>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealExplanation, setAppealExplanation] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealAlert, setAppealAlert] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(res => (res.ok ? res.json() : null)),
      fetch('/api/reputation/history').then(res => (res.ok ? res.json() : null)),
    ])
      .then(([profData, histData]) => {
        if (!profData?.user) {
          router.push('/login');
          return;
        }
        const u = profData.user;
        setUser(u);
        setDisplayName(u.displayName);
        setBio(u.bio || '');
        setUsername(u.username || '');
        setInitialUsername(u.username || '');
        setInterests(u.interests || []);
        setSkillsToShare(u.skillsToShare || []);
        setSkillsToLearn(u.skillsToLearn || []);
        setLearningGoals(u.learningGoals || []);
        setConversationTopics(u.conversationTopics || []);
        setLanguages(u.languages || ['English', 'Hindi']);
        setDiscoveryOptIn(u.discoveryOptIn !== undefined ? u.discoveryOptIn : true);
        setProfileVisibility(u.profileVisibility || 'journey_only');

        if (histData?.history) {
          setScoreHistory(histData.history);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  // Username validation check
  useEffect(() => {
    if (!username.trim() || username === initialUsername) {
      setUsernameStatus({ checking: false });
      return;
    }

    if (username.length < 3) {
      setUsernameStatus({ checking: false, error: 'Must be at least 3 characters' });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        setUsernameStatus({
          checking: false,
          available: data.available,
          error: data.error,
          suggestions: data.suggestions,
        });
      } catch (e) {
        setUsernameStatus({ checking: false, error: 'Failed to verify availability' });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, initialUsername]);

  const handleUsernameUpdate = async () => {
    if (!username.trim() || username === initialUsername) return;
    setIsUpdatingUsername(true);
    setUsernameSuccessMsg('');
    setStatusMsg(null);

    try {
      const res = await fetch('/api/profile/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUsernameStatus(prev => ({ ...prev, available: false, error: data.error }));
      } else {
        setInitialUsername(username.trim());
        setUsernameSuccessMsg(data.message || 'Username updated successfully!');
        if (user) {
          setUser({ ...user, username: username.trim() });
        }
      }
    } catch (e) {
      setUsernameStatus(prev => ({ ...prev, error: 'Network error updating username' }));
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealExplanation.trim()) return;
    setIsSubmittingAppeal(true);
    setAppealAlert('');

    try {
      const res = await fetch('/api/reputation/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userExplanation: appealExplanation.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppealAlert('Appeal submitted. A safety moderator will review your journey interaction.');
        setAppealExplanation('');
        setTimeout(() => setShowAppealModal(false), 2000);
      } else {
        setAppealAlert(data.error || 'Failed to submit appeal');
      }
    } catch (e) {
      setAppealAlert('Network error submitting appeal');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const toggleInterest = (item: string) => {
    setInterests(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleLanguage = (item: string) => {
    setLanguages(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const addShareSkill = () => {
    if (newShareSkill.trim() && !skillsToShare.includes(newShareSkill.trim())) {
      setSkillsToShare([...skillsToShare, newShareSkill.trim()]);
      setNewShareSkill('');
    }
  };

  const addLearnSkill = () => {
    if (newLearnSkill.trim() && !skillsToLearn.includes(newLearnSkill.trim())) {
      setSkillsToLearn([...skillsToLearn, newLearnSkill.trim()]);
      setNewLearnSkill('');
    }
  };

  const addGoal = () => {
    if (newGoal.trim() && !learningGoals.includes(newGoal.trim())) {
      setLearningGoals([...learningGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !conversationTopics.includes(newTopic.trim())) {
      setConversationTopics([...conversationTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          interests,
          skillsToShare,
          skillsToLearn,
          learningGoals,
          conversationTopics,
          languages,
          discoveryOptIn,
          profileVisibility,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUser(data.user);
      setStatusMsg({ type: 'success', text: 'Profile preferences updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to permanently delete your VIBE account? This will scrub your profile, journey data, blocks, and reports.');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/profile/delete', { method: 'POST' });
      if (res.ok) {
        alert('Your account has been completely removed. Safe travels!');
        router.push('/');
        router.refresh();
      }
    } catch (e) {
      alert('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center flex-1 bg-[#090D16]">
        <div className="font-mono text-xs text-emerald-400 animate-pulse">
          LOADING PASSENGER PROFILE...
        </div>
      </div>
    );
  }

  const reputationScore = user?.reputationScore ?? 100;
  const isRestricted = user?.isRestricted || reputationScore < 90;

  return (
    <div className="py-12 bg-[#090D16] bg-dark-grid-pattern text-slate-100 flex-1 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserIcon className="w-5 h-5 text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Passenger Profile & Preferences
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-400">
              Manage your handle, skills, learning goals, and review your community reputation ledger
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="sys-tag text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              USER ID: {user?.id.slice(0, 10)}...
            </span>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-400' 
              : 'bg-rose-950/40 border border-rose-500/50 text-rose-400'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Reputation Score & Restriction Status Card */}
        <div className={`bento-dark-card p-6 sm:p-7 border ${
          isRestricted ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-black text-xl">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Community Reputation Ledger</h3>
                  {isRestricted ? (
                    <span className="sys-tag text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      RESTRICTED (&lt;90)
                    </span>
                  ) : (
                    <span className="sys-tag text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      GOOD STANDING
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Baseline: <strong>100 pts</strong> • Validated current score: <strong className="text-emerald-400 font-mono text-sm">{reputationScore} pts</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRestricted && (
                <button
                  type="button"
                  onClick={() => setShowAppealModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-navy-950 font-bold font-mono text-xs uppercase"
                >
                  Submit Appeal
                </button>
              )}
            </div>
          </div>

          {isRestricted && (
            <div className="mt-4 p-3 rounded-xl bg-rose-900/20 border border-rose-500/30 text-xs text-rose-300">
              Your account is under temporary interaction restriction because your score fell below 90 based on journey feedback. You cannot create new 1-on-1 chats or join new groups. Expiry: {user?.restrictionExpiresAt ? new Date(user.restrictionExpiresAt).toLocaleString() : '24h default'}.
            </div>
          )}

          {/* Score Events Ledger Preview */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Recent Auditable Ledger Events:
            </span>
            {scoreHistory?.events && scoreHistory.events.length > 0 ? (
              <div className="space-y-2">
                {scoreHistory.events.map((evt: any) => (
                  <div key={evt.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${evt.pointDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {evt.pointDelta > 0 ? `+${evt.pointDelta}` : evt.pointDelta} pts
                      </span>
                      <span className="text-slate-300">{evt.reasonCategory}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{new Date(evt.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No score adjustment events recorded yet. You have full 100 baseline points.</p>
            )}
          </div>
        </div>

        {/* Mutable Username Management Card */}
        <div className="bento-dark-card p-6 sm:p-7 border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Passenger Username (@handle)</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your unique username identifies you across train groups and passenger matches. You can change your username at any time. <strong>Changing your username preserves your user ID, reputation score, voting records, and chat history.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={20}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="button"
              onClick={handleUsernameUpdate}
              disabled={isUpdatingUsername || username === initialUsername || (usernameStatus.available === false)}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-navy-950 font-bold font-mono text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isUpdatingUsername ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                'Save Username'
              )}
            </button>
          </div>

          {usernameStatus.checking && (
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Checking availability...
            </span>
          )}

          {username !== initialUsername && usernameStatus.available && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> @{username} is available!
            </span>
          )}

          {usernameStatus.error && (
            <span className="text-[11px] font-mono text-rose-400">
              {usernameStatus.error}
            </span>
          )}

          {usernameSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{usernameSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Profile Details Form */}
        <div className="bento-dark-card p-6 sm:p-8">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Short Bio / Introduction
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share a friendly overview of who you are, what you work on, or what you enjoy chatting about during train journeys..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400 placeholder-slate-600"
              />
            </div>

            {/* Interests Tag Selector */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Passenger Interests & Hobbies (Tap to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_INTERESTS.map(item => {
                  const active = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        active
                          ? 'bg-emerald-400 text-navy-950 font-bold border border-emerald-400 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills to Share & Learn */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
                  Skills You Can Share / Teach
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newShareSkill}
                    onChange={e => setNewShareSkill(e.target.value)}
                    placeholder="e.g. React.js, Chess, Spanish"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addShareSkill}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 font-mono text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsToShare.map((s, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      {s}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSkillsToShare(skillsToShare.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">
                  Skills You Want to Learn
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLearnSkill}
                    onChange={e => setNewLearnSkill(e.target.value)}
                    placeholder="e.g. ML basics, Marathi, UI Design"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addLearnSkill}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-400 font-mono text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsToLearn.map((s, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                      {s}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSkillsToLearn(skillsToLearn.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Languages You Speak or Practice
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_LANGUAGES.map(lang => {
                  const active = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        active
                          ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy Controls */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                Discovery & Privacy Controls
              </label>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block text-sm">
                    Voluntary Discovery Opt-In
                  </span>
                  <span className="text-xs text-slate-400">
                    Appear in match recommendations for passengers on your train
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={discoveryOptIn}
                  onChange={e => setDiscoveryOptIn(e.target.checked)}
                  className="w-5 h-5 text-emerald-400 rounded cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Profile Visibility Level
                </label>
                <select
                  value={profileVisibility}
                  onChange={e => setProfileVisibility(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="journey_only">Visible only to passengers with active journeys on the same train route</option>
                  <option value="public">Visible to all registered passengers</option>
                  <option value="private">Completely private (Hide profile from all searches)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-navy-950 font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Preferences'}</span>
            </button>
          </form>

          {/* Account Deletion */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">Personal Data Deletion</span>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="text-rose-400 hover:text-rose-300 font-mono font-bold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Scrub Data</span>
            </button>
          </div>
        </div>

      </div>

      {/* Appeal Submission Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAppealSubmit} className="bento-dark-card max-w-lg w-full p-6 sm:p-8 bg-slate-900 border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <Scale className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Appeal Score Restriction</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If your score was reduced by unfair or coordinated voting, provide your explanation. Human moderators will audit the feedback ledger.
            </p>

            <textarea
              rows={4}
              required
              minLength={10}
              value={appealExplanation}
              onChange={e => setAppealExplanation(e.target.value)}
              placeholder="Explain why you believe the negative feedback was unjustified..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
            />

            {appealAlert && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
                {appealAlert}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingAppeal || appealExplanation.trim().length < 10}
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-navy-950 font-bold font-mono text-xs uppercase"
              >
                {isSubmittingAppeal ? 'Submitting...' : 'Submit Appeal'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
