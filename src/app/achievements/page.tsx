'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Train, 
  Users, 
  MessageSquare, 
  Languages, 
  UserCheck 
} from 'lucide-react';
import { AchievementBadge } from '@/types';
import { Badge } from '@/components/common/Badge';

interface BadgeWithStatus extends AchievementBadge {
  isEarned: boolean;
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [points, setPoints] = useState(0);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => {
        setBadges(data.badges || []);
        setPoints(data.points || 0);
        setEarnedCount(data.earnedCount || 0);
        setTotalCount(data.totalCount || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck': return <UserCheck className="w-6 h-6" />;
      case 'Train': return <Train className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'MessageSquare': return <MessageSquare className="w-6 h-6" />;
      case 'Languages': return <Languages className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center flex-1 bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Loading passenger achievements...</div>
      </div>
    );
  }

  const completionPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Passenger Badges & Progress
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Earn badges through voluntary participation, learning activities, and respectful community building
          </p>
        </div>

        {/* Overview Banner */}
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">
              Your Journey Standing
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {points} <span className="text-lg font-normal text-slate-400">Total Points</span>
            </div>
            <p className="text-xs text-slate-400">
              {earnedCount} of {totalCount} milestone badges unlocked ({completionPercent}%)
            </p>
          </div>

          <div className="w-full sm:w-48 bg-navy-800/80 rounded-xl p-3 border border-navy-700">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
              <span>Badge Progress</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                badge.isEarned
                  ? 'bg-white border-brand-200 shadow-xs'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  badge.isEarned
                    ? 'bg-brand-50 text-brand-600 border border-brand-200'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {getIcon(badge.icon)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-navy-900 truncate">{badge.title}</h3>
                  {badge.isEarned ? (
                    <Badge variant="brand" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      <Lock className="w-3 h-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Points Note */}
        <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-200">
          <strong>Design Note:</strong> VIBE badges are designed for intrinsic motivation and skill celebration. We do not publicly rank passengers or reward high message volume to prevent spam and artificial popularity contests.
        </div>
      </div>
    </div>
  );
}
