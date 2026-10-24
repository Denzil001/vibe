'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Train, 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  Users,
  Gamepad2,
  MessageSquare,
  Phone,
  Send,
  HelpCircle,
  Share2,
  Lock,
  Plus
} from 'lucide-react';
import { Journey, SafeUser } from '@/types';
import { Button } from '@/components/common/Button';

const POPULAR_TRAINS = [
  { number: '12951', name: 'Mumbai Rajdhani Express', route: 'MMCT - NDLS' },
  { number: '12002', name: 'Bhopal Shatabdi Express', route: 'NDLS - RKMP' },
  { number: '22691', name: 'KSR Bengaluru Rajdhani Express', route: 'SBC - NZM' },
  { number: '12259', name: 'Sealdah Bikaner Duronto Express', route: 'SDAH - BKN' },
  { number: '22436', name: 'Varanasi Vande Bharat Express', route: 'NDLS - BSB' },
  { number: '12626', name: 'Kerala Express', route: 'NDLS - TVC' },
];

const SAMPLE_CO_PASSENGERS = [
  {
    id: 'pass_1',
    name: 'Aarav Sharma',
    username: 'aarav_rustacean',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    reputation: 104,
    interests: ['Rust', 'Distributed DBs', 'Chess'],
    bio: 'Traveling to Delhi for hackathon. Down for chess or system design talk.'
  },
  {
    id: 'pass_2',
    name: 'Priyanshu Verma',
    username: 'priya_ux',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    reputation: 106,
    interests: ['Design Systems', 'Typography', 'Station Tea'],
    bio: 'Product designer reading about rail architecture across India.'
  },
  {
    id: 'pass_3',
    name: 'Vikram Menon',
    username: 'vikram_reads',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    reputation: 100,
    interests: ['Historical Fiction', 'Word Games', 'Kannada'],
    bio: 'Carrying 3 books and looking for Station Antakshari competitors.'
  }
];

export default function JourneyPage() {
  const router = useRouter();
  const [existingJourney, setExistingJourney] = useState<Journey | null>(null);
  const [trainNumber, setTrainNumber] = useState('');
  const [trainName, setTrainName] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [boardingStation, setBoardingStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const [conversationGoals, setConversationGoals] = useState<string[]>(['Tech & Coding', 'Skill Sharing']);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lounge Messages
  const [loungeMessages, setLoungeMessages] = useState<Array<{ sender: string; text: string; time: string; isPrompt?: boolean }>>([
    { sender: 'System Icebreaker', text: '“What was the most scenic or memorable train journey you have ever taken in India?”', time: '10:00 AM', isPrompt: true },
    { sender: '@aarav_rustacean', text: 'Konkan railway during monsoon! The Dudhsagar falls crossing was unreal.', time: '10:14 AM' },
    { sender: '@priya_ux', text: 'Second that! Also the tea at Ratlam junction is an absolute must-try.', time: '10:18 AM' }
  ]);
  const [newLoungeMsg, setNewLoungeMsg] = useState('');

  useEffect(() => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setTravelDate(tomorrow);

    fetch('/api/journey')
      .then(res => res.json())
      .then(data => {
        if (data.journey) {
          const j = data.journey;
          setExistingJourney(j);
          setTrainNumber(j.trainNumber);
          setTrainName(j.trainName);
          setTravelDate(j.travelDate);
          setBoardingStation(j.boardingStation);
          setDestinationStation(j.destinationStation);
          setDurationHours(j.durationHours ? String(j.durationHours) : '');
          setDiscoveryEnabled(j.discoveryEnabled);
          setConversationGoals(j.conversationGoals || []);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectPopularTrain = (t: typeof POPULAR_TRAINS[0]) => {
    setTrainNumber(t.number);
    setTrainName(t.name);
    const [from, to] = t.route.split(' - ');
    if (from && to) {
      setBoardingStation(from);
      setDestinationStation(to);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainNumber,
          trainName,
          travelDate,
          boardingStation,
          destinationStation,
          durationHours: durationHours ? parseFloat(durationHours) : undefined,
          discoveryEnabled,
          conversationGoals,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExistingJourney(data.journey);
      setIsEditing(false);
      setStatusMsg({ type: 'success', text: 'Journey room updated successfully!' });
      router.refresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save journey.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndJourney = async () => {
    if (!confirm('Are you sure you want to leave this journey room? You can board again anytime.')) {
      return;
    }

    try {
      const res = await fetch('/api/journey', { method: 'DELETE' });
      if (res.ok) {
        setExistingJourney(null);
        setTrainNumber('');
        setTrainName('');
        setBoardingStation('');
        setDestinationStation('');
        setIsEditing(false);
        setStatusMsg({ type: 'success', text: 'You have left the journey room.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendLoungeMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoungeMsg.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLoungeMessages(prev => [...prev, { sender: 'You', text: newLoungeMsg.trim(), time: now }]);
    setNewLoungeMsg('');
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center flex-1 bg-ink-900 text-slate-100 min-h-screen">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 animate-pulse">
          <Train className="w-4 h-4 animate-bounce" />
          <span>CONNECTING TO JOURNEY ROOM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-ink-900 bg-maker-grid text-slate-100 flex-1 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Status message banner */}
        {statusMsg && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-mono border flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                : 'bg-rose-950/60 text-rose-300 border-rose-500/50'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 1: ACTIVE JOURNEY ROOM                              */}
        {/* ======================================================== */}
        {existingJourney && !isEditing ? (
          <div className="space-y-8">
            
            {/* Journey Header Card */}
            <div className="bento-dark-card p-6 sm:p-8 border-emerald-500/40 bg-gradient-to-r from-slate-950 via-[#0d1629] to-slate-950 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="sys-tag bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE JOURNEY ROOM
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Train Cohort</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 transition-colors"
                  >
                    Edit Route
                  </button>

                  <button
                    onClick={handleEndJourney}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-mono text-xs font-bold border border-rose-700/50 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Leave Journey</span>
                  </button>
                </div>
              </div>

              {/* Train Route Telemetry */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                <div>
                  <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Train className="w-8 h-8 text-emerald-400" />
                    <span>{existingJourney.trainName}</span>
                    <span className="text-lg font-mono text-emerald-400 font-bold">[{existingJourney.trainNumber}]</span>
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 mt-2.5">
                    <span className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <strong className="text-white">{existingJourney.boardingStation}</strong> &rarr; <strong className="text-white">{existingJourney.destinationStation}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {existingJourney.travelDate}
                    </span>
                  </div>
                </div>

                {existingJourney.conversationGoals && existingJourney.conversationGoals.length > 0 && (
                  <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 max-w-xs">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      Travel Focus
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {existingJourney.conversationGoals.map((g, i) => (
                        <span key={i} className="text-xs bg-slate-900 text-slate-200 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Crucial Unverified Journey Label */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400 font-mono">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Unverified Self-Reported Context:</strong> This space is voluntary and based on passenger-submitted travel dates. It is not connected to IRCTC reservation databases or live coach passenger manifests. Exact berth numbers are never collected.
                </span>
              </div>
            </div>

            {/* 2-Column: Joined Members & Journey Lounge Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Joined Members on This Train */}
              <div className="bento-dark-card p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Travelers in Room (3)
                    </h2>
                  </div>
                  <Link href="/discover" className="text-xs font-mono text-emerald-400 hover:underline">
                    Match Feed &rarr;
                  </Link>
                </div>

                <div className="space-y-4">
                  {SAMPLE_CO_PASSENGERS.map(passenger => (
                    <div key={passenger.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={passenger.avatar} alt={passenger.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                          <div>
                            <div className="text-xs font-bold text-white">{passenger.name}</div>
                            <div className="text-[10px] font-mono text-emerald-400">@{passenger.username}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {passenger.reputation} PTS
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {passenger.bio}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <div className="flex flex-wrap gap-1">
                          {passenger.interests.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                              {item}
                            </span>
                          ))}
                        </div>
                        <Link
                          href="/chat"
                          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors uppercase"
                        >
                          Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Multiplayer Arcade Widget */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Gamepad2 className="w-4 h-4 text-emerald-400" />
                    <span>Train Lounge Arcade</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Challenge joined passengers to rapid Railway Trivia or Station Antakshari.
                  </p>
                  <Link href="/play" className="block w-full">
                    <Button size="sm" className="w-full">
                      <span>Launch Games Lounge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column (2 cols): Group Conversation & Icebreaker Lounge */}
              <div className="lg:col-span-2 bento-dark-card p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Train {existingJourney.trainNumber} Passenger Lounge
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-closes upon arrival
                    </span>
                  </div>

                  {/* Lounge Feed */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {loungeMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                          msg.isPrompt
                            ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                            : msg.sender === 'You'
                            ? 'bg-emerald-950/30 border-emerald-500/30 ml-8 text-white'
                            : 'bg-slate-900 border-slate-800 mr-8 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-[11px] text-emerald-400">
                            {msg.sender}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{msg.time}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Send Message Input */}
                <form onSubmit={handleSendLoungeMsg} className="flex gap-2 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    value={newLoungeMsg}
                    onChange={e => setNewLoungeMsg(e.target.value)}
                    placeholder="Share an icebreaker or train thought with this coach cohort..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-sans focus:border-emerald-500"
                  />
                  <Button type="submit" size="sm">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </Button>
                </form>

              </div>

            </div>

          </div>
        ) : (
          /* ======================================================== */
          /* CASE 2: LOG NEW JOURNEY / EDIT ROUTE FORM                */
          /* ======================================================== */
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Train className="w-5 h-5 text-emerald-400" />
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {existingJourney ? 'Edit Journey Details' : 'Join a Train Journey Room'}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Log your train to connect with passengers on the same route and access the transit lounge.
                </p>
              </div>

              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Quick Train Presets */}
            <div className="bento-dark-card p-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Quick Select Common Trains
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {POPULAR_TRAINS.map(t => (
                  <button
                    key={t.number}
                    type="button"
                    onClick={() => handleSelectPopularTrain(t)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      trainNumber === t.number
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold truncate">{t.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{t.number} • {t.route}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bento-dark-card p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Train Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainNumber}
                      onChange={e => setTrainNumber(e.target.value)}
                      placeholder="e.g. 12951"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Train Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={trainName}
                      onChange={e => setTrainName(e.target.value)}
                      placeholder="e.g. Mumbai Rajdhani Express"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Travel Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={travelDate}
                      onChange={e => setTravelDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Boarding Station *
                    </label>
                    <input
                      type="text"
                      required
                      value={boardingStation}
                      onChange={e => setBoardingStation(e.target.value)}
                      placeholder="e.g. MMCT"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Destination Station *
                    </label>
                    <input
                      type="text"
                      required
                      value={destinationStation}
                      onChange={e => setDestinationStation(e.target.value)}
                      placeholder="e.g. NDLS"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Enable Voluntary Discovery
                    </span>
                    <span className="text-xs text-slate-400">
                      Show your @username in the train cohort room so passengers with matching interests can connect
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={discoveryEnabled}
                    onChange={e => setDiscoveryEnabled(e.target.checked)}
                    className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                  />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full py-3">
                  <span>{existingJourney ? 'Save Route Changes' : 'Enter Journey Room'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
