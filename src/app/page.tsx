'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Train, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Compass, 
  Award, 
  ChevronDown, 
  Phone, 
  Lock, 
  QrCode, 
  Flame, 
  Scale, 
  Zap, 
  Check, 
  X as CloseIcon, 
  ShieldAlert, 
  BookOpen, 
  Gamepad2,
  Clock,
  Send,
  EyeOff
} from 'lucide-react';
import { TrainJourneyAnimation } from '@/components/layout/TrainJourneyAnimation';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTabDiscovery, setActiveTabDiscovery] = useState<'tech' | 'books' | 'gaming'>('tech');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080c14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ======================================================== */}
      {/* 1. IMMERSIVE HERO SECTION                                */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-32 bg-maker-grid border-b border-slate-800">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-indigo-500/15 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Mission Monospace Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-8 backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>[ 01 // VIBE — AI FOR HUMANITY ]</span>
            </div>

            {/* Master Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white mb-6">
              Your journey.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                More than just a destination.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-xl text-slate-300 mb-10 leading-relaxed font-normal max-w-2xl mx-auto">
              Meet people who share your curiosity. Play something together. Learn something unexpected. Make the journey feel shorter.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/board"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm tracking-wide hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Train className="w-4 h-4" />
                <span>Board Your Train</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 font-bold text-sm hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>See how it works</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Live Train Horizon Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ACTIVE ON 1,400+ INDIAN RAILWAY CORRIDORS</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">ZERO PNR STORED</span>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SIGNATURE SCROLL-DEPENDENT TRAIN ANIMATION            */}
      {/* ======================================================== */}
      <section className="relative z-20">
        <TrainJourneyAnimation />
      </section>

      {/* ======================================================== */}
      {/* 3. MEET PEOPLE WITH SHARED INTERESTS (DISCOVERY)         */}
      {/* ======================================================== */}
      <section id="ai-matching-section" className="py-24 bg-paper-theme border-b border-slate-300/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="sys-tag bg-emerald-600/10 text-emerald-800 border border-emerald-600/30 mb-3">
                [ 02 // DISCOVERY MATRIX ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Curiosity over small talk.{' '}
                <br className="hidden sm:inline" />
                Find travelers on your wavelength.
              </h2>
            </div>
            <p className="text-slate-600 max-w-md text-sm sm:text-base leading-relaxed">
              VIBE pairs passengers by mutual interests, coding stacks, languages, or travel books—without revealing private berths or telephone numbers.
            </p>
          </div>

          {/* Discovery Filter Chips */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTabDiscovery('tech')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeTabDiscovery === 'tech'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
              }`}
            >
              TECH & BUILDERS
            </button>
            <button
              onClick={() => setActiveTabDiscovery('books')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeTabDiscovery === 'books'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
              }`}
            >
              BOOKS & CREATIVE WRITING
            </button>
            <button
              onClick={() => setActiveTabDiscovery('gaming')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeTabDiscovery === 'gaming'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
              }`}
            >
              CHESS & ARCADE GAMERS
            </button>
          </div>

          {/* Passenger Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Passenger Card 1 */}
            <div className="bento-paper-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 font-mono font-black text-base flex items-center justify-center border border-slate-800">
                    AK
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    SCORE 104 • 96% MATCH
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-lg">@aarav_rustacean</div>
                <div className="text-xs text-slate-500 mb-3">Onboard 12951 Mumbai Rajdhani</div>
                
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  "Building local-first distributed systems and learning Hindi poetry. Always down for railway tea discussions."
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-mono text-slate-400">SHARED TOPICS:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Rust</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Distributed DBs</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Chess</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold">Wants to teach: Concurrency</span>
                <Link href="/board" className="text-xs font-bold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1">
                  Connect <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Passenger Card 2 */}
            <div className="bento-paper-card p-6 flex flex-col justify-between border-emerald-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-mono font-black text-base flex items-center justify-center">
                    PR
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    SCORE 106 • 93% MATCH
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-lg">@priya_ux</div>
                <div className="text-xs text-slate-500 mb-3">Onboard 12002 Bhopal Shatabdi</div>
                
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  "Product designer exploring Indian typography and accessibility in public transport apps."
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-mono text-slate-400">SHARED TOPICS:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Design Systems</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">UI Accessibility</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Station Tea</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold">Wants to learn: Python CLI</span>
                <Link href="/board" className="text-xs font-bold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1">
                  Connect <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Passenger Card 3 */}
            <div className="bento-paper-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-cyan-300 font-mono font-black text-base flex items-center justify-center">
                    VK
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    SCORE 100 • 89% MATCH
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-lg">@vikram_reads</div>
                <div className="text-xs text-slate-500 mb-3">Onboard 22691 Bengaluru Rajdhani</div>
                
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  "Reading historical fiction and looking for a sparring partner in Word Chain and Station Antakshari."
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-mono text-slate-400">SHARED TOPICS:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Historical Fiction</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Word Games</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">Kannada</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold">Inviting: Trivia Duel</span>
                <Link href="/board" className="text-xs font-bold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1">
                  Connect <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FIND YOUR JOURNEY COMMUNITY (COHORTS)                 */}
      {/* ======================================================== */}
      <section className="py-24 bg-ink-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sys-tag bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
              [ 03 // PASSENGER CLUSTERS ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              One train. Multiple journeys.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Join focused communities traveling on your exact route without noisy spam or broadcast chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bento-dark-card p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Tech & Startups Lounge</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Founders, indie makers, engineers, and designers sharing architecture ideas over chai.
              </p>
              <div className="text-[11px] font-mono text-emerald-400">18 ACTIVE PASSENGERS</div>
            </div>

            <div className="bento-dark-card p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Books & Long-form Reads</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Passengers exchanging book chapters, essays, Kindle highlights, and storytelling craft.
              </p>
              <div className="text-[11px] font-mono text-indigo-400">12 ACTIVE PASSENGERS</div>
            </div>

            <div className="bento-dark-card p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Chess & Tactical Games</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Pass-and-play chess challenges, rail trivia tournaments, and Word Chain duels.
              </p>
              <div className="text-[11px] font-mono text-amber-400">24 ACTIVE PASSENGERS</div>
            </div>

            <div className="bento-dark-card p-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Solo Traveler Safe Haven</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Voluntary group check-ins, station arrival mutual alerts, and verified peer support.
              </p>
              <div className="text-[11px] font-mono text-rose-400">31 ACTIVE PASSENGERS</div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PLAY TOGETHER (MULTIPLAYER TRAVEL GAMES)              */}
      {/* ======================================================== */}
      <section id="multiplayer-games-section" className="py-24 bg-paper-theme border-b border-slate-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="sys-tag bg-amber-600/10 text-amber-800 border border-amber-600/30 mb-3">
                [ 04 // TRANSIT ARCADE ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Play together.{' '}
                <br className="hidden sm:inline" />
                Shorten long stretches between stations.
              </h2>
            </div>
            <div>
              <Link href="/play" className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs tracking-wide hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>Launch Full Arcade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Game Preview 1: Trivia */}
            <div className="bento-paper-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-700 font-bold mb-3">
                  <Zap className="w-4 h-4" />
                  <span>TRIVIA BLITZ DUEL</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Train Trivia Blitz</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  15-second rapid duels testing your knowledge of Indian railway engineering records, heritage lines, and iconic bridges.
                </p>
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-mono">
                  Sample: "Which bridge stands 35m higher than the Eiffel Tower?"
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">2-PLAYER OR SOLO</span>
                <Link href="/play" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
                  Play Duel →
                </Link>
              </div>
            </div>

            {/* Game Preview 2: Station Antakshari */}
            <div className="bento-paper-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-3">
                  <Train className="w-4 h-4" />
                  <span>WORD CHAIN</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Station Antakshari</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  The quintessential Indian train game. Chain station names by their final letter against an AI bot or seatmate!
                </p>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 font-mono">
                  DELHI → HOWRAH → HARIDWAR → RATLAM → MUMBAI
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">100+ VERIFIED JUNCTIONS</span>
                <Link href="/play" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
                  Start Chain →
                </Link>
              </div>
            </div>

            {/* Game Preview 3: Tactical Grid */}
            <div className="bento-paper-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 font-bold mb-3">
                  <Gamepad2 className="w-4 h-4" />
                  <span>TACTICAL GRID</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tactical Rail Grid</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Fast-paced 3x3 track connection game. Route your express trains before the Loco Bot blocks your junction switches.
                </p>
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 font-mono">
                  Board: 🚅 vs 🚃 • Instant rematches & streak tally
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">PASS-AND-PLAY</span>
                <Link href="/play" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
                  Play Grid →
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. HOW QR JOINING WORKS (10-SECOND ONBOARDING)           */}
      {/* ======================================================== */}
      <section id="qr-onboarding-section" className="py-24 bg-ink-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
              [ 05 // INSTANT ACCESS ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Scan. Pick a username. Board.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              No app store downloads, zero PNR uploads, no government IDs required. Up and running in 10 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bento-dark-card p-8 relative overflow-hidden">
              <span className="text-6xl font-black font-mono text-slate-800/60 absolute top-4 right-6">01</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Scan Coach QR Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan the voluntary QR token on your train door or coach bulletin, or tap in via web browser directly.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                Opaque Token Verification
              </div>
            </div>

            {/* Step 2 */}
            <div className="bento-dark-card p-8 relative overflow-hidden">
              <span className="text-6xl font-black font-mono text-slate-800/60 absolute top-4 right-6">02</span>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Select Your @Username</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick any unique handle. Change it whenever you want—your internal reputation score and history remain safely linked.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400">
                Mutable Handle • Immutable ID
              </div>
            </div>

            {/* Step 3 */}
            <div className="bento-dark-card p-8 relative overflow-hidden">
              <span className="text-6xl font-black font-mono text-slate-800/60 absolute top-4 right-6">03</span>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect & Play</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Start discovering travelers on your train, join interest rooms, or invite nearby passengers to a quick game.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-indigo-400">
                100 Base Reputation Granted
              </div>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link
              href="/board"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Camera & Join Now</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. TRUST, PRIVACY & OFFICIAL ASSISTANCE                  */}
      {/* ======================================================== */}
      <section id="safety-trust-section" className="py-24 bg-paper-theme border-b border-slate-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="sys-tag bg-rose-600/10 text-rose-800 border border-rose-600/30 mb-3">
                [ 06 // TRUST & PROTECTION ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Designed for safety.{' '}
                <br className="hidden sm:inline" />
                Rooted in transparency.
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-rose-100/80 border border-rose-300 text-rose-950 max-w-md">
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <Phone className="w-4 h-4 text-rose-700" />
                <span>OFFICIAL INTEGRATED HELPLINES</span>
              </div>
              <div className="text-xs leading-relaxed">
                RailMadad <strong>139</strong> • Emergency <strong>112</strong> • Women Helpline <strong>1091</strong>. VIBE connects travelers, but never replaces railway security.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bento-paper-card p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Zero Tracking of Berths</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never ask for or store seat or berth numbers, exact live GPS, or Aadhaar identity data. Your real-world privacy is protected.
              </p>
            </div>

            <div className="bento-paper-card p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center mb-4">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Symmetric Two-Way Block</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you block someone, you immediately vanish from their view and they vanish from yours. No alerts or confrontations.
              </p>
            </div>

            <div className="bento-paper-card p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-rose-400 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Anti-Brigading Peer Scores</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Positive votes are capped to 3 distinct peers per journey to eliminate fake inflation, while negative feedback triggers human review.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. VIBE VS. GENERAL MESSAGING APPS (COMPARISON MATRIX)   */}
      {/* ======================================================== */}
      <section className="py-24 bg-ink-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
              [ 07 // COMPARISON MATRIX ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Why VIBE is different.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              How VIBE compares to WhatsApp, Telegram, or generic social media while traveling.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase">
                  <th className="py-4 px-4 font-bold">Feature</th>
                  <th className="py-4 px-4 font-bold text-emerald-400">VIBE (AI for Humanity)</th>
                  <th className="py-4 px-4 font-bold text-slate-400">WhatsApp / Telegram</th>
                  <th className="py-4 px-4 font-bold text-slate-400">Railway Portal (IRCTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr>
                  <td className="py-4 px-4 font-bold text-white">Stranger Privacy</td>
                  <td className="py-4 px-4 text-emerald-400 font-medium">✓ Zero phone number sharing</td>
                  <td className="py-4 px-4 text-slate-400">✗ Exposes phone number</td>
                  <td className="py-4 px-4 text-slate-400">N/A (No social features)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white">Journey Scoping</td>
                  <td className="py-4 px-4 text-emerald-400 font-medium">✓ Auto-closes when train arrives</td>
                  <td className="py-4 px-4 text-slate-400">✗ Lifelong persistent groups</td>
                  <td className="py-4 px-4 text-slate-400">N/A</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white">Seat & Berth Privacy</td>
                  <td className="py-4 px-4 text-emerald-400 font-medium">✓ Never asks or reveals berth</td>
                  <td className="py-4 px-4 text-slate-400">Uncontrolled in chats</td>
                  <td className="py-4 px-4 text-slate-400">Prints on chart</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white">Multiplayer Games</td>
                  <td className="py-4 px-4 text-emerald-400 font-medium">✓ Real-time rail trivia & word chains</td>
                  <td className="py-4 px-4 text-slate-400">✗ None built-in</td>
                  <td className="py-4 px-4 text-slate-400">✗ None</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white">Emergency Integration</td>
                  <td className="py-4 px-4 text-emerald-400 font-medium">✓ 1-click RailMadad 139 & 112</td>
                  <td className="py-4 px-4 text-slate-400">✗ Manual dialing required</td>
                  <td className="py-4 px-4 text-slate-400">✓ Ticket complaint form</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS                            */}
      {/* ======================================================== */}
      <section className="py-24 bg-paper-theme border-b border-slate-300/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="sys-tag bg-slate-900/10 text-slate-800 border border-slate-900/20 mb-3">
              [ 08 // TRANSPARENCY FAQ ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            
            <div className="bento-paper-card p-6">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full flex justify-between items-center text-left font-bold text-slate-900 text-base"
              >
                <span>Does VIBE have access to Indian Railways official booking or PNR databases?</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                  No. VIBE is an independent, community-driven social engagement platform. It operates voluntarily without access to railway reservation systems, CRIS databases, or ticketing systems.
                </p>
              )}
            </div>

            <div className="bento-paper-card p-6">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full flex justify-between items-center text-left font-bold text-slate-900 text-base"
              >
                <span>What happens if someone misbehaves on the train?</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                  Any passenger can immediately report or block another user with one tap. If an account's score drops below 90, their interaction capabilities are instantly restricted. For any real-world physical safety concern, passengers should immediately dial <strong>139</strong> (RailMadad) or <strong>112</strong> (National Emergency).
                </p>
              )}
            </div>

            <div className="bento-paper-card p-6">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full flex justify-between items-center text-left font-bold text-slate-900 text-base"
              >
                <span>Can I change my @username later without losing my reputation score?</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === 3 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 3 && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                  Yes! Your @username is completely mutable. Your internal reputation ledger is tied to an immutable user ID, preserving all your verified peer points and badges even after updating your handle.
                </p>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. FINAL CALL TO ACTION (CTA)                           */}
      {/* ======================================================== */}
      <section id="final-cta-section" className="py-24 bg-ink-900 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/40">
            <Train className="w-8 h-8" />
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Ready to make your next train journey memorable?
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of curious passengers connecting across India's vibrant railway network. Install-free, privacy-preserving, and built for humanity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/board"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm tracking-wide hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Board With Coach QR Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-sm hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
            </Link>
          </div>

          <div className="mt-12 text-xs font-mono text-slate-500">
            VIBE // EMPOWERING HUMAN CONNECTION ON THE TRACKS
          </div>

        </div>
      </section>

    </div>
  );
}
