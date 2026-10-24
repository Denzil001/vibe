'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Compass, MapPin, Sparkles, Shield, Trophy, ChevronRight } from 'lucide-react';

interface Station {
  id: string;
  code: string;
  name: string;
  km: number;
  progress: number; // 0 to 1
  tagline: string;
  targetId: string;
}

const STATIONS: Station[] = [
  {
    id: 'stn-01',
    code: 'ORG',
    name: 'Origin Terminal',
    km: 0,
    progress: 0.05,
    tagline: '10-Second QR Onboarding',
    targetId: 'qr-onboarding-section'
  },
  {
    id: 'stn-02',
    code: 'CUR',
    name: 'Curiosity Junction',
    km: 240,
    progress: 0.28,
    tagline: 'AI Interest & Skill Matching',
    targetId: 'ai-matching-section'
  },
  {
    id: 'stn-03',
    code: 'LNG',
    name: 'Transit Lounge',
    km: 560,
    progress: 0.52,
    tagline: 'Multiplayer Trivia & Word Games',
    targetId: 'multiplayer-games-section'
  },
  {
    id: 'stn-04',
    code: 'SAF',
    name: 'Signal Safe Zone',
    km: 890,
    progress: 0.76,
    tagline: 'RailMadad 139 & Privacy Guard',
    targetId: 'safety-trust-section'
  },
  {
    id: 'stn-05',
    code: 'DST',
    name: 'Destination Central',
    km: 1200,
    progress: 0.95,
    tagline: 'Real Human Connections',
    targetId: 'final-cta-section'
  }
];

export function TrainJourneyAnimation() {
  const [scrollProgress, setScrollProgress] = useState(0.08);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // Sync with actual page scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoPlaying) return;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = Math.min(Math.max(window.scrollY / totalScroll, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAutoPlaying]);

  // Update active station based on progress
  useEffect(() => {
    let closestIndex = 0;
    let minDiff = Infinity;
    STATIONS.forEach((stn, idx) => {
      const diff = Math.abs(stn.progress - scrollProgress);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActiveStationIndex(closestIndex);
  }, [scrollProgress]);

  // Auto-play demo loop
  useEffect(() => {
    if (!isAutoPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const speed = 0.0008; // smooth cruise rate

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      setScrollProgress(prev => {
        const next = prev + speed * (dt / 16.6);
        return next >= 1 ? 0.05 : next;
      });
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAutoPlaying]);

  // Jump to specific station
  const jumpToStation = (station: Station) => {
    setIsAutoPlaying(false);
    setScrollProgress(station.progress);
    const elem = document.getElementById(station.targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determine atmospheric lighting style based on progress
  // 0.0 - 0.25: Dawn/Golden
  // 0.25 - 0.50: Bright Daylight
  // 0.50 - 0.75: Sunset/Amber
  // 0.75 - 1.00: Twilight/Midnight Ink
  const getSkyGradient = () => {
    if (scrollProgress < 0.25) {
      return 'from-amber-950 via-slate-900 to-[#080c14]';
    } else if (scrollProgress < 0.5) {
      return 'from-cyan-950 via-slate-900 to-[#080c14]';
    } else if (scrollProgress < 0.75) {
      return 'from-purple-950 via-rose-950 to-[#080c14]';
    } else {
      return 'from-indigo-950 via-slate-950 to-[#080c14]';
    }
  };

  const currentStation = STATIONS[activeStationIndex];
  const trainTranslateX = Math.min(Math.max((scrollProgress * 100), 5), 92);

  return (
    <div className="relative w-full overflow-hidden bg-ink-900 border-y border-slate-800/80 select-none py-8 transition-colors duration-1000">
      {/* Background Dynamic Sky Atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getSkyGradient()} opacity-70 transition-all duration-1000`} />
      
      {/* Distant Mountain Silhouettes & Telegraph Poles */}
      <div className="absolute inset-x-0 bottom-12 h-28 pointer-events-none opacity-25">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-slate-700 fill-current">
          <path d="M0 100 Q 150 40 300 90 T 600 70 T 900 80 T 1200 60 L 1200 120 L 0 120 Z" />
          <path d="M0 110 Q 200 70 450 100 T 800 85 T 1200 95 L 1200 120 L 0 120 Z" opacity="0.5" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar: HUD & Station Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE JOURNEY TELEMETRY
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>WAYPOINT:</span>
              <strong className="text-white font-bold">{currentStation.name}</strong>
              <span className="text-slate-600">[{currentStation.code}]</span>
              <span className="text-emerald-400">+{currentStation.km} KM</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto Cruise Toggle */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors inline-flex items-center gap-1.5 border ${
                isAutoPlaying
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAutoPlaying ? 'PAUSE CRUISE' : 'AUTO CRUISE'}</span>
            </button>

            {/* Scroll/Scrub Slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.005"
                value={scrollProgress}
                onChange={(e) => {
                  setIsAutoPlaying(false);
                  setScrollProgress(parseFloat(e.target.value));
                }}
                className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                aria-label="Journey distance scrubber"
              />
              <span className="text-[11px] font-mono text-slate-400 w-9 text-right">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* The Animated Train Track Corridor */}
        <div className="relative h-28 sm:h-32 my-2 border-b-2 border-slate-700/80">
          
          {/* Station Milestone Markers on Track */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between items-end px-2 sm:px-6 pointer-events-none">
            {STATIONS.map((stn, idx) => {
              const isPassed = scrollProgress >= stn.progress;
              const isActive = activeStationIndex === idx;
              return (
                <button
                  key={stn.id}
                  onClick={() => jumpToStation(stn)}
                  className="pointer-events-auto group relative flex flex-col items-center -mb-2 transition-transform hover:scale-110"
                  style={{ left: `${stn.progress * 100}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border transition-colors whitespace-nowrap mb-1.5 ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md' 
                      : isPassed
                      ? 'bg-slate-800 text-emerald-400 border-slate-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {stn.code}
                  </div>
                  
                  {/* Station Light Pillar */}
                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    isActive
                      ? 'bg-emerald-400 border-white ring-4 ring-emerald-500/30'
                      : isPassed
                      ? 'bg-emerald-500/60 border-slate-800'
                      : 'bg-slate-700 border-slate-900'
                  }`} />
                  
                  {/* Track Marker Pin */}
                  <div className="w-0.5 h-3 bg-slate-600" />
                </button>
              );
            })}
          </div>

          {/* The High-Speed Express Train Composition */}
          <div 
            className="absolute bottom-1.5 transition-all duration-300 ease-out will-change-transform flex items-end gap-1"
            style={{ 
              left: `${trainTranslateX}%`, 
              transform: 'translateX(-95%)' 
            }}
          >
            {/* Coach 2 (Rear Sleeper/Passenger Car) */}
            <div className="hidden sm:block relative w-20 h-10 bg-slate-800 rounded-t border border-slate-600/60 shadow-lg">
              {/* Roof AC Unit */}
              <div className="absolute -top-1.5 left-2 right-2 h-1 bg-slate-700 rounded-t" />
              {/* Windows with warm passenger cabin light */}
              <div className="flex justify-around items-center h-full px-2">
                <div className="w-3.5 h-4 bg-amber-300/80 rounded-xs shadow-xs shadow-amber-300/50 flex items-center justify-center text-[7px] text-slate-900 font-bold">♟</div>
                <div className="w-3.5 h-4 bg-amber-300/80 rounded-xs shadow-xs shadow-amber-300/50 flex items-center justify-center text-[7px] text-slate-900 font-bold">💬</div>
                <div className="w-3.5 h-4 bg-amber-300/80 rounded-xs shadow-xs shadow-amber-300/50 flex items-center justify-center text-[7px] text-slate-900 font-bold">☕</div>
              </div>
              {/* Coach Stripe */}
              <div className="absolute bottom-1.5 inset-x-0 h-1 bg-emerald-500/80" />
              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-900" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-900" />
              </div>
            </div>

            {/* Coach 1 (Mid Lounge / Games Car) */}
            <div className="relative w-24 h-11 bg-slate-800 rounded-t border border-slate-600/70 shadow-lg">
              {/* Roof Details */}
              <div className="absolute -top-1.5 left-2 right-2 h-1 bg-slate-700 rounded-t" />
              {/* Windows with glowing green/lime creative lounge light */}
              <div className="flex justify-around items-center h-full px-2">
                <div className="w-4 h-4.5 bg-emerald-300/90 rounded-xs shadow-xs shadow-emerald-400/50 flex items-center justify-center text-[8px] text-slate-900 font-bold">⚡</div>
                <div className="w-4 h-4.5 bg-emerald-300/90 rounded-xs shadow-xs shadow-emerald-400/50 flex items-center justify-center text-[8px] text-slate-900 font-bold">🎮</div>
                <div className="w-4 h-4.5 bg-emerald-300/90 rounded-xs shadow-xs shadow-emerald-400/50 flex items-center justify-center text-[8px] text-slate-900 font-bold">💡</div>
              </div>
              {/* Coach Stripe */}
              <div className="absolute bottom-1.5 inset-x-0 h-1 bg-emerald-500" />
              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-900" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-900" />
              </div>
            </div>

            {/* Locomotive (VIBE Bullet / Electric Engine) */}
            <div className="relative w-28 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 rounded-tr-3xl rounded-tl border border-emerald-500/60 shadow-xl overflow-visible">
              {/* Pantograph */}
              <div className="absolute -top-3.5 left-4 w-4 h-3.5 border-t-2 border-l border-r border-slate-400" />
              
              {/* Aerodynamic Cockpit Windshield */}
              <div className="absolute top-2 right-2 w-9 h-5 bg-cyan-400/90 rounded-tr-xl rounded-bl-sm skew-x-6 border border-cyan-200 shadow-sm shadow-cyan-400/50 flex items-center justify-center">
                <span className="text-[7px] font-mono font-black text-slate-950">VIBE</span>
              </div>

              {/* Side Air Intake Vents */}
              <div className="absolute bottom-3 left-3 flex gap-1">
                <div className="w-1 h-3 bg-slate-600 rounded-full" />
                <div className="w-1 h-3 bg-slate-600 rounded-full" />
                <div className="w-1 h-3 bg-slate-600 rounded-full" />
              </div>

              {/* Engine Stripe */}
              <div className="absolute bottom-2 inset-x-0 h-1.5 bg-emerald-400" />

              {/* High-Beam Headlight & Ray of Light */}
              <div className="absolute bottom-2.5 -right-1 w-3 h-3 rounded-full bg-white ring-2 ring-emerald-400 shadow-md shadow-white">
                <div className="absolute top-1/2 left-full -translate-y-1/2 w-28 h-12 bg-gradient-to-r from-emerald-300/40 via-cyan-300/10 to-transparent pointer-events-none rounded-r-full blur-xs" />
              </div>

              {/* Bogie Wheels */}
              <div className="absolute -bottom-2 inset-x-2 flex justify-between">
                <div className="w-3 h-3 rounded-full bg-slate-400 border-2 border-slate-900" />
                <div className="w-3 h-3 rounded-full bg-slate-400 border-2 border-slate-900" />
              </div>
            </div>

          </div>

          {/* Railway Sleepers & Rail Ties */}
          <div className="absolute inset-x-0 bottom-0 h-1 flex justify-between overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="w-1 h-2 bg-slate-700 flex-shrink-0" />
            ))}
          </div>

        </div>

        {/* Station Navigation Quick Bar (Clickable Chapter Waypoints) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5">
          {STATIONS.map((stn, idx) => {
            const isActive = activeStationIndex === idx;
            return (
              <button
                key={stn.id}
                onClick={() => jumpToStation(stn)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm shadow-emerald-500/10 translate-y-[-1px]'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">{stn.code} // {stn.km} KM</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-emerald-400 animate-pulse" />}
                </div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {stn.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {stn.tagline}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
