import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Phone, 
  AlertTriangle, 
  Lock, 
  Ban, 
  Flag, 
  EyeOff, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { NoticeAlert } from '@/components/common/NoticeAlert';
import { Badge } from '@/components/common/Badge';

export const metadata = {
  title: 'Safety, Trust & Official Assistance | VIBE — AI for Humanity',
  description: 'Our commitment to passenger safety, two-way blocking, privacy safeguards, and official Indian Railways emergency helplines.',
};

export default function SafetyPage() {
  return (
    <div className="py-16 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="amber" className="mb-3">Zero Compromise on Trust</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Safety, Trust & Official Assistance
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Safety in VIBE is an active structural design principle. We combine strict data minimization, proactive user controls, and immediate handoffs to official emergency responders.
          </p>
        </div>

        {/* Official Emergency Contact Directory */}
        <div className="bg-navy-950 text-white rounded-2xl p-7 sm:p-9 shadow-lg mb-12 border border-navy-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Official Indian Railways Helplines</h2>
              <p className="text-xs text-slate-400">Available 24x7 across all railway divisions in India</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            If you experience an emergency, crime, theft, medical crisis, or safety threat on a train, <strong>do not rely on an in-app report</strong>. Contact official authorities directly using these verified channels:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-navy-900/90 p-4 rounded-xl border border-navy-800">
              <span className="text-xs text-slate-400 block mb-1">RailMadad (Unified Helpline)</span>
              <span className="text-2xl font-black text-amber-400 tracking-wider">139</span>
              <p className="text-[11px] text-slate-400 mt-1">Security, medical aid, catering & complaints</p>
            </div>

            <div className="bg-navy-900/90 p-4 rounded-xl border border-navy-800">
              <span className="text-xs text-slate-400 block mb-1">National Emergency Number</span>
              <span className="text-2xl font-black text-white tracking-wider">112</span>
              <p className="text-[11px] text-slate-400 mt-1">All-India Police, Fire & Medical dispatch</p>
            </div>

            <div className="bg-navy-900/90 p-4 rounded-xl border border-navy-800">
              <span className="text-xs text-slate-400 block mb-1">Women Safety in Transit</span>
              <span className="text-2xl font-black text-brand-300 tracking-wider">1091</span>
              <p className="text-[11px] text-slate-400 mt-1">Dedicated women distress response helpline</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-t border-navy-800 pt-4">
            <a
              href="https://railmadad.indianrailways.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 underline"
            >
              <span>Visit RailMadad Official Web Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>&bull;</span>
            <span>Alert Travelling Ticket Examiner (TTE) in your coach</span>
            <span>&bull;</span>
            <span>Alert Railway Protection Force (RPF) personnel</span>
          </div>
        </div>

        {/* Mandatory Caution Notice */}
        <NoticeAlert type="caution" title="Important Safety Disclaimers" className="mb-12">
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm mt-1">
            <li><strong>Human connection complements, not replaces, official safety response.</strong></li>
            <li>VIBE moderators are not railway police, medical professionals, or emergency dispatchers.</li>
            <li>Submitting a report inside VIBE does not automatically notify railway police or halt a train.</li>
            <li>Matching compatibility does not verify a passenger’s identity, background, or safety.</li>
          </ul>
        </NoticeAlert>

        {/* In-App Safety Features */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs mb-10 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Two-Way Communication Blocking
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you block another user, the action is immediate and absolute. Both users are mutually excluded from discovery, 1-to-1 conversations cannot be initiated, and historical direct messages are severed. The blocked user receives no alert or notification to avoid escalation.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-600" />
              Categorized Passenger Reporting
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Passengers can report profiles, messages, or groups for violations of our community standards:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
              <span className="p-2 bg-slate-50 rounded border border-slate-200">&bull; Harassment & Stalking</span>
              <span className="p-2 bg-slate-50 rounded border border-slate-200">&bull; Commercial Spam & Scams</span>
              <span className="p-2 bg-slate-50 rounded border border-slate-200">&bull; Abusive / Threatening Language</span>
              <span className="p-2 bg-slate-50 rounded border border-slate-200">&bull; Unwanted Direct Contact</span>
              <span className="p-2 bg-slate-50 rounded border border-slate-200">&bull; Inappropriate Content</span>
              <span className="p-2 bg-slate-50 rounded border border-slate-200">&bull; Impersonation / False Claims</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-600" />
              Data Minimization & Private Location
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We never broadcast your exact seat, berth, or live tracking coordinates. Matching is confined to voluntary train number overlap. Furthermore, you can delete your profile and personal travel history with a single click at any time.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <span>View Full Passenger Assistance & Help Directory</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
