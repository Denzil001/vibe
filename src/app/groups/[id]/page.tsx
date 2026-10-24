'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Send, 
  ShieldAlert, 
  LogOut, 
  Train, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Info,
  AlertTriangle,
  Gamepad2
} from 'lucide-react';
import { Group, Message, SafeUser } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [group, setGroup] = useState<(Group & { isMember?: boolean }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsgContent, setNewMsgContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTogglingMember, setIsTogglingMember] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchGroupData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(meData.user);

      const gRes = await fetch(`/api/groups/${params.id}`);
      if (!gRes.ok) throw new Error('Failed to load group');
      const gData = await gRes.json();
      setGroup(gData.group);

      if (gData.group.isMember) {
        const mRes = await fetch(`/api/groups/${params.id}/messages`);
        if (mRes.ok) {
          const mData = await mRes.json();
          setMessages(mData.messages || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();

    // Poll for new messages every 4 seconds when in group
    const interval = setInterval(() => {
      if (group?.isMember) {
        fetch(`/api/groups/${params.id}/messages`)
          .then(res => (res.ok ? res.json() : null))
          .then(data => {
            if (data?.messages) {
              setMessages(data.messages);
            }
          })
          .catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [params.id, group?.isMember]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleMembership = async () => {
    if (!group) return;
    setIsTogglingMember(true);

    try {
      const method = group.isMember ? 'DELETE' : 'POST';
      const res = await fetch(`/api/groups/${params.id}`, { method });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGroup({ ...group, isMember: data.isMember });
      if (data.isMember) {
        // Fetch messages on join
        const mRes = await fetch(`/api/groups/${params.id}/messages`);
        if (mRes.ok) {
          const mData = await mRes.json();
          setMessages(mData.messages || []);
        }
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsTogglingMember(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim() || isSending) return;

    setIsSending(true);
    const content = newMsgContent;
    setNewMsgContent('');

    try {
      const res = await fetch(`/api/groups/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, data.message]);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setNewMsgContent(content); // restore on error
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center flex-1 bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Loading group community...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-20 text-center flex-1 bg-slate-50">
        <p className="text-sm text-slate-600 mb-4">Community group not found or removed.</p>
        <Link href="/groups" className="text-xs font-bold text-brand-600 underline">
          &larr; Back to communities
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 flex-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Communities</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/play"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-mono"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arcade Games</span>
            </Link>

            <Button
              onClick={handleToggleMembership}
              variant={group.isMember ? 'outline' : 'primary'}
              size="sm"
              isLoading={isTogglingMember}
            >
              {group.isMember ? 'Leave Group' : 'Join Community'}
            </Button>
          </div>
        </div>

        {/* Group Info Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="navy" size="sm">{group.category}</Badge>
                {group.trainNumber && (
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                    Train {group.trainNumber}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {group.memberCount} active member{group.memberCount === 1 ? '' : 's'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900">{group.name}</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                {group.description}
              </p>
            </div>
          </div>

          {/* Rules Dropdown / Info */}
          {group.rules && group.rules.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Community Guidelines
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {group.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">&bull;</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Chat Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-navy-900">Live Group Discussion</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Auto-updating &bull; Respect coach quiet hours
            </span>
          </div>

          {!group.isMember ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-navy-900 mb-1">
                Join this community to participate
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                You must join this community group to view conversation history and exchange messages with other passengers.
              </p>
              <Button onClick={handleToggleMembership} isLoading={isTogglingMember} size="sm">
                Join Community Now
              </Button>
            </div>
          ) : (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    <p>No messages yet in this group.</p>
                    <p className="mt-1">Be the first to introduce yourself and start the journey conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <img
                          src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                        />
                        <div>
                          <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                            <span className="text-xs font-bold text-navy-900">
                              {isMe ? 'You' : msg.senderName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
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

              {/* Chat Input */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newMsgContent}
                    onChange={e => setNewMsgContent(e.target.value)}
                    placeholder="Type your message to the group (Max 1,000 chars)..."
                    maxLength={1000}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Button
                    type="submit"
                    isLoading={isSending}
                    disabled={!newMsgContent.trim()}
                    size="md"
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
                  <span>Please keep messages respectful. Do not post seat or berth numbers.</span>
                  <span>{newMsgContent.length}/1000</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
