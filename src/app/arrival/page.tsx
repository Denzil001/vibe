'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Train, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Flame, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';

export default function ArrivalPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) setCurrentUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-8 text-center">
        {/* Terminal Station Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/20 mb-2">
          <Train className="w-10 h-10 text-slate-950" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Journey Terminus Reached
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            We Have Arrived!
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The hackathon train journey has concluded. Thank you for riding and connecting with your fellow passengers!
          </p>
        </div>

        {/* Data Lifecycle Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 text-left shadow-2xl backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Journey Privacy & Ledger Summary</span>
          </h2>

          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block">✨ Chat Messages Cleaned</span>
              <p className="text-slate-400 leading-relaxed">
                Active text messages from the common lounge and private compartments have been wiped from the live database.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 block">🔒 Permanent Passenger Identity Saved</span>
              <p className="text-slate-400 leading-relaxed">
                Your passenger handle <span className="text-white font-bold">@{currentUser?.username || 'you'}</span>, chosen avatar, and accumulated reputation score are safely preserved for future train journeys.
              </p>
            </div>

            {currentUser && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white">Final Journey Score</span>
                </div>
                <span className="font-mono font-black text-amber-300 text-lg">
                  {currentUser.reputationScore ?? 0} pts
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/profile"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all"
            >
              View My Profile
            </Link>
            <Link
              href="/play"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs text-center transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Play Arcade Games</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
