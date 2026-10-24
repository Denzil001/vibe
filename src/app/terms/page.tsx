import React from 'react';
import Link from 'next/link';
import { FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export const metadata = {
  title: 'Terms of Service | VIBE — AI for Humanity',
  description: 'Terms of service, community standards, acceptable use policies, and emergency liability limitations.',
};

export default function TermsPage() {
  return (
    <div className="py-16 bg-slate-50 flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="navy" className="mb-3">User Agreement</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-slate-600 text-sm">
            Last updated: October 2026 &bull; Clear rules for respectful train travel communities
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-navy-900 mb-2">1. Nature of the Service</h2>
            <p>
              VIBE is an independent software application designed to facilitate voluntary, interest-based social discovery, skill exchange, and interactive learning among train travellers. VIBE is not affiliated with, authorized by, or endorsed by Indian Railways, IRCTC, or the Ministry of Railways.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2">2. Emergency Disclaimer & Limitations</h2>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs sm:text-sm mb-3">
              <strong>CRITICAL NOTICE:</strong> VIBE is NOT an emergency response system, railway police dispatch service, or replacement for official railway assistance. In any situation involving physical danger, harassment, medical distress, or crime, you MUST immediately contact official railway helplines (RailMadad: 139 or Emergency: 112) or alert onboard railway staff.
            </div>
            <p className="text-sm text-slate-600">
              VIBE and its operators make no representation or guarantee regarding the safety, integrity, identity, or behavior of passengers who use this service.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2">3. Acceptable Use & Prohibited Conduct</h2>
            <p className="mb-3">
              By using VIBE, you agree to treat fellow passengers with dignity, courtesy, and respect. You strictly agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-sm pl-2">
              <li>Harass, intimidate, stalk, solicit, or threaten any passenger or user.</li>
              <li>Post or solicit exact berth numbers or seat allocations in public channels.</li>
              <li>Send unauthorized commercial promotions, financial solicitations, or spam.</li>
              <li>Take or share photos or recordings of fellow passengers without explicit consent.</li>
              <li>Impersonate railway officials, police personnel, or other passengers.</li>
              <li>Use the platform to arrange or coordinate illegal activities or disrupt railway safety.</li>
            </ul>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2">4. Enforcement & Termination</h2>
            <p>
              We reserve the right to suspend or permanently terminate access for any account found violating these terms, engaging in harassment, or submitting fraudulent or malicious reports.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
