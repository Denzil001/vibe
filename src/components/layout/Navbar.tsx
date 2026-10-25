'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Compass, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Menu, 
  X, 
  Train, 
  User as UserIcon, 
  LogOut, 
  Settings,
  ShieldAlert,
  QrCode,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { SafeUser } from '@/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = currentUser
    ? [
        { href: '/carriage', label: 'Carriage', icon: Compass },
        { href: '/discover', label: 'Discover', icon: Sparkles },
        { href: '/lounge', label: 'Lounge', icon: Users },
        { href: '/play', label: 'Play', icon: Award },
        { href: '/safety', label: 'Safety & 139', icon: ShieldCheck },
      ]
    : [
        { href: '/board', label: 'Board Train' },
        { href: '/play', label: 'Arcade & Games' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/safety', label: 'Safety & 139' },
        { href: '/about', label: 'About VIBE' },
      ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={currentUser ? '/carriage' : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Train className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  VIBE
                </span>
                <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  AI FOR HUMANITY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none hidden sm:block">
                Real people. Relevant connections.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = 'icon' in link ? link.icon : null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick QR Onboard Button */}
            <Link
              href="/board"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-sm"
              title="Scan or enter train join QR pass"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Board Train</span>
            </Link>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  aria-expanded={isProfileMenuOpen}
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-400/50"
                  />
                  <div className="flex flex-col text-left pr-2">
                    <span className="text-xs font-bold text-white leading-none">
                      @{currentUser.username || currentUser.displayName.split(' ')[0].toLowerCase()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1 mt-0.5">
                      <Flame className="w-2.5 h-2.5 text-emerald-400" />
                      {currentUser.reputationScore ?? 100} pts
                    </span>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">{currentUser.displayName}</p>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-emerald-400 mt-0.5">@{currentUser.username}</p>
                      
                      {currentUser.isRestricted && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-1.5 text-rose-400 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Temporary interaction restriction active</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Reputation Score:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currentUser.reputationScore ?? 100} / 100
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                      Profile & Username
                    </Link>
                    <Link
                      href="/journey"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <Train className="w-4 h-4 text-emerald-400" />
                      Train Journey Context
                    </Link>
                    <Link
                      href="/achievements"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <Award className="w-4 h-4 text-emerald-400" />
                      Reputation & Badges
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Privacy & Restrictions
                    </Link>

                    {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 font-medium transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Moderator Audit Desk
                      </Link>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs uppercase font-bold tracking-wider text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-xs uppercase font-bold tracking-wider text-navy-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg shadow-md shadow-emerald-500/20 transition-all font-mono"
                >
                  Join VIBE
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/board"
              className="p-2 rounded-lg bg-slate-800 text-emerald-400 border border-emerald-500/30"
              title="Board Train"
            >
              <QrCode className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B0F17] px-4 pt-3 pb-6 space-y-2 animate-in fade-in duration-200">
          {currentUser && (
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl mb-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{currentUser.displayName}</p>
                  <p className="text-xs font-mono text-emerald-400">@{currentUser.username}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                {currentUser.reputationScore ?? 100} pts
              </span>
            </div>
          )}

          {navLinks.map(link => {
            const Icon = 'icon' in link ? link.icon : null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/board"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Scan or Enter QR Pass
          </Link>

          {currentUser ? (
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
              >
                <UserIcon className="w-4 h-4 text-emerald-400" />
                Passenger Profile & Username
              </Link>
              <Link
                href="/journey"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
              >
                <Train className="w-4 h-4 text-emerald-400" />
                Train Journey Setup
              </Link>
              <Link
                href="/achievements"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                Reputation Score & History
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Privacy & Account Settings
              </Link>

              {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-amber-400 font-medium"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Moderator Desk
                </Link>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-rose-400 font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-mono uppercase font-bold text-slate-300 border border-slate-700 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-mono uppercase font-bold text-navy-950 bg-emerald-400 rounded-xl shadow-sm"
              >
                Join VIBE
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
