'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Train, 
  Sparkles, 
  Users, 
  Award, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight, 
  Calendar,
  MapPin,
  Clock, 
  Flame, 
  RefreshCw,
  LogOut,
  AlertTriangle,
  History,
  X,
  Phone,
  BookOpen,
  Lock
} from 'lucide-react';

export default function CarriagePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<any | null>(null);
  const [discoveryState, setDiscoveryState] = useState<{
    incomingCount: number;
    outgoingCount: number;
    mutualCount: number;
    matchesCount: number;
  }>({ incomingCount: 0, outgoingCount: 0, mutualCount: 0, matchesCount: 0 });

  // Score History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        if (!userData?.user) {
          router.push('/auth');
          return;
        }
        setCurrentUser(userData.user);

        // Fetch journey & discovery summary
        const discRes = await fetch('/api/discover');
        if (discRes.ok) {
          const discData = await discRes.json();
          if (discData.journey) {
            setJourney(discData.journey);
          }
          setDiscoveryState({
            incomingCount: discData.incomingRequests?.length || 0,
            outgoingCount: discData.outgoingRequests?.length || 0,
            mutualCount: discData.mutualMatches?.length || 0,
            matchesCount: discData.matches?.length || 0,
          });
        }

        // Fetch score history
        const histRes = await fetch('/api/reputation/history');
        if (histRes.ok) {
          const histData = await histRes.json();
          setScoreHistory(histData.history || null);
        }
      } catch (err) {
        console.error('Failed to load carriage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const isBanned = !!currentUser?.isRestricted;
  const reputation = currentUser?.reputationScore ?? 0;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Permanent Chat Ban Status Banner */}
        {isBanned && (
          <div className="rounded-2xl bg-rose-950/60 border-2 border-rose-500/60 p-5 text-rose-200 flex items-start gap-4 shadow-xl shadow-rose-950/40">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Account Chat Restriction Active</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900 border border-rose-500/50 text-rose-200 font-mono">
                  Permanent Ban
                </span>
              </h3>
              <p className="text-xs text-rose-300 leading-relaxed">
                {currentUser?.restrictionReason || 'Your reputation score fell strictly below -50 points. In accordance with COMPARTMENT community guidelines, chat access, matching, and lounge participation are permanently restricted across all journeys.'}
              </p>
              <p className="text-[11px] text-rose-400/80 pt-1">
                You may still review your profile and journey details. Score of exactly -50 is not banned; only scores strictly below -50 trigger this safety restriction.
              </p>
            </div>
          </div>
        )}

        {/* Hero Carriage & Passenger Identity Card */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={currentUser?.displayName}
                className="w-16 h-16 rounded-2xl border-2 border-amber-400/80 shadow-lg object-cover bg-slate-950"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-white">
                    Namaste, {currentUser?.displayName}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold border border-amber-400/40">
                    @{currentUser?.username}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold">
                    Coach B
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Focus: <span className="text-slate-200 font-semibold">{currentUser?.conversationTopics?.[0] || 'Casual fun'}</span>
                  {currentUser?.interests && currentUser.interests.length > 0 && (
                    <span> • {currentUser.interests.slice(0, 3).join(' • ')}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Reputation Score Box (Clickable for History) */}
            <div 
              onClick={() => setShowHistoryModal(true)}
              className="bg-slate-950/80 border border-slate-700/80 hover:border-amber-400/60 rounded-2xl p-4 flex items-center gap-4 min-w-[210px] cursor-pointer transition-all group"
              title="Click to view full reputation audit ledger"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 group-hover:scale-105 flex items-center justify-center text-amber-400 transition-transform">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Reputation Score
                </span>
                <span className="text-xl font-mono font-black text-white flex items-center gap-1.5">
                  {reputation} <span className="text-xs text-slate-500 font-normal">/ 100 max</span>
                </span>
                <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, reputation))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Journey Context Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {journey?.name || 'Midnight Hackathon Express'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  ACTIVE
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono block mt-0.5">
                Journey Code: {journey?.code || 'HACK-EXP-01'} • Coach B • Voluntary Discovery Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/setup"
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all font-semibold"
            >
              Edit Identity
            </Link>
            <Link
              href="/discover"
              className="text-xs px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discover Passengers</span>
            </Link>
          </div>
        </div>

        {/* Main Transit Action Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Passenger Discovery & Requests */}
          <Link
            href={isBanned ? '#' : '/discover'}
            className={`group rounded-3xl p-6 border transition-all flex flex-col justify-between ${
              isBanned
                ? 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-900'
                : 'bg-slate-900/90 border-slate-800 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                {discoveryState.incomingCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                    {discoveryState.incomingCount} Incoming
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Passenger Discovery
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review pending incoming & outgoing requests and discover passengers matched by Gemini AI. Both users must accept to open a private chatroom.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
                {discoveryState.incomingCount > 0 && (
                  <span className="text-amber-300 font-bold">● {discoveryState.incomingCount} to accept</span>
                )}
                {discoveryState.outgoingCount > 0 && (
                  <span className="text-slate-400 font-medium">● {discoveryState.outgoingCount} pending</span>
                )}
                {discoveryState.mutualCount > 0 && (
                  <span className="text-emerald-400 font-bold">● {discoveryState.mutualCount} mutual ready</span>
                )}
              </div>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <span>Open Discovery</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Common Lounge */}
          <Link
            href={isBanned ? '#' : '/lounge'}
            className={`group rounded-3xl p-6 border transition-all flex flex-col justify-between ${
              isBanned
                ? 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-900'
                : 'bg-slate-900/90 border-slate-800 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/10'
            }`}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Common Lounge
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect in the train-wide shared room with all active hackathon passengers in Coach B. Chat history is cleared automatically when no one is in the chatroom.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>Enter Lounge</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Bottom Help & Safety Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Language Exchange Flashcards</h4>
                <p className="text-[11px] text-slate-400">Hindi - English travel and food phrases</p>
              </div>
            </div>
            <Link
              href="/activities"
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-violet-300 font-semibold transition-all"
            >
              Practice Phrases
            </Link>
          </div>

          <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">RailMadad Helpline 139</h4>
                <p className="text-[11px] text-slate-400">Official security, medical, and emergency assistance</p>
              </div>
            </div>
            <a
              href="tel:139"
              className="text-xs px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono transition-all"
            >
              Dial 139
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs text-slate-500">
          <Link href="/safety" className="hover:text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passenger Safety & Privacy Rules</span>
          </Link>
          <button
            onClick={handleLogout}
            className="hover:text-rose-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Score History & Ledger Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reputation Ledger</h3>
                  <p className="text-xs text-slate-400 font-mono">COMPARTMENT Point Rules</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Baseline Start</span>
                <span className="text-xl font-black text-white font-mono">0 pts</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Score</span>
                <span className="text-xl font-black text-amber-400 font-mono">{reputation} <span className="text-xs text-slate-500">/ 100 max</span></span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <p>• <strong>GOOD interaction:</strong> +2 points (max 2 GOOD received per journey)</p>
              <p>• <strong>BAD interaction:</strong> -2 points (max 1 rating per rater per recipient)</p>
              <p>• <strong>Strict ban threshold:</strong> If score &lt; -50, permanent chat ban is applied.</p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {scoreHistory?.events && scoreHistory.events.length > 0 ? (
                scoreHistory.events.map((evt: any) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${evt.pointDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {evt.pointDelta > 0 ? `+${evt.pointDelta}` : evt.pointDelta} pts
                        </span>
                        <span className="text-slate-300 font-medium">{evt.ratingType || evt.voteType}</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {new Date(evt.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                      VERIFIED
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl">
                  No ratings recorded yet. New passenger accounts start at 0 points.
                </div>
              )}
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
    </div>
  );
}
