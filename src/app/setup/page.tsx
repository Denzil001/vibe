'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Train, 
  Sparkles, 
  User, 
  Tag, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  MessageSquare
} from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'avatar_1', seed: 'express_voyager', label: 'Voyager' },
  { id: 'avatar_2', seed: 'train_pilot', label: 'Pilot' },
  { id: 'avatar_3', seed: 'sleeper_dreamer', label: 'Dreamer' },
  { id: 'avatar_4', seed: 'station_master', label: 'Navigator' },
  { id: 'avatar_5', seed: 'curious_traveler', label: 'Curious' },
  { id: 'avatar_6', seed: 'compartment_coder', label: 'Builder' },
];

const CONVERSATION_GOALS = [
  'Casual fun',
  'Technology & AI',
  'Study buddy',
  'Geopolitics',
  'Meaningful conversations',
];

const INTEREST_PRESETS = [
  'Technology & AI',
  'Geopolitics',
  'Coding',
  'Startups',
  'Music',
  'Books',
  'Gaming',
  'Science',
  'College life',
  'Philosophy',
  'Train Travel',
  'Design & Art',
];

export default function SetupPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [handle, setHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [handleError, setHandleError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('avatar_1');
  const [conversationGoal, setConversationGoal] = useState('Casual fun');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology & AI', 'Music']);
  const [customInterest, setCustomInterest] = useState('');
  const [bio, setBio] = useState('');
  const [language, setLanguage] = useState('en');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data?.user) {
          router.push('/auth');
          return;
        }
        const u = data.user;
        setCurrentUser(u);
        setDisplayName(u.displayName || '');
        setHandle(u.username || '');
        if (u.interests && u.interests.length > 0) {
          setSelectedInterests(u.interests);
        }
        if (u.conversationTopics && u.conversationTopics[0]) {
          setConversationGoal(u.conversationTopics[0]);
        }
        if (u.bio) setBio(u.bio);
        setLoading(false);
      })
      .catch(() => router.push('/auth'));
  }, [router]);

  // Debounced handle check
  useEffect(() => {
    if (!handle || handle.length < 3) {
      setHandleStatus('idle');
      setHandleError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setHandleStatus('checking');
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(handle)}`);
        const data = await res.json();
        if (data.available || (currentUser && handle.toLowerCase() === currentUser.username?.toLowerCase())) {
          setHandleStatus('available');
          setHandleError(null);
        } else {
          setHandleStatus('taken');
          setHandleError(data.error || 'This handle is already taken.');
        }
      } catch {
        setHandleStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, currentUser]);

  function toggleInterest(interest: string) {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 8) return;
      setSelectedInterests([...selectedInterests, interest]);
    }
  }

  function addCustomInterest(e: React.FormEvent) {
    e.preventDefault();
    const clean = customInterest.trim();
    if (!clean || selectedInterests.includes(clean) || selectedInterests.length >= 8) return;
    setSelectedInterests([...selectedInterests, clean]);
    setCustomInterest('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (handleStatus === 'taken') return;
    setSaving(true);
    setSaveError(null);

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatar)}`;

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim() || 'Passenger',
          handle: handle.trim().toLowerCase(),
          username: handle.trim().toLowerCase(),
          avatar: avatarUrl,
          avatarUrl,
          conversationGoal,
          conversationTopics: [conversationGoal],
          interests: selectedInterests,
          bio: bio.trim(),
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Failed to update profile.');
        setSaving(false);
        return;
      }

      router.push('/carriage');
    } catch (err: any) {
      setSaveError('Unexpected server error while saving profile.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/20 mb-4">
            <Train className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Passenger Identity</h1>
          <p className="mt-2 text-sm text-slate-400">
            Set your public passenger handle, avatar, and conversation topics for the journey.
          </p>
        </div>

        <form onSubmit={handleSave} className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Choose Your Passenger Avatar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map(opt => {
                const isSelected = avatar === opt.id;
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(opt.id)}`;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatar(opt.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20 scale-105'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={opt.label} className="w-12 h-12 rounded-xl mb-1.5" />
                    <span className="text-[11px] font-bold text-slate-300">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Handle & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Passenger Handle (Unique @handle)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-500 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="cool_coder"
                  maxLength={20}
                  className="w-full pl-8 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
                />
                <div className="absolute right-3.5 top-3.5">
                  {handleStatus === 'checking' && <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />}
                  {handleStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {handleStatus === 'taken' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                </div>
              </div>
              {handleError && <p className="mt-1.5 text-xs text-rose-400">{handleError}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Aaromal"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Primary Conversation Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Primary Journey Conversation Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CONVERSATION_GOALS.map(goal => {
                const isSelected = conversationGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setConversationGoal(goal)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interest Chips */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Your Interests ({selectedInterests.length}/8)
              </label>
              <span className="text-[11px] text-slate-400">Used for AI matchmaking</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTEREST_PRESETS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={e => setCustomInterest(e.target.value)}
                placeholder="Add custom interest tag..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim() || selectedInterests.length >= 8}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-white transition-all"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Short Bio & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Passenger Bio (Optional)
              </label>
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Traveling to the national hackathon. Working on AI for rail transit."
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="bn">Bengali (বাংলা)</option>
              </select>
            </div>
          </div>

          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || handleStatus === 'taken'}
            className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Enter Carriage Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
