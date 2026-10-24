import React from 'react';
import Link from 'next/link';
import { 
  UserPlus, 
  Train, 
  Cpu, 
  MessageCircle, 
  ShieldCheck, 
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export const metadata = {
  title: 'How It Works | VIBE — AI for Humanity',
  description: 'Understand the deterministic passenger matching model, privacy boundaries, and journey workflows.',
};

export default function HowItWorksPage() {
  return (
    <div className="py-16 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge variant="brand" className="mb-3">Transparent Architecture</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            How VIBE Matches Passengers
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            No black-box algorithms or secret profiling. Here is exactly how VIBE evaluates compatibility and protects your privacy.
          </p>
        </div>

        {/* The 4 Journey Steps */}
        <div className="space-y-8 mb-16">
          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0 font-bold text-lg">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Create Your Passenger Profile</h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                You configure your display alias, a short bio, your personal interests (e.g., Tech, Literature, Chess), skills you are happy to share or discuss, skills you want to learn, and conversational languages.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-200">
                <strong>Privacy Rule:</strong> We never ask for legal government identity, contact numbers, exact home addresses, or sensitive demographic markers.
              </div>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 font-bold text-lg">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Log Your Train Schedule</h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                Enter your train number (e.g. 12951 Mumbai Rajdhani), travel date, and boarding/destination stations.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-200">
                <strong>Safety Rule:</strong> Your exact coach number and seat/berth are <em>never</em> requested or broadcast to others. Journey details are kept strictly bounded to the travel timeframe.
              </div>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold text-lg">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">The Explainable Scoring Engine</h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                Compatibility is computed deterministically using weighted criteria:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-navy-900 block">Same Train & Date (+30 pts)</span>
                  <span className="text-slate-500">Shared physical travel context</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-navy-900 block">Interest Overlap (+25 pts)</span>
                  <span className="text-slate-500">Shared hobbies, reading, hobbies</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-navy-900 block">Skill Teaching & Learning (+20 pts)</span>
                  <span className="text-slate-500">Complementary learning goals</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-navy-900 block">Conversation & Language (+20 pts)</span>
                  <span className="text-slate-500">Common languages and discussion themes</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                Every suggestion comes with a plain English reason: e.g. “Suggested because you both enjoy technology and language learning on Mumbai Rajdhani.”
              </p>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-lg">
              4
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Respectful Interaction & Direct Control</h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                You can join open train groups, send a direct invitation to connect, or dismiss matches with zero notification to the other party. If an interaction ever makes you uncomfortable, 1-click blocking immediately severs all contact.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-sm transition-colors"
          >
            <span>Get Started with VIBE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
