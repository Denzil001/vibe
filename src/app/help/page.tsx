import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Train, 
  HeartHandshake, 
  FileText,
  LifeBuoy
} from 'lucide-react';
import { NoticeAlert } from '@/components/common/NoticeAlert';
import { Badge } from '@/components/common/Badge';

export const metadata = {
  title: 'Official Railway Assistance & Safety Support | VIBE',
  description: 'Verified official Indian Railways emergency helplines, RailMadad 139 portal, and safety guidance.',
};

export default function HelpPage() {
  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Official Railway Assistance & Safety Help
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Direct, zero-barrier directory of Indian Railways verified emergency and grievance channels
          </p>
        </div>

        {/* Required Non-Negotiable Caution Alert */}
        <NoticeAlert type="caution" title="Important Safety Notice">
          <p className="mb-2">
            <strong>Human connection complements, not replaces, official safety response.</strong>
          </p>
          <p className="text-xs sm:text-sm">
            VIBE is a voluntary social platform and is <strong>not</strong> an emergency dispatcher or railway police unit. In situations involving physical danger, crime, harassment, or medical emergencies during a train journey, you must contact official railway personnel directly using the helplines below.
          </p>
        </NoticeAlert>

        {/* Official Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-950 text-white p-6 rounded-2xl border border-navy-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="amber" size="sm">National 24x7</Badge>
                <Phone className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">RailMadad Unified Helpline</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Consolidated Indian Railways helpline for medical assistance, security emergencies, onboard cleanliness, and catering grievances.
              </p>
            </div>
            <div className="pt-4 border-t border-navy-800">
              <span className="text-xs text-slate-400 block mb-0.5">Toll-free / Direct Dial</span>
              <span className="text-3xl font-black text-amber-400 tracking-wider">139</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="navy" size="sm">Emergency Service</Badge>
                <Phone className="w-4 h-4 text-navy-800" />
              </div>
              <h2 className="text-lg font-bold text-navy-900 mb-1">All-India Emergency Number</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Unified emergency helpline across India for police, ambulance, fire services, and immediate disaster coordination.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 block mb-0.5">National Emergency Dial</span>
              <span className="text-3xl font-black text-navy-900 tracking-wider">112</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="brand" size="sm">Transit Safety</Badge>
                <Phone className="w-4 h-4 text-brand-600" />
              </div>
              <h2 className="text-lg font-bold text-navy-900 mb-1">Women Safety in Transit</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Specialized emergency response helpline providing immediate assistance to female passengers facing distress or harassment.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 block mb-0.5">Women Helpline Dial</span>
              <span className="text-3xl font-black text-brand-600 tracking-wider">1091</span>
            </div>
          </div>
        </div>

        {/* On-Board Assistance Protocols */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Train className="w-5 h-5 text-brand-600" />
            What to Do If You Need Help Onboard a Train
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-navy-900 mb-1">1. Travelling Ticket Examiner (TTE)</h3>
              <p className="text-slate-600 leading-relaxed">
                TTEs carry official duty charts and have direct wireless communication with the Train Guard and onboard security escorts.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-navy-900 mb-1">2. Railway Protection Force (RPF)</h3>
              <p className="text-slate-600 leading-relaxed">
                RPF escorts patrol express trains to protect passenger safety and railway property. You can summon them via RailMadad or through coach attendants.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-navy-900 mb-1">3. Government Railway Police (GRP)</h3>
              <p className="text-slate-600 leading-relaxed">
                State police units stationed at railway platforms responsible for law enforcement, crime investigation, and registration of FIRs.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-navy-900 mb-1">4. Online RailMadad Grievance</h3>
              <p className="text-slate-600 leading-relaxed">
                You can submit an online web complaint with your PNR number at{' '}
                <a
                  href="https://railmadad.indianrailways.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-600 underline inline-flex items-center gap-1"
                >
                  railmadad.gov.in <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Small Talk Saves Lives Note */}
        <div className="bg-brand-50/60 rounded-2xl border border-brand-200 p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="p-2.5 rounded-xl bg-brand-100 text-brand-800 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">
              The Power of Supportive Conversation (Small Talk Saves Lives)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Research from the UK Samaritans and transit authorities demonstrates that everyday friendly, polite conversation can break feelings of severe isolation. Asking simple questions like “How is your journey going?” or “What book are you reading?” creates a warm, connected coach environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
