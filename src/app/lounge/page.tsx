'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Train, 
  Send, 
  ArrowLeft, 
  Users, 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
}

export default function LoungePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [journey, setJourney] = useState<any | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeRoomIdRef = useRef<string | null>(null);

  // Helper to send leave room notification
  const notifyLeaveLounge = (rId: string | null) => {
    if (!rId) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(`/api/chat/${rId}/leave`, JSON.stringify({}));
      } else {
        fetch(`/api/chat/${rId}/leave`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch {
      // ignore beacon failure on shutdown
    }
  };

  // Lifecycle presence tracking & cleanup on unmount/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      notifyLeaveLounge(activeRoomIdRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      notifyLeaveLounge(activeRoomIdRef.current);
    };
  }, []);

  // Load user and lounge room
  useEffect(() => {
    async function init() {
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
          setLoading(false);
          return;
        }

        const loungeRes = await fetch('/api/lounge');
        const loungeData = await loungeRes.json();

        if (loungeRes.status === 403 || loungeData.isBanned) {
          setIsBanned(true);
          setLoading(false);
          return;
        }

        if (!loungeRes.ok || !loungeData.roomId) {
          setError(loungeData.error || 'Failed to connect to journey lounge.');
          setLoading(false);
          return;
        }

        setRoomId(loungeData.roomId);
        activeRoomIdRef.current = loungeData.roomId;
        setJourney(loungeData.journey);
        await fetchMessages(loungeData.roomId);
      } catch (err: any) {
        setError('Error connecting to Common Lounge.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  async function fetchMessages(rId: string) {
    try {
      const res = await fetch(`/api/chat/${rId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // non-fatal polling failure
    }
  }

  // Periodic polling for new messages
  useEffect(() => {
    if (!roomId || isBanned) return;

    const interval = setInterval(() => {
      fetchMessages(roomId);
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId, isBanned]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleExitLounge = async () => {
    if (roomId) {
      try {
        await fetch(`/api/chat/${roomId}/leave`, { method: 'POST' });
      } catch {
        // continue
      }
    }
    router.push('/carriage');
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || sending || isBanned) return;

    const textToSend = newMessage.trim();
    setSending(true);

    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send message.');
        return;
      }

      setNewMessage('');
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch {
      setError('Connection failure while sending message.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
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
          <h1 className="text-xl font-bold text-white">Lounge Access Restricted</h1>
          <p className="text-xs text-rose-300 leading-relaxed">
            Your account is permanently restricted from participating in the Common Lounge because your community reputation score fell strictly below -50.
          </p>
          <div className="pt-4">
            <Link
              href="/carriage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Carriage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between">
      {/* Top Lounge Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitLounge}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Return to Carriage"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Carriage</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">Common Lounge</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Coach B
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {journey?.name || 'Midnight Hackathon Express'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 font-mono">
            All onboard passengers
          </span>
        </div>
      </div>

      {/* Ephemeral Notice Banner */}
      <div className="bg-slate-950/60 border-b border-slate-800/60 px-4 py-1.5 text-center">
        <span className="text-[11px] text-slate-400 font-mono">
          🔒 Lounge History: Chat history is cleared automatically when no one is in the chatroom.
        </span>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto text-amber-400/60 mb-3">
              <Train className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-400">The Common Lounge is quiet.</p>
            <p className="text-xs">Be the first passenger to say hello to everyone aboard Coach B!</p>
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

      {/* Message Composer */}
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 sm:py-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Send a message to the carriage lounge..."
            maxLength={1000}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
          >
            {sending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
