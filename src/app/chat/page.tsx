'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowRight, Ban, User, Sparkles } from 'lucide-react';
import { Conversation, SafeUser } from '@/types';
import { Badge } from '@/components/common/Badge';

interface EnrichedConversation extends Conversation {
  recipient: SafeUser | null;
  isBlocked: boolean;
}

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chat')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setConversations(data.conversations || []))
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center flex-1 bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Messages
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Direct, respectful 1-to-1 conversations with matched passengers
            </p>
          </div>

          <Link
            href="/discover"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Passengers</span>
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-navy-900">No active conversations yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Find fellow travellers who share your interests on your route and send them an invitation to connect.
            </p>
            <div className="pt-2">
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-navy-900 text-white hover:bg-navy-800"
              >
                <span>Browse Matched Passengers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {conversations.map(conv => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors block"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={conv.recipient?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={conv.recipient?.displayName || 'Passenger'}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy-900 truncate">
                        {conv.recipient?.displayName || 'Passenger'}
                      </h3>
                      {conv.isBlocked && (
                        <Badge variant="red" size="sm">
                          <Ban className="w-3 h-3 mr-1" /> Blocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5 max-w-md">
                      {conv.lastMessage || 'No messages yet. Send a greeting!'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {conv.lastMessageAt && (
                    <span className="text-[10px] text-slate-400 block mb-1">
                      {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <span className="text-xs font-bold text-brand-600 hover:underline">Open &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
