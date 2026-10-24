'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Train, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(demoEmail.includes('admin') ? '/admin' : '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 flex-1 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Train className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Welcome back to VIBE
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to check your passenger connections and communities
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 font-bold"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Accounts for Seamless Evaluation */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Quick Demo Accounts (1-Click)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('aarav@example.com', 'password123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-colors"
              >
                <span className="font-bold text-navy-900 block truncate">Aarav (Tech)</span>
                <span className="text-[10px] text-slate-500">Mumbai Rajdhani</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('priya@example.com', 'password123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-colors"
              >
                <span className="font-bold text-navy-900 block truncate">Priya (Data/Lang)</span>
                <span className="text-[10px] text-slate-500">Mumbai Rajdhani</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('rohan@example.com', 'password123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-colors"
              >
                <span className="font-bold text-navy-900 block truncate">Rohan (UPSC)</span>
                <span className="text-[10px] text-slate-500">Civil Services</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@vibe.app', 'admin12345')}
                className="p-2 text-left rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-colors"
              >
                <span className="font-bold text-amber-900 block truncate">Safety Moderator</span>
                <span className="text-[10px] text-amber-700">Admin Desk</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          New to VIBE?{' '}
          <Link href="/signup" className="font-bold text-brand-600 hover:text-brand-700 underline">
            Create a passenger account
          </Link>
        </p>
      </div>
    </div>
  );
}
