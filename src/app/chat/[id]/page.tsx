'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  Ban, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Gamepad2,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Message, SafeUser } from '@/types';

export default function ConversationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [recipient, setRecipient] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsgContent, setNewMsgContent] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [journeyId, setJourneyId] = useState<string | null>(null);

  // Disconnection & Inactivity State
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);

  // Rating state
  const [ratingEligibility, setRatingEligibility] = useState<{
    alreadyRated: boolean;
    recipientGoodCapReached: boolean;
  }>({ alreadyRated: false, recipientGoodCapReached: false });
  const [hasRated, setHasRated] = useState(false);

  // Exit Prompt Modal
  const [showExitRateModal, setShowExitRateModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Standalone Header Rating Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateFeedback, setRateFeedback] = useState<string | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [isSubmittingRate, setIsSubmittingRate] = useState(false);

  // Safety Modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<'harassment' | 'spam' | 'abusive' | 'other'>('harassment');
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Leave room beacon helper
  const notifyLeaveRoom = (roomId: string, disconnect = false) => {
    try {
      const payload = JSON.stringify({ disconnect });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(`/api/chat/${roomId}/leave`, payload);
      } else {
        fetch(`/api/chat/${roomId}/leave`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true 
        }).catch(() => {});
      }
    } catch {
      // ignore beacon failure on shutdown
    }
  };

  // Lifecycle presence tracking & cleanup on unmount/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      notifyLeaveRoom(params.id, true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      notifyLeaveRoom(params.id, true);
    };
  }, [params.id]);

  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/auth');
        return;
      }
      setCurrentUser(meData.user);

      // Fetch messages and room details
      const mRes = await fetch(`/api/chat/${params.id}/messages`);
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.isDisconnected || mData.isClosed || mData.isInactive) {
          setIsDisconnected(true);
          setDisconnectReason(mData.error || 'This conversation has been disconnected.');
          if (mData.recipient) setRecipient(mData.recipient);
          if (mData.ratingEligibility) setRatingEligibility(mData.ratingEligibility);
          return;
        }

        setMessages(mData.messages || []);
        if (mData.isBlocked) setIsBlocked(true);
        if (mData.journeyId) setJourneyId(mData.journeyId);
        if (mData.recipient) setRecipient(mData.recipient);
        if (mData.ratingEligibility) {
          setRatingEligibility(mData.ratingEligibility);
          if (mData.ratingEligibility.alreadyRated) {
            setHasRated(true);
          }
        }
      } else if (mRes.status === 403 || mRes.status === 410) {
        setIsDisconnected(true);
        setDisconnectReason('This conversation has ended or timed out due to 30 seconds of inactivity.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      if (isDisconnected) return;

      fetch(`/api/chat/${params.id}/messages`)
        .then(res => res.json())
        .then(data => {
          if (data?.isDisconnected || data?.isClosed || data?.isInactive) {
            setIsDisconnected(true);
            setDisconnectReason(data.error || 'Your companion has disconnected. This chat has ended.');
            if (data.recipient && !recipient) setRecipient(data.recipient);
            if (data.ratingEligibility) setRatingEligibility(data.ratingEligibility);
            return;
          }
          if (data?.messages) {
            setMessages(data.messages);
            if (data.isBlocked) setIsBlocked(true);
            if (data.recipient && !recipient) setRecipient(data.recipient);
            if (data.ratingEligibility) setRatingEligibility(data.ratingEligibility);
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, [params.id, isDisconnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim() || isSending || isBlocked || isDisconnected) return;

    setIsSending(true);
    const content = newMsgContent;
    setNewMsgContent('');

    try {
      const res = await fetch(`/api/chat/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 410 || data.error?.includes('inactivity') || data.error?.includes('disconnected')) {
          setIsDisconnected(true);
          setDisconnectReason(data.error);
        }
        throw new Error(data.error);
      }

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setNewMsgContent(content);
    } finally {
      setIsSending(false);
    }
  };

  // Exit compartment flow: prompts rating, then completely disconnects the private chat for both ends
  const handleExitClick = () => {
    if (hasRated || ratingEligibility.alreadyRated || !recipient) {
      completeExit();
    } else {
      setShowExitRateModal(true);
    }
  };

  const completeExit = async () => {
    setIsExiting(true);
    try {
      await fetch(`/api/chat/${params.id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disconnect: true }),
      });
    } catch {
      // fallback
    }
    router.push('/discover');
  };

  const handleExitRating = async (ratingType: 'GOOD' | 'BAD') => {
    if (!recipient) {
      completeExit();
      return;
    }

    setIsSubmittingRate(true);
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId,
          roomId: params.id,
          targetUserId: recipient.id,
          ratingType,
        }),
      });
      setHasRated(true);
    } catch {
      // continue exiting
    } finally {
      setIsSubmittingRate(false);
      setShowExitRateModal(false);
      await completeExit();
    }
  };

  // Voluntary in-chat rating
  const handleVoluntaryRating = async (ratingType: 'GOOD' | 'BAD') => {
    if (!recipient) return;
    setIsSubmittingRate(true);
    setRateError(null);
    setRateFeedback(null);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId,
          roomId: params.id,
          targetUserId: recipient.id,
          ratingType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRateError(data.error || 'Failed to record rating.');
      } else {
        setHasRated(true);
        setRateFeedback(data.message || (ratingType === 'GOOD' ? 'Positive recognition recorded (+2 pts)!' : 'Feedback recorded (-2 pts).'));
        setTimeout(() => {
          setShowRateModal(false);
          setRateFeedback(null);
        }, 1800);
      }
    } catch {
      setRateError('Unexpected server error recording rating.');
    } finally {
      setIsSubmittingRate(false);
    }
  };

  const handleBlockUser = async () => {
    if (!recipient) return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedUserId: recipient.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsBlocked(true);
      setShowBlockModal(false);
      setStatusMsg(`User has been blocked. Direct messaging has been severed.`);
    } catch (err: any) {
      alert(err.message || 'Failed to block user');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReportUser = async () => {
    if (!recipient) return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedUserId: recipient.id,
          category: reportCategory,
          reason: reportReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsBlocked(true);
      setShowReportModal(false);
      setReportReason('');
      setStatusMsg(`Report submitted for review. User has also been blocked automatically.`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex justify-center items-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitClick}
            disabled={isExiting}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Return to Passenger Discovery"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {recipient ? (
            <div className="flex items-center gap-2.5">
              <img
                src={recipient.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={recipient.displayName}
                className="w-9 h-9 rounded-xl object-cover bg-slate-950 border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white">@{recipient.username}</h1>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {recipient.displayName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {recipient.interests && recipient.interests.length > 0 
                    ? recipient.interests.slice(0, 2).join(', ') 
                    : 'Private Compartment'}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm font-bold text-white">Private Compartment</span>
          )}
        </div>

        {/* Actions bar with explicit EXIT CHAT button */}
        <div className="flex items-center gap-2">
          {/* Voluntary Rate button */}
          {recipient && !hasRated && !isDisconnected && (
            <button
              type="button"
              onClick={() => { setShowRateModal(true); setRateError(null); setRateFeedback(null); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all shadow-sm"
              title="Rate this conversation"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="hidden sm:inline">Rate</span>
            </button>
          )}

          {/* DEDICATED EXIT CHAT BUTTON: Quits and disconnects private chat */}
          <button
            type="button"
            onClick={handleExitClick}
            disabled={isExiting}
            className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
            title="Exit and close private chatroom"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Chat</span>
          </button>

          {/* Block / Report buttons */}
          {recipient && !isBlocked && (
            <>
              <button
                onClick={() => setShowBlockModal(true)}
                className="p-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-500/20 rounded-lg transition-colors"
                title="Block passenger"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="p-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-950/40 border border-amber-500/20 rounded-lg transition-colors"
                title="Report passenger"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inactivity & Disconnect Notice Banner */}
      <div className="bg-slate-950/70 border-b border-slate-800/60 px-4 py-1.5 text-center flex items-center justify-center gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] text-slate-300 font-mono">
          Private chat closes automatically after 30s of inactivity or when a participant exits.
        </span>
      </div>

      {/* Companion Disconnected or Inactivity Alert */}
      {isDisconnected && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-500/60 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Private Chat Disconnected</h4>
                <p className="text-xs text-rose-300">
                  {disconnectReason || 'Your companion has exited or this chatroom timed out after 30s of inactivity. Chat history has been erased.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!hasRated && recipient && (
                <button
                  type="button"
                  onClick={() => setShowExitRateModal(true)}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
                >
                  Rate Companion
                </button>
              )}
              <Link
                href="/discover"
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all"
              >
                Return to Discover
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Status Notice if set */}
      {statusMsg && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Private Compartment Active</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Say hello and connect! This chatroom is active and will auto-close after 30s of inactivity or when either passenger clicks Exit Chat.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <img
                  src={msg.senderAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={msg.senderName}
                  className="w-9 h-9 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                />
                <div className={`max-w-[80%] sm:max-w-md space-y-1 ${isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed text-left break-words ${
                      isMe
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer or Disabled Banner */}
      {isBlocked ? (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-rose-400">
          This conversation is closed because communication between these accounts has been blocked.
        </div>
      ) : isDisconnected ? (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
          This chat has been disconnected. Return to <Link href="/discover" className="text-amber-400 underline font-bold">Passenger Discovery</Link> to connect with new passengers.
        </div>
      ) : (
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 sm:py-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={newMsgContent}
              onChange={e => setNewMsgContent(e.target.value)}
              placeholder="Send a private message (30s inactivity auto-closes)..."
              maxLength={1000}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !newMsgContent.trim()}
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
            >
              {isSending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* MANDATORY EXIT RATING PROMPT MODAL */}
      {showExitRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Star className="w-7 h-7 fill-amber-400" />
              </div>
              <h2 className="text-xl font-black text-white">Rate Your Companion</h2>
              <p className="text-xs text-slate-300">
                Before exiting, how was your conversation with <span className="text-white font-bold">@{recipient?.username}</span>?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingRate}
                onClick={() => handleExitRating('GOOD')}
                className="p-4 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/70 border-2 border-emerald-500/50 text-emerald-300 font-bold text-xs flex flex-col items-center gap-2 transition-all group"
              >
                <ThumbsUp className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black">GOOD (+2 pts)</span>
                <span className="text-[10px] text-slate-400 font-normal text-center">
                  Respectful & great conversationalist
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmittingRate}
                onClick={() => handleExitRating('BAD')}
                className="p-4 rounded-2xl bg-rose-950/50 hover:bg-rose-900/70 border-2 border-rose-500/50 text-rose-300 font-bold text-xs flex flex-col items-center gap-2 transition-all group"
              >
                <ThumbsDown className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black">BAD (-2 pts)</span>
                <span className="text-[10px] text-slate-400 font-normal text-center">
                  Disruptive, spam, or hostile
                </span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>• Score baseline is 0, capped above at 100.</p>
              <p>• Max 2 GOOD ratings per recipient per journey.</p>
              <p>• Score strictly &lt; -50 triggers permanent chat restriction.</p>
            </div>

            <div className="flex justify-center pt-1 border-t border-slate-800">
              <button
                type="button"
                disabled={isSubmittingRate}
                onClick={completeExit}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold py-1 px-3"
              >
                Exit without rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOLUNTARY IN-CHAT RATING MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowRateModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Rate Companion</h2>
              <p className="text-xs text-slate-400">
                Rate your 1-on-1 interaction with <span className="text-white font-bold">@{recipient?.username}</span>. Each rater can rate at most once per journey.
              </p>
            </div>

            {rateFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{rateFeedback}</span>
              </div>
            )}

            {rateError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{rateError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingRate}
                onClick={() => handleVoluntaryRating('GOOD')}
                className="p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex flex-col items-center gap-2 transition-all group"
              >
                <ThumbsUp className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>GOOD (+2 pts)</span>
                <span className="text-[10px] text-slate-400 font-normal">Respectful & helpful</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingRate}
                onClick={() => handleVoluntaryRating('BAD')}
                className="p-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 font-bold text-xs flex flex-col items-center gap-2 transition-all group"
              >
                <ThumbsDown className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>BAD (-2 pts)</span>
                <span className="text-[10px] text-slate-400 font-normal">Disruptive or rude</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Recipients may receive at most 2 GOOD recognitions per journey. Ratings are strictly confidential.
            </p>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Block Passenger?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Blocking @{recipient?.username} will immediately sever messaging and prevent them from appearing in future passenger discovery.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Report Passenger</h3>
            <p className="text-xs text-slate-300">
              Submit a report to the railway moderation desk.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
              <select
                value={reportCategory}
                onChange={e => setReportCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              >
                <option value="harassment">Harassment</option>
                <option value="spam">Spam / Unsolicited</option>
                <option value="abusive">Abusive Language</option>
                <option value="other">Other Safety Concern</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Details (Optional)</label>
              <textarea
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Describe what occurred..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs h-20"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950"
              >
                Submit Report & Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
