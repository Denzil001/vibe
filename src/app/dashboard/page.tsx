'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  Train, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Phone, 
  AlertCircle,
  Calendar,
  MapPin,
  QrCode,
  Flame,
  Scale,
  Clock,
  History,
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { SafeUser, Journey, MatchRecommendation, Group } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [scoreHistory, setScoreHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Score History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Appeal Modal
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealExplanation, setAppealExplanation] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        if (!meData.user) {
          router.push('/login');
          return;
        }
        setUser(meData.user);

        // Fetch journey
        const jRes = await fetch('/api/journey');
        if (jRes.ok) {
          const jData = await jRes.json();
          setJourney(jData.journey || null);
        }

        // Fetch matches
        const dRes = await fetch('/api/discover');
        if (dRes.ok) {
          const dData = await dRes.json();
          setMatches((dData.matches || []).slice(0, 3));
        }

        // Fetch groups
        const gRes = await fetch('/api/groups');
        if (gRes.ok) {
          const gData = await gRes.json();
          setGroups((gData.groups || []).filter((g: any) => g.isMember).slice(0, 3));
        }

        // Fetch score history
        const hRes = await fetch('/api/reputation/history');
        if (hRes.ok) {
          const hData = await hRes.json();
          setScoreHistory(hData.history || null);
        }
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealExplanation.trim()) return;
    setIsSubmittingAppeal(true);
    setAppealMessage('');

    try {
      const res = await fetch('/api/reputation/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userExplanation: appealExplanation.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppealMessage('Appeal successfully submitted to safety moderators.');
        setAppealExplanation('');
        setTimeout(() => setShowAppealModal(false), 2000);
      } else {
        setAppealMessage(data.error || 'Failed to submit appeal');
      }
    } catch (e) {
      setAppealMessage('Network error submitting appeal');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center flex-1 bg-[#090D16]">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 animate-pulse">
          <Train className="w-4 h-4 animate-bounce" />
          <span>INITIALIZING JOURNEY DASHBOARD...</span>
        </div>
      </div>
    );
  }

  const reputationScore = user?.reputationScore ?? 100;
  const isRestricted = user?.isRestricted || reputationScore < 90;

  return (
    <div className="py-10 bg-[#090D16] bg-dark-grid-pattern text-slate-100 flex-1 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Restriction Alert Banner (if applicable) */}
        {isRestricted && (
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Temporary Interaction Restriction Active</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    POLICY V1.0 (24H)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Your community reputation score is currently <strong>{reputationScore} points</strong> (below the 90 threshold). You cannot start new conversations or join new groups until {user?.restrictionExpiresAt ? new Date(user.restrictionExpiresAt).toLocaleTimeString() : 'expiry'}.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your access to settings, emergency help (139), and appeals remains fully functional.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAppealModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-navy-950 font-bold text-xs uppercase font-mono tracking-wider transition-colors shrink-0"
            >
              Submit Appeal
            </button>
          </div>
        )}

        {/* Welcome & Passenger Identity Bento Card */}
        <div className="bento-dark-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user?.displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">
                  Namaste, {user?.displayName}
                </h1>
                <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  @{user?.username || 'passenger'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {user?.interests?.slice(0, 3).join(' • ') || 'Configuring interests...'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Reputation Score Metric Box */}
            <div 
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center gap-3 group"
              title="Click to view full reputation score history & audit events"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Reputation Score</span>
                <span className="text-base font-black text-emerald-400 font-mono flex items-center gap-1">
                  {reputationScore} <span className="text-[10px] text-slate-500">/ 100</span>
                </span>
              </div>
            </div>

            {/* Journey QR Pass Button */}
            <Link
              href="/join"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Pass</span>
            </Link>

            {/* Journey Setup Button */}
            <Link
              href="/journey"
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-navy-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Train className="w-4 h-4" />
              <span>{journey ? 'Edit Journey' : 'Setup Journey'}</span>
            </Link>
          </div>
        </div>

        {/* Active Journey Alert / Card */}
        {journey ? (
          <div className="bento-dark-card p-6 sm:p-7 border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="sys-tag bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                  ACTIVE TRAIN CONTEXT
                </span>
                <span className="text-xs text-slate-400 font-mono">Voluntary Discovery Active</span>
              </div>
              <Link
                href="/discover"
                className="text-xs font-mono font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Find Passengers on this Train</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Train className="w-6 h-6 text-emerald-400" />
                  {journey.trainName} ({journey.trainNumber})
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 mt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <strong>{journey.boardingStation}</strong> &rarr; <strong>{journey.destinationStation}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {journey.travelDate}
                  </span>
                </div>
              </div>

              {journey.conversationGoals && journey.conversationGoals.length > 0 && (
                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 max-w-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                    Journey Focus
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {journey.conversationGoals.map((g, i) => (
                      <span key={i} className="text-xs bg-slate-900 text-slate-200 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">No train journey logged yet</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set up your train number and travel date to unlock relevant passenger matches and train-specific study groups.
                </p>
              </div>
            </div>
            <Link
              href="/journey"
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-navy-950 font-bold font-mono text-xs uppercase tracking-wider shrink-0 transition-colors"
            >
              Log Journey Details
            </Link>
          </div>
        )}

        {/* 2-Column Grid: Discover Matches & Train Communities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Matches */}
          <div className="bento-dark-card p-6 sm:p-7">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Passenger Discoveries</h2>
              </div>
              <Link
                href="/discover"
                className="text-xs font-mono font-bold text-emerald-400 hover:underline uppercase tracking-wider inline-flex items-center gap-1"
              >
                <span>View all ({matches.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {matches.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400 mb-3">
                  No active matches found for your current journey context.
                </p>
                <Link
                  href="/profile"
                  className="text-xs font-mono font-bold text-emerald-400 hover:underline"
                >
                  Add more skills and interests to your profile &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map(match => (
                  <div
                    key={match.user.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={match.user.avatarUrl}
                          alt={match.user.displayName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-white">{match.user.displayName}</h4>
                            <span className="text-[10px] font-mono text-emerald-400">
                              @{match.user.username || 'passenger'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {match.sameTrain ? `Traveling on Train ${match.journey?.trainNumber}` : 'Traveler with shared goals'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {match.score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                      <strong>Why suggested:</strong> {match.explanation}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {match.sharedInterests.slice(0, 2).map((interest, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {interest}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/chat`}
                        className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-400 text-navy-950 hover:bg-emerald-300 transition-colors uppercase"
                      >
                        Connect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Communities & Groups */}
          <div className="bento-dark-card p-6 sm:p-7">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Your Communities</h2>
              </div>
              <Link
                href="/groups"
                className="text-xs font-mono font-bold text-emerald-400 hover:underline uppercase tracking-wider inline-flex items-center gap-1"
              >
                <span>Browse all groups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {groups.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400 mb-3">
                  You have not joined any train or interest communities yet.
                </p>
                <Link
                  href="/groups"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-4 py-2 rounded-xl bg-emerald-400 text-navy-950 hover:bg-emerald-300 transition-colors uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Explore Passenger Groups</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {groups.map(group => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="block p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 bg-slate-950/50 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {group.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {group.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{group.memberCount} members</span>
                      <span className="text-emerald-400 font-bold group-hover:underline">Open chat &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Transit Arcade & Multiplayer Hub */}
        <div className="bento-dark-card p-6 sm:p-7 border-emerald-500/30 bg-gradient-to-br from-slate-950 via-[#0a1222] to-slate-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  TRANSIT ARCADE
                </span>
                <span className="text-xs font-mono text-slate-400">CO-OP & PASSENGER CHALLENGES</span>
              </div>
              <h2 className="text-xl font-bold text-white">Multiplayer Games & Icebreakers</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pass the hours with passenger duels, railway word chains, and tactical track grids.
              </p>
            </div>
            <Link
              href="/play"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider transition-colors inline-flex items-center gap-2 shrink-0 shadow-md shadow-emerald-500/20"
            >
              <span>Open Game Lounge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/play"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">RAPID DUEL</span>
                <span className="text-xs">⚡</span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Train Trivia Blitz
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                15-second timer duels on world record bridges, heritage lines, and speed marvels.
              </p>
            </Link>

            <Link
              href="/play"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">WORD CHAIN</span>
                <span className="text-xs">🚅</span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Station Antakshari
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Chain verified Indian railway stations by their final letter against bot or seatmate.
              </p>
            </Link>

            <Link
              href="/play"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">BOARD GAME</span>
                <span className="text-xs">🎮</span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Tactical Rail Grid
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Turn-based 3x3 track connection challenge with rematch counters and win streaks.
              </p>
            </Link>
          </div>
        </div>

        {/* Quick Help & Activity Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-dark-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider block mb-1">
                Language Exchange
              </span>
              <h3 className="text-base font-bold text-white mb-2">
                Hindi - English Travel Flashcards
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Learn polite phrases, food ordering vocabulary, and friendly transit icebreakers for respectful travel.
              </p>
            </div>
            <Link
              href="/activities"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-violet-400 hover:underline uppercase"
            >
              <span>Practice Phrases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bento-dark-card p-6 flex flex-col justify-between border-amber-500/30">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Official Assistance
              </span>
              <h3 className="text-base font-bold text-white mb-2">
                RailMadad Helpline
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct access to official Indian Railways emergency, security, medical, and grievance support.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <a href="tel:139" className="text-amber-400 font-mono font-bold text-base hover:underline">
                Dial 139
              </a>
              <Link href="/help" className="text-slate-400 hover:text-white underline font-mono text-[11px]">
                View all helplines
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Score History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bento-dark-card max-w-xl w-full p-6 sm:p-8 bg-slate-900 border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reputation Ledger & History</h3>
                  <p className="text-xs text-slate-400 font-mono">Auditable score adjustment record</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Baseline Points</span>
                <span className="text-xl font-black text-white font-mono">100</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Score</span>
                <span className="text-xl font-black text-emerald-400 font-mono">{reputationScore}</span>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {scoreHistory?.events && scoreHistory.events.length > 0 ? (
                scoreHistory.events.map((evt: any) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${evt.pointDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {evt.pointDelta > 0 ? `+${evt.pointDelta}` : evt.pointDelta} pts
                        </span>
                        <span className="text-slate-300 font-medium">{evt.reasonCategory}</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {new Date(evt.createdAt).toLocaleString()} • Status: {evt.status}
                      </p>
                      {evt.reversalReason && (
                        <p className="text-[10px] text-amber-400 mt-1">Reversal: {evt.reversalReason}</p>
                      )}
                    </div>
                    <span className="sys-tag text-[9px] bg-slate-900 text-slate-400">
                      JOURNEY VERIFIED
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl">
                  No journey feedback recorded yet. You maintain a pristine 100 baseline.
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                To protect passenger privacy, individual voter identities are never publicly disclosed. Score events are reconciled against an auditable ledger.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Submission Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleAppealSubmit} className="bento-dark-card max-w-lg w-full p-6 sm:p-8 bg-slate-900 border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Appeal Community Restriction</h3>
                  <p className="text-xs text-slate-400 font-mono">Submit explanation for moderator audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you believe negative feedback was coordinated, malicious, or erroneous, please explain the context. A human safety moderator reviews every appeal.
            </p>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Your Explanation (Min 10 characters)
              </label>
              <textarea
                rows={4}
                required
                minLength={10}
                value={appealExplanation}
                onChange={e => setAppealExplanation(e.target.value)}
                placeholder="Explain the journey interaction and why you believe the feedback was unjustified..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400 placeholder-slate-600"
              />
            </div>

            {appealMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{appealMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-navy-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingAppeal ? 'Submitting...' : 'Submit Appeal'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
