import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Users
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { NoticeAlert } from '@/components/common/NoticeAlert';

export const metadata = {
  title: 'Business Model & Sustainability | VIBE — AI for Humanity',
  description: 'Ethical monetization frameworks, potential partnership avenues, and pilot validation metrics.',
};

export default function BusinessPage() {
  return (
    <div className="py-16 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="navy" className="mb-3">Economic Sustainability</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Ethical Business Models & Partnerships
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Presented as prospective hypotheses and commercial explorations for post-hackathon viability — never fabricating unconfirmed revenue or fictitious partners.
          </p>
        </div>

        {/* Ethical Monetization Mandates */}
        <NoticeAlert type="warning" title="Ethical Monetization Principles" className="mb-12">
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm mt-1">
            <li><strong>Core safety is never paywalled:</strong> Access to official railway helplines, two-way blocking, and reporting is 100% free forever.</li>
            <li><strong>Zero data harvesting:</strong> We never sell passenger itineraries, private chat logs, or personal travel trends to data brokers.</li>
            <li><strong>No safety manipulation:</strong> Sponsored partners cannot influence moderation decisions or algorithm safety scores.</li>
          </ul>
        </NoticeAlert>

        {/* 4 Models */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {/* Model A */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
            <Badge variant="brand" className="mb-3">Model A</Badge>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Freemium Experience</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              <strong>Free forever:</strong> Profile setup, voluntary discovery, basic 1-to-1 and group messaging, safety reporting, blocking, and emergency directories.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Optional future premium:</strong> Advanced language learning course packs, offline audio phrasebooks, multi-train journey history, and cohort discussion guides.
            </p>
          </div>

          {/* Model B */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
            <Badge variant="navy" className="mb-3">Model B</Badge>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Travel & Ed Partnerships</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Partnering with regional tourism boards, verified educational academies (e.g. UPSC/GATE prep publishers), and cultural foundations.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Provides curated station heritage guides, audio mini-documentaries, and verified educational group activities aligned with specific travel corridors.
            </p>
          </div>

          {/* Model C */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
            <Badge variant="neutral" className="mb-3">Model C</Badge>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Institutional Licensing</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Private community cohorts for university travel delegations, educational study tours, corporate offsite transit, or volunteer group coordination.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enables closed, verified group coordination without dispersing members across fragmented public channels.
            </p>
          </div>

          {/* Model D */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
            <Badge variant="amber" className="mb-3">Model D</Badge>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Sponsored Cultural Activities</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Ethical, clearly labelled brand-sponsored quizzes and book exchanges (e.g., a regional tea brand sponsoring a cultural trivia game with physical station redemption).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Strictly non-intrusive and completely decoupled from matching filters or private conversations.
            </p>
          </div>
        </div>

        {/* Pilot Validation Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs mb-10">
          <h2 className="text-xl font-bold text-navy-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            Key Pilot Validation Metrics
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            The following metrics are designed to rigorously evaluate product-market fit, user safety, and engagement during our planned pilot phase:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="pb-3 font-semibold">Evaluation Metric</th>
                  <th className="pb-3 font-semibold">Target Hypothesis</th>
                  <th className="pb-3 font-semibold">Safety & Trust Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr>
                  <td className="py-3 font-semibold text-navy-900">Discovery Opt-in Rate</td>
                  <td className="py-3 text-slate-600">&gt; 65% of completed profiles</td>
                  <td className="py-3 text-emerald-700">Validates voluntary passenger interest</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-navy-900">Match-to-Conversation Rate</td>
                  <td className="py-3 text-slate-600">&gt; 25% of match suggestions</td>
                  <td className="py-3 text-emerald-700">Verifies interest relevance without spam</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-navy-900">Activity Completion Rate</td>
                  <td className="py-3 text-slate-600">&gt; 40% of participating passengers</td>
                  <td className="py-3 text-emerald-700">Demonstrates positive transit time utilization</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-navy-900">Time to Official Help Access</td>
                  <td className="py-3 text-slate-600">&lt; 10 seconds from any screen</td>
                  <td className="py-3 text-emerald-700">Zero-friction safety information delivery</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-navy-900">Block / Report Resolution Time</td>
                  <td className="py-3 text-slate-600">Immediate client block, &lt; 2hr audit</td>
                  <td className="py-3 text-emerald-700">Zero tolerance for abuse or harassment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <span>Join VIBE as an Early Passenger</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
