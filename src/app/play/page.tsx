'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  Trophy, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Share2, 
  Shuffle, 
  Bot, 
  User, 
  Send,
  Zap,
  Flame,
  Award,
  HelpCircle,
  Train
} from 'lucide-react';
import { 
  MULTIPLAYER_TRIVIA, 
  FAMOUS_STATIONS, 
  CURIOSITY_CARDS, 
  TriviaQuestion, 
  StationWord, 
  IcebreakerCard 
} from '@/lib/games-engine';
import { Button } from '@/components/common/Button';

type ActiveTab = 'trivia' | 'wordchain' | 'railgrid' | 'cards';

export default function PlayHubPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('trivia');

  // ==========================================
  // 1. TRAIN TRIVIA BLITZ STATE
  // ==========================================
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [triviaFinished, setTriviaFinished] = useState(false);
  const currentTrivia = MULTIPLAYER_TRIVIA[triviaIndex];

  // Trivia Countdown
  useEffect(() => {
    if (!isTimerActive || isAnswerSubmitted || triviaFinished) return;
    if (timeLeft <= 0) {
      handleTriviaSubmit(null);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive, isAnswerSubmitted, triviaFinished]);

  const handleTriviaSubmit = (optionIndex: number | null) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optionIndex);
    setIsAnswerSubmitted(true);
    setIsTimerActive(false);

    if (optionIndex === currentTrivia.correctIndex) {
      const bonus = timeLeft > 10 ? 15 : 10;
      setTriviaScore(prev => prev + bonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextTrivia = () => {
    if (triviaIndex < MULTIPLAYER_TRIVIA.length - 1) {
      setTriviaIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(15);
      setIsTimerActive(true);
    } else {
      setTriviaFinished(true);
    }
  };

  const resetTrivia = () => {
    setTriviaIndex(0);
    setTriviaScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setTimeLeft(15);
    setIsTimerActive(true);
    setTriviaFinished(false);
  };

  // ==========================================
  // 2. STATION WORD CHAIN (RAIL ANTAKSHARI)
  // ==========================================
  const [chainHistory, setChainHistory] = useState<{ sender: 'user' | 'bot'; station: StationWord }[]>([
    { sender: 'bot', station: { name: 'DELHI', code: 'NDLS', state: 'Delhi' } }
  ]);
  const [wordInput, setWordInput] = useState('');
  const [chainError, setChainError] = useState<string | null>(null);
  const [chainScore, setChainScore] = useState(10);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const lastStation = chainHistory[chainHistory.length - 1].station;
  const requiredLetter = lastStation.name[lastStation.name.length - 1].toUpperCase();

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChainError(null);
    const cleaned = wordInput.trim().toUpperCase();
    if (!cleaned) return;

    if (!cleaned.startsWith(requiredLetter)) {
      setChainError(`Station must start with "${requiredLetter}"! (Last letter of ${lastStation.name})`);
      return;
    }

    const alreadyUsed = chainHistory.some(c => c.station.name === cleaned);
    if (alreadyUsed) {
      setChainError(`"${cleaned}" has already been used in this journey!`);
      return;
    }

    const matchedStation = FAMOUS_STATIONS.find(s => s.name === cleaned);
    if (!matchedStation) {
      setChainError(`"${cleaned}" was not found in the verified station roster. Try famous junction hubs!`);
      return;
    }

    // Add user station
    const newHistory = [...chainHistory, { sender: 'user' as const, station: matchedStation }];
    setChainHistory(newHistory);
    setWordInput('');
    setChainScore(prev => prev + 20);

    // Bot response
    setIsBotTyping(true);
    setTimeout(() => {
      const nextLetter = cleaned[cleaned.length - 1].toUpperCase();
      const botPick = FAMOUS_STATIONS.find(
        s => s.name.startsWith(nextLetter) && !newHistory.some(h => h.station.name === s.name)
      );

      if (botPick) {
        setChainHistory(prev => [...prev, { sender: 'bot' as const, station: botPick }]);
      } else {
        setChainError(`Bot is out of stations starting with "${nextLetter}"! Passenger wins round! +50 Points.`);
        setChainScore(prev => prev + 50);
      }
      setIsBotTyping(false);
    }, 1200);
  };

  // ==========================================
  // 3. TACTICAL RAIL GRID (TIC-TAC-TOE)
  // ==========================================
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [railGridWinner, setRailGridWinner] = useState<string | null>(null);
  const [gridScore, setGridScore] = useState({ player: 0, bot: 0, draws: 0 });

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(sq => sq !== null)) return 'Draw';
    return null;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || railGridWinner || !isXNext) return;
    const newBoard = [...board];
    newBoard[idx] = '🚅'; // Player Train
    setBoard(newBoard);
    setIsXNext(false);

    const win = calculateWinner(newBoard);
    if (win) {
      finishGridRound(win);
      return;
    }

    // AI Move
    setTimeout(() => {
      const emptyIndices = newBoard
        .map((val, i) => (val === null ? i : null))
        .filter((val): val is number => val !== null);

      if (emptyIndices.length > 0) {
        const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        newBoard[randomIdx] = '🚃'; // Bot Carriage
        setBoard(newBoard);
        setIsXNext(true);

        const aiWin = calculateWinner(newBoard);
        if (aiWin) {
          finishGridRound(aiWin);
        }
      }
    }, 400);
  };

  const finishGridRound = (result: string) => {
    setRailGridWinner(result);
    if (result === '🚅') {
      setGridScore(prev => ({ ...prev, player: prev.player + 1 }));
    } else if (result === '🚃') {
      setGridScore(prev => ({ ...prev, bot: prev.bot + 1 }));
    } else {
      setGridScore(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  const resetGrid = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setRailGridWinner(null);
  };

  // ==========================================
  // 4. CURIOSITY CARD DECK
  // ==========================================
  const [cardIndex, setCardIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const currentCard = CURIOSITY_CARDS[cardIndex];

  const handleNextCard = () => {
    setCardIndex((cardIndex + 1) % CURIOSITY_CARDS.length);
    setCopiedPrompt(false);
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(`"${currentCard.prompt}"\n(${currentCard.followUp})`);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="sys-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Gamepad2 className="w-3.5 h-3.5" />
                TRANSIT ARCADE
              </span>
              <span className="text-xs font-mono text-slate-400">CO-OP & MULTIPLAYER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Play & Pass Time Together
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Turn long, dull hours into memorable shared moments. Challenge fellow passengers, play word chains, or break the ice.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">ARCADE POINTS</div>
              <div className="text-lg font-black text-white">{triviaScore + chainScore + (gridScore.player * 25)} PTS</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveTab('trivia')}
            className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'trivia'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Trivia Blitz</span>
          </button>

          <button
            onClick={() => setActiveTab('wordchain')}
            className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'wordchain'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Train className="w-4 h-4 text-emerald-400" />
            <span>Station Antakshari</span>
          </button>

          <button
            onClick={() => setActiveTab('railgrid')}
            className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'railgrid'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Tactical Rail Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'cards'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Curiosity Cards</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: TRAIN TRIVIA BLITZ                                */}
        {/* ======================================================== */}
        {activeTab === 'trivia' && (
          <div className="bento-dark-card p-6 sm:p-8 space-y-6">
            {!triviaFinished ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      ROUND {triviaIndex + 1} OF {MULTIPLAYER_TRIVIA.length}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                      CATEGORY: {currentTrivia.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {streak > 1 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-600/40 px-2 py-0.5 rounded-full">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{streak}X COMBO</span>
                      </div>
                    )}
                    
                    {/* Timer Pill */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      timeLeft <= 5 
                        ? 'bg-rose-950/60 text-rose-400 border-rose-600 animate-pulse' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeLeft}s</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {currentTrivia.question}
                  </h2>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentTrivia.options.map((opt, idx) => {
                      let btnStyle = 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700';
                      if (isAnswerSubmitted) {
                        if (idx === currentTrivia.correctIndex) {
                          btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                        } else if (idx === selectedAnswer) {
                          btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
                        } else {
                          btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-600';
                        }
                      }
                      return (
                        <button
                          key={idx}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleTriviaSubmit(idx)}
                          className={`p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="mt-0.5">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Drawer when submitted */}
                {isAnswerSubmitted && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      {selectedAnswer === currentTrivia.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">CORRECT! +{timeLeft > 10 ? '15' : '10'} POINTS</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-bold text-rose-400">
                            {selectedAnswer === null ? 'TIME EXPIRED!' : 'INCORRECT'}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentTrivia.explanation}
                    </p>
                    {currentTrivia.funFact && (
                      <div className="text-[11px] font-mono text-amber-300/90 pt-1">
                        💡 Did you know: {currentTrivia.funFact}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button onClick={handleNextTrivia} size="sm">
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">Trivia Blitz Complete!</h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  You earned <strong className="text-emerald-400">{triviaScore} points</strong> on railway lore and heritage.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Button onClick={resetTrivia} variant="secondary">
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </Button>
                  <Link href="/discover">
                    <Button>
                      <span>Challenge Passengers</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STATION ANTAKSHARI (WORD CHAIN)                   */}
        {/* ======================================================== */}
        {activeTab === 'wordchain' && (
          <div className="bento-dark-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Station Antakshari</h2>
                <p className="text-xs text-slate-400">
                  Name a railway station starting with the last letter of the previous station.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400">CHAIN SCORE</span>
                <div className="text-base font-black text-emerald-400">{chainScore} PTS</div>
              </div>
            </div>

            {/* Word History Stack */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {chainHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                    item.sender === 'user'
                      ? 'bg-emerald-950/30 border-emerald-500/40 ml-6 text-white'
                      : 'bg-slate-900 border-slate-800 mr-6 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.sender === 'user' ? (
                      <User className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="font-mono font-bold tracking-wider">{item.station.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">[{item.station.code}]</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.station.state}</span>
                </div>
              ))}
              {isBotTyping && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Bot is thinking of a station...</span>
                </div>
              )}
            </div>

            {/* Required Letter Callout */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Next station must start with:</span>
              <span className="text-xl font-black font-mono text-emerald-400 px-3 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                "{requiredLetter}"
              </span>
            </div>

            {chainError && (
              <div className="text-xs text-rose-400 font-mono bg-rose-950/40 border border-rose-700/50 p-2.5 rounded-lg">
                ⚠️ {chainError}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleWordSubmit} className="flex gap-2">
              <input
                type="text"
                value={wordInput}
                onChange={e => setWordInput(e.target.value)}
                placeholder={`Enter station name starting with "${requiredLetter}" (e.g. HOWRAH, HARIDWAR)...`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 uppercase font-mono focus:border-emerald-500"
              />
              <Button type="submit" disabled={isBotTyping}>
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </Button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TACTICAL RAIL GRID                                */}
        {/* ======================================================== */}
        {activeTab === 'railgrid' && (
          <div className="bento-dark-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Tactical Rail Grid</h2>
                <p className="text-xs text-slate-400">
                  Connect 3 railway tracks in a row before the Loco Bot blocks your junction!
                </p>
              </div>

              {/* Tally */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-400">PASSENGER: {gridScore.player}</span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-400">BOT: {gridScore.bot}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">DRAWS: {gridScore.draws}</span>
              </div>
            </div>

            {/* 3x3 Grid */}
            <div className="max-w-xs mx-auto grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              {board.map((cell, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 flex items-center justify-center text-3xl sm:text-4xl transition-all shadow-inner"
                >
                  {cell}
                </button>
              ))}
            </div>

            {/* Round Result Alert */}
            {railGridWinner && (
              <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-base font-bold text-white">
                  {railGridWinner === '🚅' && '🎉 Victory! Passenger routed the track cleanly.'}
                  {railGridWinner === '🚃' && '🤖 Bot blocked the junction! Rematch?'}
                  {railGridWinner === 'Draw' && '🤝 Evenly matched deadlock!'}
                </div>
                <Button onClick={resetGrid} size="sm">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Rematch</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CURIOSITY CARDS                                   */}
        {/* ======================================================== */}
        {activeTab === 'cards' && (
          <div className="bento-dark-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Curiosity Icebreaker Cards</h2>
                <p className="text-xs text-slate-400">
                  Thoughtful questions to spark engaging, respectful conversations.
                </p>
              </div>
              <span className="sys-tag bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                CARD {cardIndex + 1} OF {CURIOSITY_CARDS.length}
              </span>
            </div>

            {/* The Interactive Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-xl space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                TOPIC: {currentCard.category}
              </span>
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                "{currentCard.prompt}"
              </p>
              <div className="pt-2 text-xs text-slate-300 border-t border-slate-800">
                <strong className="text-emerald-400">Follow-up probe:</strong> {currentCard.followUp}
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button onClick={handleCopyCard} variant="secondary" size="sm">
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt for Chat'}</span>
              </Button>

              <Button onClick={handleNextCard} size="sm">
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Prompt</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
