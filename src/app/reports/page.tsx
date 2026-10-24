'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { Report } from '@/types';
import { Badge } from '@/components/common/Badge';

export default function ReportsStatusPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setReports(data.reports || []))
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="amber" size="sm"><Clock className="w-3 h-3 mr-1" /> Pending Triage</Badge>;
      case 'under_review':
        return <Badge variant="navy" size="sm"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="neutral" size="sm"><XCircle className="w-3 h-3 mr-1" /> Dismissed</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center flex-1 bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Loading report statuses...</div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Your Safety Reports
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Track status and resolution for community safety issues you have reported
            </p>
          </div>

          <Link
            href="/help"
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Emergency Helplines
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-navy-900">No active reports filed</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You have not submitted any safety reports. If you ever encounter harassment or abusive conduct, report it immediately from any passenger profile or conversation.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {reports.map(rep => (
              <div key={rep.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category:
                    </span>
                    <Badge variant="navy" size="sm">{rep.category}</Badge>
                  </div>
                  {getStatusBadge(rep.status)}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {rep.reason}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Report ID: {rep.id}</span>
                  <span>Submitted: {new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
