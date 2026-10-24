'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  Languages, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  Lightbulb,
  Check,
  X
} from 'lucide-react';
import { ACTIVITIES } from '@/lib/activities-data';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export default function ActivitiesPage() {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('quiz_railways_gk');
  
  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Icebreaker State
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const activeActivity = ACTIVITIES.find(a => a.id === selectedActivityId) || ACTIVITIES[0];

  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setPointsEarned(null);
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !activeActivity.questions) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === activeActivity.questions[currentQIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeActivity.questions) return;
    if (currentQIndex < activeActivity.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished, submit results
      setQuizFinished(true);
      const finalScore = selectedOption === activeActivity.questions[currentQIndex].correctIndex ? score + 1 : score;
      try {
        const res = await fetch('/api/activities/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: activeActivity.id,
            score: finalScore,
            maxScore: activeActivity.questions.length,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setPointsEarned(data.pointsEarned);
          if (data.badgesAwarded) {
            setNewBadges(data.badgesAwarded);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setPointsEarned(null);
    setNewBadges([]);
  };

  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-brand-600" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Train Activities & Trivia
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Interactive travel quizzes, language exchange flashcards, and small talk icebreakers
            </p>
          </div>

          <Link
            href="/achievements"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors shadow-2xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Earned Badges</span>
          </Link>
        </div>

        {/* Activity Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACTIVITIES.map(act => (
            <button
              key={act.id}
              onClick={() => handleSelectActivity(act.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedActivityId === act.id
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-brand-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    selectedActivityId === act.id ? 'bg-brand-500/20 text-brand-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {act.category}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    selectedActivityId === act.id ? 'text-brand-300' : 'text-brand-600'
                  }`}
                >
                  +{act.pointsReward} pts
                </span>
              </div>
              <h3 className="text-sm font-bold truncate mb-1">{act.title}</h3>
              <p
                className={`text-xs line-clamp-2 leading-relaxed ${
                  selectedActivityId === act.id ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {act.description}
              </p>
            </button>
          ))}
        </div>

        {/* ACTIVE ACTIVITY VIEW */}

        {/* 1. QUIZ VIEW */}
        {activeActivity.questions && !quizFinished && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQIndex + 1} of {activeActivity.questions.length}
              </span>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Score: {score}
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 leading-snug">
                {activeActivity.questions[currentQIndex].question}
              </h3>
            </div>

            <div className="space-y-2.5">
              {activeActivity.questions[currentQIndex].options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === activeActivity.questions![currentQIndex].correctIndex;

                let btnStyles = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                if (isSelected) {
                  btnStyles = 'bg-brand-50 border-brand-500 text-brand-950 font-bold';
                }
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyles = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    btnStyles = 'bg-rose-50 border-rose-500 text-rose-950';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswerSubmitted && (
              <div className="p-4 bg-navy-50 border border-navy-200 rounded-xl text-xs sm:text-sm text-navy-950 leading-relaxed">
                <span className="font-bold text-navy-900 block mb-1">Explanation:</span>
                {activeActivity.questions[currentQIndex].explanation}
              </div>
            )}

            <div className="flex justify-end pt-2">
              {!isAnswerSubmitted ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="bg-brand-600 hover:bg-brand-700 font-bold"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-navy-900 hover:bg-navy-800 text-white font-bold"
                >
                  {currentQIndex < activeActivity.questions.length - 1 ? 'Next Question' : 'View Results'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* QUIZ FINISHED VIEW */}
        {quizFinished && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-navy-900">Quiz Completed!</h2>
              <p className="text-sm text-slate-600 mt-1">
                You scored <strong>{score}</strong> out of {activeActivity.questions?.length}
              </p>
            </div>

            {pointsEarned !== null && (
              <div className="inline-block p-4 bg-brand-50 rounded-2xl border border-brand-200 text-brand-950">
                <span className="text-xs uppercase font-bold tracking-wider text-brand-700 block">
                  Reward Earned
                </span>
                <span className="text-2xl font-black text-brand-900">+{pointsEarned} Journey Points</span>
              </div>
            )}

            {newBadges.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 max-w-sm mx-auto">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-700 block mb-1">
                  New Badge Unlocked!
                </span>
                <span className="text-sm font-bold">Railways Scholar</span>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-4">
              <Button onClick={handleRestartQuiz} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1.5" />
                <span>Play Again</span>
              </Button>
              <Link
                href="/achievements"
                className="px-4 py-2 bg-navy-900 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-navy-800 transition-colors"
              >
                View Badges & Leaderboard
              </Link>
            </div>
          </div>
        )}

        {/* 2. FLASHCARD VIEW (Language Exchange) */}
        {activeActivity.flashcards && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Travel Phrase {flashcardIndex + 1} of {activeActivity.flashcards.length}
              </span>
              <span className="text-xs text-brand-700 font-semibold">Hindi &bull; English</span>
            </div>

            {/* Flashcard Box */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/40 border-2 border-dashed border-brand-200 flex flex-col justify-center items-center text-center cursor-pointer hover:border-brand-400 transition-all select-none"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-3">
                {isFlipped ? 'Translation & Meaning (Click to flip)' : 'Prompt Phrase (Click to flip)'}
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-3">
                {isFlipped
                  ? activeActivity.flashcards[flashcardIndex].answer
                  : activeActivity.flashcards[flashcardIndex].prompt}
              </h3>

              <p className="text-xs text-slate-500 max-w-sm">
                {activeActivity.flashcards[flashcardIndex].hint}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFlashcardIndex(prev => Math.max(0, prev - 1));
                  setIsFlipped(false);
                }}
                disabled={flashcardIndex === 0}
              >
                Previous
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  if (flashcardIndex < activeActivity.flashcards!.length - 1) {
                    setFlashcardIndex(prev => prev + 1);
                    setIsFlipped(false);
                  } else {
                    setFlashcardIndex(0);
                    setIsFlipped(false);
                  }
                }}
                className="bg-brand-600 hover:bg-brand-700 font-bold"
              >
                {flashcardIndex < activeActivity.flashcards.length - 1 ? 'Next Phrase' : 'Start Over'}
              </Button>
            </div>
          </div>
        )}

        {/* 3. ICEBREAKER VIEW */}
        {activeActivity.icebreakerPrompts && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Lightbulb className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-2">
                Respectful Journey Icebreaker
              </span>
              <p className="text-lg sm:text-xl font-bold text-navy-900 max-w-lg mx-auto leading-relaxed italic">
                {activeActivity.icebreakerPrompts[currentPromptIndex]}
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() =>
                  setCurrentPromptIndex(prev => (prev + 1) % activeActivity.icebreakerPrompts!.length)
                }
                className="bg-navy-900 hover:bg-navy-800 text-white font-bold"
              >
                <span>Draw Another Icebreaker</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
