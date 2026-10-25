'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Save, 
  User, 
  FileText,
  Scale,
  Flame,
  QrCode,
  RotateCcw,
  Ban,
  Check,
  X,
  History,
  Lock
} from 'lucide-react';
import { Report, ScoreEvent, ReputationAppeal, QRToken } from '@/types';

interface EnrichedAdminReport extends Report {
  reporterName?: string;
  reportedUserName?: string | null;
  reportedGroupName?: string | null;
}

export default function AdminModeratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reports' | 'appeals' | 'reputation' | 'qr'>('reports');

  // Reports State
  const [reports, setReports] = useState<EnrichedAdminReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EnrichedAdminReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modStatus, setModStatus] = useState<Report['status']>('pending');
  const [modNotes, setModNotes] = useState('');
  const [modAction, setModAction] = useState<Report['resolutionAction']>('none');
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Appeals State
  const [appeals, setAppeals] = useState<ReputationAppeal[]>([]);
  const [appealNotes, setAppealNotes] = useState<Record<string, string>>({});
  const [isUpdatingAppeal, setIsUpdatingAppeal] = useState(false);

  // Reputation Ledger Events State
  const [scoreEvents, setScoreEvents] = useState<any[]>([]);
  const [reverseReason, setReverseReason] = useState<Record<string, string>>({});
  const [isReversing, setIsReversing] = useState(false);

  // QR Tokens State
  const [qrTokens, setQrTokens] = useState<QRToken[]>([]);
  const [isRevoking, setIsRevoking] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [deskMessage, setDeskMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, appRes, evRes, qrRes] = await Promise.all([
          fetch('/api/admin/reports'),
          fetch('/api/admin/appeals'),
          fetch('/api/admin/reputation/events'),
          fetch('/api/admin/qr'),
        ]);

        if (repRes.status === 401 || repRes.status === 403) {
          router.push('/carriage');
          return;
        }

        const repData = await repRes.json();
        const appData = await appRes.json();
        const evData = await evRes.json();
        const qrData = await qrRes.json();

        if (repData.reports) {
          setReports(repData.reports);
          if (repData.reports.length > 0) {
            selectReport(repData.reports[0]);
          }
        }
        if (appData.appeals) setAppeals(appData.appeals);
        if (evData.events) setScoreEvents(evData.events);
        if (qrData.tokens) setQrTokens(qrData.tokens);
      } catch (err) {
        console.error('Failed to load admin desk', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const selectReport = (r: EnrichedAdminReport) => {
    setSelectedReport(r);
    setModStatus(r.status);
    setModNotes(r.notes || '');
    setModAction(r.resolutionAction || 'none');
    setReportSuccess(false);
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsUpdatingReport(true);
    setReportSuccess(false);

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: modStatus,
          notes: modNotes,
          resolutionAction: modAction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReports(prev =>
        prev.map(r => (r.id === selectedReport.id ? { ...r, ...data.report } : r))
      );
      setSelectedReport(prev => (prev ? { ...prev, ...data.report } : null));
      setReportSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update report');
    } finally {
      setIsUpdatingReport(false);
    }
  };

  const handleDecideAppeal = async (appealId: string, decision: 'approved' | 'rejected') => {
    setIsUpdatingAppeal(true);
    const notes = appealNotes[appealId] || '';
    try {
      const res = await fetch(`/api/admin/appeals/${appealId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppeals(prev => prev.map(a => a.id === appealId ? { ...a, status: decision, decisionNotes: notes } : a));
        setDeskMessage(`Appeal ${appealId} ${decision} successfully.`);
      } else {
        alert(data.error || 'Failed to decide appeal');
      }
    } catch (e) {
      alert('Network error deciding appeal');
    } finally {
      setIsUpdatingAppeal(false);
    }
  };

  const handleReverseScoreEvent = async (eventId: string) => {
    const reason = reverseReason[eventId];
    if (!reason || !reason.trim()) {
      alert('Please provide an audit reason for reversing this score event.');
      return;
    }

    setIsReversing(true);
    try {
      const res = await fetch('/api/admin/reputation/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setScoreEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'reversed', reversalReason: reason.trim() } : e));
        setDeskMessage(`Score event ${eventId} successfully reversed. Target score reconciled to ${data.newScore}.`);
      } else {
        alert(data.error || 'Failed to reverse event');
      }
    } catch (e) {
      alert('Network error reversing event');
    } finally {
      setIsReversing(false);
    }
  };

  const handleRevokeQR = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this QR pass? Any traveler scanning it will be rejected.')) return;
    setIsRevoking(true);
    try {
      const res = await fetch('/api/admin/qr/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });
      if (res.ok) {
        setQrTokens(prev => prev.map(t => t.id === tokenId ? { ...t, isRevoked: true } : t));
        setDeskMessage(`QR Token ${tokenId} has been revoked.`);
      }
    } catch (e) {
      alert('Failed to revoke QR token');
    } finally {
      setIsRevoking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center flex-1 bg-[#090D16]">
        <div className="font-mono text-xs text-emerald-400 animate-pulse">
          AUTHENTICATING MODERATOR AUDIT DESK...
        </div>
      </div>
    );
  }

  const filteredReports = reports.filter(r => 
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  return (
    <div className="py-10 bg-[#090D16] bg-dark-grid-pattern text-slate-100 flex-1 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Safety & Moderation Audit Desk
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Audit reports, review restriction appeals, inspect score events, and manage QR passes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="sys-tag text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
              ROLE: MODERATOR / ADMIN
            </span>
          </div>
        </div>

        {deskMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center justify-between">
            <span>{deskMessage}</span>
            <button onClick={() => setDeskMessage('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-emerald-400 text-navy-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Passenger Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'appeals'
                ? 'bg-emerald-400 text-navy-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Appeals Desk ({appeals.filter(a => a.status === 'pending').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('reputation')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'reputation'
                ? 'bg-emerald-400 text-navy-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Reputation Ledger ({scoreEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'qr'
                ? 'bg-emerald-400 text-navy-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Passes ({qrTokens.length})</span>
          </button>
        </div>

        {/* TAB 1: PASSENGER REPORTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bento-dark-card p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">Queue Filter:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="p-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="all">All ({reports.length})</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredReports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectReport(r)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedReport?.id === r.id
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-sm'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold uppercase text-white truncate max-w-[140px]">
                        {r.category}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        r.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{r.reason}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bento-dark-card p-6">
              {selectedReport ? (
                <form onSubmit={handleUpdateReport} className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 block uppercase">Report #{selectedReport.id}</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">Category: {selectedReport.category}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Report Reason & Context:</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{selectedReport.reason}</p>
                    <div className="pt-2 text-[11px] font-mono text-slate-400 flex gap-4">
                      <span>Reporter: {selectedReport.reporterName}</span>
                      <span>Target: {selectedReport.reportedUserName || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={modStatus}
                        onChange={e => setModStatus(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Action</label>
                      <select
                        value={modAction}
                        onChange={e => setModAction(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      >
                        <option value="none">No Action (Informational)</option>
                        <option value="warning_issued">Issue Formal Warning</option>
                        <option value="account_suspended">Suspend Passenger Account</option>
                        <option value="content_removed">Remove Objectionable Content</option>
                        <option value="dismissed">Dismiss Report</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Moderator Audit Notes</label>
                    <textarea
                      rows={3}
                      value={modNotes}
                      onChange={e => setModNotes(e.target.value)}
                      placeholder="Add official audit findings and justification..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  {reportSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Report resolution saved to audit trail.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingReport}
                    className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-navy-950 font-bold font-mono text-xs uppercase"
                  >
                    {isUpdatingReport ? 'Saving...' : 'Save Resolution'}
                  </button>
                </form>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs font-mono">
                  Select a report from the queue to review details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: APPEALS DESK */}
        {activeTab === 'appeals' && (
          <div className="bento-dark-card p-6 space-y-6">
            <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Passenger Restriction Appeals</h3>
                <p className="text-xs text-slate-400 font-mono">Review contested feedback and lift restrictions if valid</p>
              </div>
              <span className="sys-tag text-[10px] bg-slate-900 text-slate-400">
                TOTAL: {appeals.length}
              </span>
            </div>

            {appeals.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono p-8 text-center">No passenger appeals submitted.</p>
            ) : (
              <div className="space-y-4">
                {appeals.map(appeal => (
                  <div key={appeal.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Passenger @{appeal.username}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          appeal.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          appeal.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          STATUS: {appeal.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(appeal.createdAt).toLocaleString()}</span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <strong>Passenger Explanation: </strong>{appeal.userExplanation}
                    </p>

                    {appeal.decisionNotes && (
                      <p className="text-xs text-slate-400 font-mono">Decision Notes: {appeal.decisionNotes}</p>
                    )}

                    {appeal.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800">
                        <input
                          type="text"
                          placeholder="Moderator decision notes..."
                          value={appealNotes[appeal.id] || ''}
                          onChange={e => setAppealNotes({ ...appealNotes, [appeal.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDecideAppeal(appeal.id, 'approved')}
                          disabled={isUpdatingAppeal}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-bold font-mono uppercase"
                        >
                          Approve & Lift
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecideAppeal(appeal.id, 'rejected')}
                          disabled={isUpdatingAppeal}
                          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono uppercase"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REPUTATION LEDGER & REVERSAL */}
        {activeTab === 'reputation' && (
          <div className="bento-dark-card p-6 space-y-6">
            <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Full Score Event Ledger</h3>
                <p className="text-xs text-slate-400 font-mono">Inspect voting patterns and reverse brigaded or false events</p>
              </div>
              <span className="sys-tag text-[10px] bg-slate-900 text-slate-400">
                ENTRIES: {scoreEvents.length}
              </span>
            </div>

            <div className="space-y-3">
              {scoreEvents.map(evt => (
                <div key={evt.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${evt.pointDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {evt.pointDelta > 0 ? `+${evt.pointDelta}` : evt.pointDelta} pts
                      </span>
                      <span className="text-white">From: @{evt.voterUsername}</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className="text-emerald-400 font-bold">To: @{evt.targetUsername}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] ${
                      evt.status === 'reversed' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {evt.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Reason: <strong>{evt.reasonCategory}</strong> • Journey ID: <span className="font-mono">{evt.journeyId}</span>
                  </p>

                  {evt.reversalReason && (
                    <p className="text-xs text-amber-400 font-mono">
                      Reversal Audit: {evt.reversalReason}
                    </p>
                  )}

                  {evt.status === 'active' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Reason for reversal (e.g. verified malicious brigading)..."
                        value={reverseReason[evt.id] || ''}
                        onChange={e => setReverseReason({ ...reverseReason, [evt.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleReverseScoreEvent(evt.id)}
                        disabled={isReversing}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reverse Event</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: QR TOKEN MANAGEMENT */}
        {activeTab === 'qr' && (
          <div className="bento-dark-card p-6 space-y-6">
            <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Active QR Pass Tokens</h3>
                <p className="text-xs text-slate-400 font-mono">Inspect coach stickers, pass usage, and revoke invalid tokens</p>
              </div>
              <span className="sys-tag text-[10px] bg-slate-900 text-slate-400">
                ACTIVE PASSES: {qrTokens.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qrTokens.map(token => (
                <div key={token.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{token.label}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      token.isRevoked ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {token.isRevoked ? 'REVOKED' : 'VALID'}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-emerald-400">Token: {token.token}</p>
                  
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                    <span>Used: {token.usedCount} / {token.maxUses || 'Unlimited'}</span>
                    <span>Expires: {new Date(token.expiresAt).toLocaleDateString()}</span>
                  </div>

                  {!token.isRevoked && (
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRevokeQR(token.id)}
                        disabled={isRevoking}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase"
                      >
                        Revoke Pass
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
