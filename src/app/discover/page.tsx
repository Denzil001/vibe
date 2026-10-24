'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Train, 
  MessageSquare, 
  X, 
  ShieldAlert, 
  Ban, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  EyeOff, 
  ArrowRight,
  User as UserIcon,
  Flame,
  Info,
  Gamepad2
} from 'lucide-react';
import { MatchRecommendation, SafeUser, Journey } from '@/types';

export default function DiscoverPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discoveryDisabled, setDiscoveryDisabled] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [voteFeedback, setVoteFeedback] = useState<Record<string, { message: string; type: 'success' | 'error' }>>({});

  // Modal states for Report and Block
  const [activeModal, setActiveModal] = useState<{ type: 'report' | 'block'; targetUser: SafeUser } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportCategory, setReportCategory] = useState<'harassment' | 'spam' | 'abusive' | 'other'>('harassment');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/discover').then(res => res.json()),
      fetch('/api/journey').then(res => res.json()),
    ])
      .then(([discoverData, journeyData]) => {
        if (discoverData.discoveryDisabled) {
          setDiscoveryDisabled(true);
        } else {
          setMatches(discoverData.matches || []);
        }
        if (journeyData.journey) {
          setJourney(journeyData.journey);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleDismiss = (userId: string) => {
    setDismissedIds(prev => [...prev, userId]);
  };

  const handleConnect = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/chat/${data.conversation.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation.');
    }
  };

  const handleVote = async (targetUserId: string, voteType: 'positive' | 'negative') => {
    if (!journey) {
      setVoteFeedback(prev => ({
        ...prev,
        [targetUserId]: {
          message: 'Please set up an active train journey first to submit feedback.',
          type: 'error',
        },
      }));
      return;
    }

    try {
      const res = await fetch('/api/reputation/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          journeyId: journey.id,
          voteType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setVoteFeedback(prev => ({
          ...prev,
          [targetUserId]: {
            message: data.error || 'Feedback could not be recorded.',
            type: 'error',
          },
        }));
      } else {
        setVoteFeedback(prev => ({
          ...prev,
          [targetUserId]: {
            message: data.message,
            type: 'success',
          },
        }));
      }
    } catch (err) {
      setVoteFeedback(prev => ({
        ...prev,
        [targetUserId]: {
          message: 'Network error submitting feedback.',
          type: 'error',
        },
      }));
    }
  };

  const handleConfirmBlock = async () => {
    if (!activeModal || activeModal.type !== 'block') return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedUserId: activeModal.targetUser.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMatches(prev => prev.filter(m => m.user.id !== activeModal.targetUser.id));
      setActiveModal(null);
      setStatusMsg(`Blocked @${activeModal.targetUser.username || activeModal.targetUser.displayName}. Mutual discovery and communication disabled.`);
    } catch (err: any) {
      alert(err.message || 'Failed to block user.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReport = async () => {
    if (!activeModal || activeModal.type !== 'report') return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedUserId: activeModal.targetUser.id,
          category: reportCategory,
          reason: reportReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMatches(prev => prev.filter(m => m.user.id !== activeModal.targetUser.id));
      setActiveModal(null);
      setReportReason('');
      setStatusMsg(`Report submitted for moderator review. @${activeModal.targetUser.username || activeModal.targetUser.displayName} has also been blocked.`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const visibleMatches = matches.filter(m => !dismissedIds.includes(m.user.id));

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center flex-1 bg-[#090D16]">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 animate-pulse">
          <Train className="w-4 h-4 animate-bounce" />
          <span>FINDING PASSENGER MATCHES ON YOUR ROUTE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#090D16] bg-dark-grid-pattern text-slate-100 flex-1 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Passenger Discovery
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-400">
              Voluntary match suggestions based on shared interests, complementary learning goals, and journey context
            </p>
          </div>

          <Link
            href="/journey"
            className="text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-slate-700 transition-colors"
          >
            Adjust Train Journey
          </Link>
        </div>

        {statusMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-400 text-xs sm:text-sm font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Mandatory Transparency Notice */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Explainable Matching & Journey Safety: </strong>
            Scores are calculated transparently: same train (+30 pts), skill learning synergy (+25 pts), shared interests (+25 pts), and languages (+20 pts). Matching does not establish identity or legal safety. Follow community rules and never share exact seat numbers.
          </div>
        </div>

        {discoveryDisabled ? (
          <div className="bento-dark-card p-8 text-center space-y-4">
            <EyeOff className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Discovery is currently turned off</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You have chosen not to appear in passenger discovery. To view fellow passengers on your route, enable discovery in your profile settings.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-400 text-navy-950 font-mono font-bold text-xs uppercase tracking-wider"
            >
              Update Profile Privacy
            </Link>
          </div>
        ) : visibleMatches.length === 0 ? (
          <div className="bento-dark-card p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-800">
              <Train className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No matching passengers found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              We did not find other opted-in passengers on this exact train route with overlapping interests. Try adding more skills or broader conversational topics to your profile!
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-emerald-400 text-navy-950 hover:bg-emerald-300 transition-colors"
            >
              Edit Profile Interests
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleMatches.map(match => {
              const feedback = voteFeedback[match.user.id];

              return (
                <div
                  key={match.user.id}
                  className="bento-dark-card p-6 border-slate-800 hover:border-emerald-500/40 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={match.user.avatarUrl}
                        alt={match.user.displayName}
                        className="w-12 h-12 rounded-2xl object-cover border border-emerald-400/40 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">
                            {match.user.displayName}
                          </h3>
                          <span className="text-xs font-mono text-emerald-400">
                            @{match.user.username || 'passenger'}
                          </span>
                          {match.sameTrain && (
                            <span className="sys-tag text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              TRAIN {match.journey?.trainNumber}
                            </span>
                          )}
                          <span className="sys-tag text-[9px] bg-slate-800 text-slate-300">
                            {match.score}% MATCH
                          </span>
                        </div>

                        {match.user.bio && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {match.user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-start">
                      <button
                        onClick={() => handleDismiss(match.user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Dismiss suggestion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveModal({ type: 'block', targetUser: match.user })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Block user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveModal({ type: 'report', targetUser: match.user })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Report user"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Why Suggested */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong className="text-emerald-400 font-mono">Why Suggested: </strong>
                    {match.explanation}
                  </div>

                  {/* Skills & Shared Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {match.sharedInterests.map((interest, idx) => (
                      <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {interest}
                      </span>
                    ))}
                    {match.sharedLanguages.map((lang, idx) => (
                      <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Feedback Action Buttons (Reputation Voting + Connect) */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                        Journey Feedback:
                      </span>
                      <button
                        onClick={() => handleVote(match.user.id, 'positive')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all"
                        title="Liked interacting (+2 points)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Liked (+2)</span>
                      </button>
                      <button
                        onClick={() => handleVote(match.user.id, 'negative')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-mono font-bold transition-all"
                        title="Not a good interaction (-2 points)"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Not for me (-2)</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/play?invite=${match.user.username || match.user.id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Play Together</span>
                      </Link>

                      <button
                        onClick={() => handleConnect(match.user.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-navy-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Start Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Status Alert */}
                  {feedback && (
                    <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150 ${
                      feedback.type === 'success' 
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400' 
                        : 'bg-rose-950/40 border border-rose-500/40 text-rose-400'
                    }`}>
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Block Confirmation Modal */}
        {activeModal && activeModal.type === 'block' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bento-dark-card max-w-md w-full p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400">
                <Ban className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Block @{activeModal.targetUser.username || activeModal.targetUser.displayName}?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Blocking is mutual and immediate. Neither you nor this passenger will be able to see each other in discovery feeds or exchange messages. They will receive no notification of this action.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {activeModal && activeModal.type === 'report' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bento-dark-card max-w-md w-full p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Report @{activeModal.targetUser.username || activeModal.targetUser.displayName}</h3>
              </div>
              <p className="text-xs text-slate-400">
                Reports are audited by human safety moderators. Submitting a report also blocks the user automatically.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="harassment">Harassment or unwelcome contact</option>
                  <option value="spam">Commercial spam or ticket scalping</option>
                  <option value="abusive">Abusive or threatening language</option>
                  <option value="other">Other policy violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Describe what occurred during your journey interaction..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReport}
                  disabled={isSubmittingAction || !reportReason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-mono text-xs font-bold uppercase"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
