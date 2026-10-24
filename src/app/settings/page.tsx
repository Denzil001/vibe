'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Trash2, 
  ShieldCheck, 
  Bell, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { NoticeAlert } from '@/components/common/NoticeAlert';

export default function SettingsPage() {
  const router = useRouter();
  const [discoveryOptIn, setDiscoveryOptIn] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          setDiscoveryOptIn(data.user.discoveryOptIn !== undefined ? data.user.discoveryOptIn : true);
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdatePrivacy = async (optIn: boolean) => {
    setDiscoveryOptIn(optIn);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discoveryOptIn: optIn }),
      });
      if (res.ok) {
        setStatusMsg('Privacy preferences updated successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentAccountDeletion = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/profile/delete', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        alert('Failed to delete account');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Privacy & Account Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Control your discoverability, notifications, and exercise data erasure rights
          </p>
        </div>

        {statusMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Discovery & Privacy Toggle */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-brand-600" />
            Discovery & Visibility
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-navy-900 block text-xs sm:text-sm">
                Voluntary Passenger Discovery
              </span>
              <span className="text-xs text-slate-500">
                Turn off to immediately stop appearing in search suggestions for fellow passengers
              </span>
            </div>
            <input
              type="checkbox"
              checked={discoveryOptIn}
              onChange={e => handleUpdatePrivacy(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            Notifications
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-navy-900 block text-xs sm:text-sm">
                Direct Message Notifications
              </span>
              <span className="text-xs text-slate-500">
                Receive in-app alerts when matched passengers send connection invitations
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={e => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Permanent Account Deletion (Right to Erasure) */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            Permanent Account Deletion (GDPR / Digital Data Protection)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Deleting your account will permanently erase your profile, travel details, group memberships, and direct messaging records from our active servers. This action is irreversible.
          </p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete My Account & Personal Data
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-navy-900">Confirm Account Deletion</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To confirm permanent deletion of your profile, active journey data, and group memberships, please type <strong>DELETE</strong> below:
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handlePermanentAccountDeletion}
                  isLoading={isDeleting}
                  disabled={deleteConfirmationText !== 'DELETE'}
                >
                  Erase Everything
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
