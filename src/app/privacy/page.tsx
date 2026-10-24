import React from 'react';
import Link from 'next/link';
import { Lock, EyeOff, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export const metadata = {
  title: 'Privacy Policy | VIBE — AI for Humanity',
  description: 'Our data minimization principles, voluntary profile settings, and strict privacy commitments.',
};

export default function PrivacyPage() {
  return (
    <div className="py-16 bg-slate-50 flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">Data Minimization</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-slate-600 text-sm">
            Last updated: October 2026 &bull; Strict adherence to user autonomy and digital safety
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-navy-900 mb-2 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-brand-600" />
              1. What We Explicitly Do Not Collect
            </h2>
            <p className="mb-2">
              To safeguard our travellers against digital profiling or real-world stalking, VIBE strictly adheres to negative data collection rules:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm pl-2">
              <li><strong>No exact seat or berth numbers:</strong> We never ask for or store your coach or berth assignment.</li>
              <li><strong>No real-time GPS coordinates:</strong> We do not track your live geographical coordinates during the journey.</li>
              <li><strong>No mandatory phone numbers:</strong> You do not need a phone number to discover or message fellow passengers.</li>
              <li><strong>No sensitive inferred attributes:</strong> We never infer or rank users by caste, religion, political beliefs, or sexual orientation.</li>
            </ul>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-600" />
              2. Information You Voluntarily Provide
            </h2>
            <p className="mb-2">
              When creating an account and logging a journey, you choose to provide:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm pl-2">
              <li>An account email and password hash for secure authentication.</li>
              <li>A chosen display name or alias, optional avatar, and short personal bio.</li>
              <li>Selected interests, skills to share, skills to learn, and conversational topics.</li>
              <li>Voluntary train number, travel date, boarding station, and destination station.</li>
            </ul>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              3. Purpose of Processing & Matching
            </h2>
            <p>
              Your provided preferences are processed solely to compute transparent compatibility scores for passenger discovery and to permit participation in train group discussions. We do not sell, rent, or lease personal travel data to any commercial advertisers or data brokers.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              4. Complete Account Deletion
            </h2>
            <p>
              You have the unconditional right to erase your profile. Visiting your profile settings and confirming account deletion immediately and permanently scrubs your user record, associated active journeys, group memberships, and personal preferences from our active databases.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2">
              5. Contact Us
            </h2>
            <p>
              For privacy inquiries, audit concerns, or security disclosures, please reach our safety coordination team at <span className="font-semibold text-navy-900">privacy@vibe.app</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
