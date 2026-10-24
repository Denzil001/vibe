import React from 'react';
import Link from 'next/link';
import { Train, Shield, Phone, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070A12] text-slate-400 border-t border-slate-800 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-navy-950 font-black shadow-md">
                <Train className="w-5 h-5 text-navy-950" />
              </div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                VIBE <span className="sys-tag text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AI FOR HUMANITY</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-4 leading-relaxed">
              Real people. Relevant connections. A better journey. Empowering train travellers to voluntarily discover shared interests, practice skills, and support one another safely.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-200">Independent Platform:</strong> VIBE is not affiliated with IRCTC or Indian Railways. We complement official channels with voluntary social discovery and learning.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-emerald-400 font-mono font-bold flex items-center gap-1.5 hover:underline">
                  <QrCode className="w-3.5 h-3.5" /> QR Pass Gateway
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About & Mission
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How Matching Works
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-emerald-400 transition-colors">
                  Activities & Trivia
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-emerald-400 transition-colors">
                  Business & Partnerships
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200 mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/safety" className="hover:text-emerald-400 transition-colors">
                  Safety & Community Rules
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy & Data Rights
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-emerald-400 transition-colors">
                  Official Help & Grievance
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Helplines */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Official Assistance
            </h4>
            <p className="text-xs text-slate-400 mb-2.5">
              In an emergency, contact government railway authorities immediately:
            </p>
            <div className="space-y-2 text-xs">
              <a 
                href="tel:139" 
                className="block bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors"
              >
                <span className="text-slate-400 block text-[11px]">RailMadad (Grievance & Security)</span>
                <span className="text-sm font-mono font-bold text-white tracking-wide">Dial 139</span>
              </a>
              <a 
                href="tel:112" 
                className="block bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors"
              >
                <span className="text-slate-400 block text-[11px]">All-India Emergency Service</span>
                <span className="text-sm font-mono font-bold text-white tracking-wide">Dial 112</span>
              </a>
              <a 
                href="tel:1091" 
                className="block bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors"
              >
                <span className="text-slate-400 block text-[11px]">Women Safety Helpline</span>
                <span className="text-sm font-mono font-bold text-white tracking-wide">Dial 1091</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="font-mono">
            &copy; {new Date().getFullYear()} VIBE // AI for Humanity. Engineered for purposeful, connected rail journeys.
          </p>
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <span>Human connection complements, not replaces, official safety response.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
