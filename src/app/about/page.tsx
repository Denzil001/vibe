import React from 'react';
import Link from 'next/link';
import { Train, Heart, Shield, Sparkles, Target, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About & Mission | VIBE — AI for Humanity',
  description: 'Learn about the mission, founding hypothesis, and design principles behind VIBE.',
};

export default function AboutPage() {
  return (
    <div className="py-16 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Connecting travellers for a safer, more enriching journey
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            VIBE explores a human-centered hypothesis: voluntary, interest-based social discovery and peer support can transform passive transit hours into meaningful connection.
          </p>
        </div>

        {/* Core Principles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs mb-10 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600" />
              The Core Problem
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every day, over 24 million passengers board trains across India. A vast proportion travel solo or with family, spending between 8 and 36 hours in transit. While digital tools have revolutionized reservations (IRCTC) and grievances (RailMadad), the voluntary social and intellectual experience inside the coach remains largely unaddressed. Passengers who would love to practice a language, discuss a book, solve chess puzzles, or learn software engineering have no safe, bounded medium to discover each other.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-600" />
              The AI for Humanity Vision
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Technology should elevate human connection, not replace it with endless algorithmic feeds. VIBE uses transparent, explainable matching to suggest peer learning opportunities and respectful conversation starters. We strictly refuse to use sensitive attributes (such as religion, caste, gender shortcuts, or political alignment) in matching, and we provide complete control over discoverability.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600" />
              Complementary, Not Competing
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              VIBE is not a railway police force, emergency responder, or medical provider. Our duty is to keep official assistance visible and accessible at all times, complementing public infrastructure with peer warmth and proactive reporting tools.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <span>See How Matching Works</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
