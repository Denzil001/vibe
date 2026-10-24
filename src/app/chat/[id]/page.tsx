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
  AlertTriangle,
  Gamepad2
} from 'lucide-react';
import { Message, SafeUser, Conversation } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export default function ConversationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [recipient, setRecipient] = useState<SafeUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsgContent, setNewMsgContent] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<'harassment' | 'spam' | 'abusive' | 'other'>('harassment');
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(meData.user);

      // Find conversation details from chat list
      const cRes = await fetch('/api/chat');
      if (cRes.ok) {
        const cData = await cRes.json();
        const conv = (cData.conversations || []).find((c: any) => c.id === params.id);
        if (conv) {
          setConversation(conv);
          setRecipient(conv.recipient);
          setIsBlocked(conv.isBlocked);
        }
      }

      // Fetch messages
      const mRes = await fetch(`/api/chat/${params.id}/messages`);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMessages(mData.messages || []);
        if (mData.isBlocked) setIsBlocked(true);
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
      fetch(`/api/chat/${params.id}/messages`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.messages) {
            setMessages(data.messages);
            if (data.isBlocked) setIsBlocked(true);
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim() || isSending || isBlocked) return;

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
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, data.message]);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setNewMsgContent(content);
    } finally {
      setIsSending(false);
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
      <div className="py-20 flex justify-center items-center flex-1 bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Conversations</span>
          </Link>

          {recipient && !isBlocked && (
            <div className="flex items-center gap-2">
              <Link
                href={`/play?invite=${recipient.username || recipient.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors font-mono"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invite to Play</span>
              </Link>
              <button
                onClick={() => setShowBlockModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          )}
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Conversation Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[560px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <img
                src={recipient?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={recipient?.displayName || 'Passenger'}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h2 className="text-sm font-bold text-navy-900 leading-tight">
                  {recipient?.displayName || 'Passenger'}
                </h2>
                <span className="text-[11px] text-slate-500">
                  {recipient?.interests?.slice(0, 2).join(' • ') || 'Verified Passenger'}
                </span>
              </div>
            </div>

            {isBlocked && (
              <Badge variant="red" size="sm">
                Communication Blocked
              </Badge>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-1">
                <p>No messages yet.</p>
                <p>Say hello to {recipient?.displayName} and share your travel goals!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div>
                      <div className={`flex items-center gap-2 mb-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-navy-900 text-white rounded-tr-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-xs'
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

          {/* Input or Block Notice */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white rounded-b-2xl">
            {isBlocked ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-center font-medium">
                Direct messaging between these accounts is blocked. To protect user privacy, direct contact cannot be resumed.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newMsgContent}
                  onChange={e => setNewMsgContent(e.target.value)}
                  placeholder={`Message ${recipient?.displayName || 'passenger'}...`}
                  maxLength={1000}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button
                  type="submit"
                  isLoading={isSending}
                  disabled={!newMsgContent.trim()}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Block Modal */}
        {showBlockModal && recipient && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <Ban className="w-6 h-6" />
                <h3 className="text-lg font-bold text-navy-900">Block {recipient.displayName}?</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Blocking immediately ends this conversation and prevents future discovery between both accounts. {recipient.displayName} will not be notified.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowBlockModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBlockUser}
                  isLoading={isSubmittingAction}
                >
                  Confirm Block
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && recipient && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold text-navy-900">Report {recipient.displayName}</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="harassment">Harassment or Stalking</option>
                  <option value="spam">Commercial Spam / Solicitation</option>
                  <option value="abusive">Abusive or Threatening Behavior</option>
                  <option value="other">Other Community Rule Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason & Context
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Explain why this interaction violated community rules..."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReportUser}
                  isLoading={isSubmittingAction}
                  disabled={reportReason.trim().length < 5}
                >
                  Submit & Block
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
