'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Train, 
  MessageSquare, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Flame,
  Gamepad2,
  RefreshCw,
  Heart,
  Clock,
  UserCheck,
  UserPlus,
  Send,
  Users
} from 'lucide-react';

interface MutualPromptData {
  targetUserId: string;
  targetUser: any;
  roomId: string;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [journey, setJourney] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  // 4 Discovery Buckets
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [mutualMatches, setMutualMatches] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Action loaders
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Prompt Modal when match is accepted from both ends
  const [promptMatch, setPromptMatch] = useState<MutualPromptData | null>(null);

  // Track known mutual matches to auto-pop prompt when accepted by the other party without reload
  const seenMutualIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const fetchDiscoveryData = async () => {
    try {
      const discRes = await fetch('/api/discover');
      if (discRes.status === 403) {
        setIsBanned(true);
        return;
      }

      if (discRes.ok) {
        const data = await discRes.json();
        const incoming = data.incomingRequests || [];
        const outgoing = data.outgoingRequests || [];
        const mutual = data.mutualMatches || [];
        const matches = data.matches || [];

        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
        setMutualMatches(mutual);
        setAiSuggestions(matches);
        if (data.journey) {
          setJourney(data.journey);
        }

        // Live detection: if an outgoing or incoming request was accepted on the other end,
        // auto-trigger the mutual prompt without needing a manual page reload!
        if (isInitialLoadRef.current) {
          mutual.forEach((m: any) => {
            const key = m.matchId || m.targetUserId;
            if (key) seenMutualIdsRef.current.add(key);
          });
          isInitialLoadRef.current = false;
        } else {
          for (const m of mutual) {
            const key = m.matchId || m.targetUserId;
            if (key && !seenMutualIdsRef.current.has(key)) {
              seenMutualIdsRef.current.add(key);
              setPromptMatch({
                targetUserId: m.targetUserId,
                targetUser: m.user,
                roomId: m.roomId,
              });
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Discover fetch error:', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData?.user) {
          router.push('/auth');
          return;
        }
        setCurrentUser(meData.user);

        if (meData.user.isRestricted) {
          setIsBanned(true);
          setIsLoading(false);
          return;
        }

        await fetchDiscoveryData();
      } catch (err) {
        console.error('Discover load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Periodic polling every 2.5 seconds: ensures the requested end updates instantly when the other party accepts
  useEffect(() => {
    if (isBanned) return;
    const interval = setInterval(() => {
      fetchDiscoveryData();
    }, 2500);

    return () => clearInterval(interval);
  }, [isBanned]);

  // Respond to candidate / request
  const handleRespond = async (targetUserId: string, targetUser: any, accept: boolean) => {
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));

    try {
      const res = await fetch('/api/matches/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, accept }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to process match response.');
        return;
      }

      // If accepted from both ends, trigger prompt to continue or decline
      if (accept && data.status === 'mutual_accepted' && data.roomId) {
        setPromptMatch({
          targetUserId,
          targetUser: targetUser || { id: targetUserId, displayName: 'Passenger', username: 'passenger' },
          roomId: data.roomId,
        });
      }

      // Refresh data
      await fetchDiscoveryData();
    } catch {
      alert('Error communicating with matching server.');
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Decline from prompt modal
  const handlePromptDecline = async () => {
    if (!promptMatch) return;
    const targetUserId = promptMatch.targetUserId;
    setPromptMatch(null);
    await handleRespond(targetUserId, null, false);
  };

  // Continue to chat from prompt modal
  const handlePromptContinue = () => {
    if (!promptMatch) return;
    const roomId = promptMatch.roomId;
    setPromptMatch(null);
    router.push(`/chat/${roomId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full rounded-3xl bg-rose-950/40 border border-rose-500/40 p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">Discovery Restricted</h1>
          <p className="text-xs text-rose-300 leading-relaxed">
            Your account is permanently restricted from passenger discovery and matchmaking because your reputation score fell strictly below -50.
          </p>
          <div className="pt-4">
            <Link
              href="/carriage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Return to Carriage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI-Assisted Passenger Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Coach B Passenger Matching
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {journey?.name || 'Midnight Hackathon Express'} • Dual-Consent Private Compartments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/carriage"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              <span>Carriage</span>
            </Link>
            <Link
              href="/lounge"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Common Lounge</span>
            </Link>
          </div>
        </div>

        {/* 1. MUTUAL MATCHES SECTION (Accepted from both ends) */}
        {mutualMatches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mutual Matches Ready for Chat ({mutualMatches.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mutualMatches.map(m => {
                const targetUser = m.user;
                const isLoadingAction = actionLoading[m.targetUserId];

                return (
                  <div
                    key={m.matchId || m.targetUserId}
                    className="rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 p-5 space-y-4 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={targetUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                          alt={targetUser?.displayName}
                          className="w-12 h-12 rounded-2xl object-cover bg-slate-950 border border-emerald-400/60 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">@{targetUser?.username}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                              Mutual Match
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {targetUser?.displayName} • {targetUser?.conversationTopics?.[0] || 'Casual fun'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      Both of you have accepted each other&apos;s connection request. Private chatroom is ready.
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        disabled={isLoadingAction}
                        onClick={() => handleRespond(m.targetUserId, targetUser, false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-400 hover:text-rose-400 font-bold text-xs transition-all"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPromptMatch({
                            targetUserId: m.targetUserId,
                            targetUser,
                            roomId: m.roomId,
                          });
                        }}
                        className="flex-[2] py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Continue to Chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. PENDING INCOMING REQUESTS SECTION */}
        {incomingRequests.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-amber-400 uppercase tracking-wide">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Pending Incoming Requests ({incomingRequests.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map(req => {
                const targetUser = req.user;
                const isLoadingAction = actionLoading[req.targetUserId];

                return (
                  <div
                    key={req.matchId || req.targetUserId}
                    className="rounded-3xl bg-slate-900/90 border border-amber-500/40 p-5 space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={targetUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                          alt={targetUser?.displayName}
                          className="w-12 h-12 rounded-2xl object-cover bg-slate-950 border border-amber-400/50 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">@{targetUser?.username}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                              Incoming
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {targetUser?.displayName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p>
                        Goal: <span className="text-amber-300 font-medium">{targetUser?.conversationTopics?.[0] || 'Casual fun'}</span>
                      </p>
                      {targetUser?.interests && targetUser.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {targetUser.interests.map((tag: string) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        disabled={isLoadingAction}
                        onClick={() => handleRespond(req.targetUserId, targetUser, false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-400 hover:text-white font-bold text-xs transition-all"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={isLoadingAction}
                        onClick={() => handleRespond(req.targetUserId, targetUser, true)}
                        className="flex-[2] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                      >
                        {isLoadingAction ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. PENDING OUTGOING REQUESTS SECTION */}
        {outgoingRequests.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Pending Outgoing Requests ({outgoingRequests.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingRequests.map(req => {
                const targetUser = req.user;
                const isLoadingAction = actionLoading[req.targetUserId];

                return (
                  <div
                    key={req.matchId || req.targetUserId}
                    className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={targetUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                          alt={targetUser?.displayName}
                          className="w-10 h-10 rounded-2xl object-cover bg-slate-950 border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">@{targetUser?.username}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                              Waiting
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {targetUser?.displayName}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isLoadingAction}
                        onClick={() => handleRespond(req.targetUserId, targetUser, false)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Invitation sent. Waiting for @{targetUser?.username} to accept.</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. AI AGENT SUGGESTED PASSENGERS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Suggested by AI Agent ({aiSuggestions.length})</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Powered by Gemini
            </span>
          </div>

          {aiSuggestions.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Train className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">No New Candidates</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                You have reviewed all active passengers in Coach B for this journey. Check back as new passengers scan their food QR vouchers, or meet everyone in the Common Lounge!
              </p>
              <div className="pt-2">
                <Link
                  href="/lounge"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  <span>Enter Common Lounge</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSuggestions.map(match => {
                const targetId = match.targetUserId || match.user?.id;
                const isLoadingAction = actionLoading[targetId];
                const user = match.user;

                return (
                  <div
                    key={targetId}
                    className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-3.5">
                      {/* Passenger Profile Top */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                            alt={user?.displayName || 'Passenger'}
                            className="w-14 h-14 rounded-2xl object-cover bg-slate-950 border border-amber-400/40 shadow-md shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-white">
                                @{user?.username}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                                Coach B
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 block mt-0.5">
                              Goal: <span className="text-amber-300 font-semibold">{user?.conversationTopics?.[0] || 'Casual fun'}</span>
                            </span>
                          </div>
                        </div>

                        {match.score && (
                          <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>{match.score}%</span>
                          </div>
                        )}
                      </div>

                      {/* Shared Interests */}
                      {user?.interests && user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {user.interests.map((tag: string) => (
                            <span
                              key={tag}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                                (match.sharedInterests || []).includes(tag)
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                                  : 'bg-slate-950 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* AI Grounded Match Reason */}
                      {match.matchReason && (
                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Why AI suggested this match</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {match.matchReason}
                          </p>
                          {match.icebreaker && (
                            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/50">
                              💡 Icebreaker: {match.icebreaker}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isLoadingAction}
                        onClick={() => handleRespond(targetId, user, false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-400 hover:text-white font-bold text-xs transition-all"
                      >
                        Not Now
                      </button>
                      <button
                        type="button"
                        disabled={isLoadingAction}
                        onClick={() => handleRespond(targetId, user, true)}
                        className="flex-[2] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                      >
                        {isLoadingAction ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Heart className="w-3.5 h-3.5 fill-slate-950" />
                            <span>I&apos;m Interested</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PROMPT MODAL WHEN REQUEST IS ACCEPTED FROM BOTH ENDS */}
      {promptMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border-2 border-emerald-500/60 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Mutual Match Confirmed!</span>
              </div>
              <button
                onClick={() => setPromptMatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <img
                src={promptMatch.targetUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={promptMatch.targetUser?.displayName}
                className="w-16 h-16 rounded-2xl mx-auto object-cover bg-slate-950 border-2 border-emerald-400 shadow-lg"
              />
              <div>
                <h3 className="text-lg font-black text-white">
                  Continue to Private Chat with @{promptMatch.targetUser?.username}?
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Both of you have accepted the connection request. You can enter the private compartment now or decline.
                </p>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  Note: Chat history is cleared automatically when no one is in the chatroom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handlePromptDecline}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 font-bold text-xs transition-all"
              >
                No, Decline
              </button>
              <button
                type="button"
                onClick={handlePromptContinue}
                className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Yes, Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
