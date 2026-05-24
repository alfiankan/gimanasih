import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Trophy, AlertCircle, RotateCcw, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BinarySearchGameProps {
  highScore: number;
  setHighScore: (score: number) => void;
  onComplete: () => void;
  onFinishGame?: () => void;
}

interface Challenge {
  arr: number[];
  target: number;
  answer: number; // correct mid index first step
  left: number;
  right: number;
  mid: number;
}

const generateChallenge = (): Challenge => {
  const size = 9;
  const set = new Set<number>();
  while (set.size < size) set.add(Math.floor(Math.random() * 80) + 10);
  const arr = Array.from(set).sort((a, b) => a - b);
  const targetIdx = Math.floor(Math.random() * arr.length);
  const target = arr[targetIdx];
  const left = 0;
  const right = arr.length - 1;
  const mid = Math.floor((left + right) / 2);
  return { arr, target, answer: mid, left, right, mid };
};

export const BinarySearchGame: React.FC<BinarySearchGameProps> = ({ highScore, setHighScore, onComplete, onFinishGame }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 6));

  const nextChallenge = useCallback(() => {
    setChallenge(generateChallenge());
    setFeedback(null);
  }, []);

  const handleStart = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setTimeRemaining(45);
    setStreak(0);
    setLog([]);
    nextChallenge();
  };

  const handleAnswer = (selectedIdx: number) => {
    if (!challenge || feedback) return;
    const mid = Math.floor((challenge.left + challenge.right) / 2);
    const isCorrect = selectedIdx === mid;

    if (isCorrect) {
      const bonus = streak >= 3 ? 20 : 10;
      setScore(prev => prev + bonus);
      setStreak(prev => prev + 1);
      setFeedback('correct');
      addLog(`✅ Correct! Mid=${mid}. +${bonus} pts${streak >= 3 ? ' (streak bonus!)' : ''}`);
      setTimeout(nextChallenge, 700);
    } else {
      setStreak(0);
      setFeedback('wrong');
      addLog(`❌ Wrong. Mid should be index ${mid} (value ${challenge.arr[mid]})`);
      setTimeout(nextChallenge, 1200);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
          setIsPlaying(false);
          if (onFinishGame) onFinishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, onFinishGame]);

  useEffect(() => {
    if (isGameOver && score > highScore) setHighScore(score);
  }, [isGameOver, score, highScore, setHighScore]);

  const timerPct = (timeRemaining / 45) * 100;

  if (!isPlaying && !isGameOver) {
    return (
      <Card glass className="p-8 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col items-center justify-center gap-6 min-h-[380px] select-none">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neon-primary/10 border border-neon-primary/25 flex items-center justify-center text-3xl">🎯</div>
          <h3 className="text-xl font-extrabold text-foreground">Binary Search Challenge</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            You'll see a sorted array and a target. Pick the correct <strong className="text-white">middle index</strong> for the first binary search step. 45 seconds on the clock!
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-xs">
          <div className="p-3 rounded-xl border border-white/5 bg-white/2 text-center">
            <span className="text-[9px] text-muted-foreground font-bold uppercase block">High Score</span>
            <span className="text-lg font-black text-amber-400">{highScore}</span>
          </div>
          <div className="p-3 rounded-xl border border-white/5 bg-white/2 text-center">
            <span className="text-[9px] text-muted-foreground font-bold uppercase block">Streak Bonus</span>
            <span className="text-lg font-black text-neon-primary">3× = +20</span>
          </div>
        </div>
        <Button variant="neon" className="rounded-xl h-12 px-8 cursor-pointer text-base font-black" onClick={handleStart}>
          <Play size={18} /> Start Game
        </Button>
      </Card>
    );
  }

  if (isGameOver) {
    const passed = score >= 60;
    return (
      <Card glass className="p-8 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col items-center justify-center gap-5 min-h-[380px] select-none animate-slide-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center border text-3xl"
          style={{ borderColor: passed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)', background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {passed ? '🏆' : '💀'}
        </div>
        <div className="text-center flex flex-col gap-1">
          <h3 className="text-xl font-extrabold">{passed ? 'Awesome! Game Over!' : 'Time\'s Up!'}</h3>
          <p className="text-sm text-muted-foreground">Final Score: <strong className="text-white text-lg">{score}</strong></p>
          {score > highScore && <p className="text-xs text-amber-400 font-bold">🎉 New High Score!</p>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 border-white/5 bg-white/3 font-bold cursor-pointer" onClick={handleStart}>
            <RotateCcw size={14} /> Retry
          </Button>
          <Button variant="neon" className="rounded-xl h-10 px-4 cursor-pointer font-bold" onClick={onComplete}>
            <Zap size={14} /> Quiz
          </Button>
        </div>
      </Card>
    );
  }

  if (!challenge) return null;

  return (
    <div className="flex flex-col gap-4 animate-slide-up select-none">
      {/* Timer + score bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60">
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="text-muted-foreground">Score: <span className="text-neon-primary text-sm font-black">{score}</span></span>
          {streak >= 2 && <span className="text-amber-400 animate-pulse">🔥 {streak}x Streak</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", timerPct > 50 ? "bg-neon-primary" : timerPct > 25 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <span className={cn("text-xs font-black tabular-nums w-6 text-right", timeRemaining <= 10 && "text-red-400 animate-pulse")}>{timeRemaining}s</span>
        </div>
      </div>

      <Card glass className="p-5 bg-slate-950/60 border-white/5 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Select the MIDDLE INDEX for this first step</span>
          <p className="text-base md:text-lg font-extrabold text-foreground">
            Find <span className="text-neon-primary font-black px-2 py-0.5 bg-neon-primary/10 border border-neon-primary/25 rounded-lg">{challenge.target}</span> in the array
          </p>
          <p className="text-xs text-muted-foreground">L=0, R={challenge.arr.length - 1} → What is <strong className="text-white">mid</strong>? Tap the correct cell!</p>
        </div>

        {/* Array - tap to select */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {challenge.arr.map((val, idx) => {
            const correctMid = Math.floor((challenge.left + challenge.right) / 2);
            const isCorrect = idx === correctMid;
            let style = "border-white/10 bg-slate-900/60 text-slate-300 hover:border-neon-primary/50 hover:bg-neon-primary/5 cursor-pointer";
            if (feedback === 'correct' && isCorrect) style = "border-emerald-500 bg-emerald-500/20 text-emerald-300 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            if (feedback === 'wrong' && isCorrect) style = "border-emerald-500 bg-emerald-500/15 text-emerald-300 animate-pulse";

            return (
              <div key={idx} className="flex flex-col items-center gap-0.5" onClick={() => handleAnswer(idx)}>
                <div className={cn(
                  "w-11 h-11 rounded-xl border-2 flex items-center justify-center font-mono text-sm font-black transition-all duration-200",
                  style
                )}>
                  {val}
                </div>
                <span className="text-[8px] text-slate-600 font-mono">{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={cn(
            "p-3 rounded-xl border text-sm font-bold animate-slide-up",
            feedback === 'correct' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"
          )}>
            {feedback === 'correct' ? '✅ Correct!' : `❌ Mid = index ${Math.floor((challenge.left + challenge.right) / 2)} (value ${challenge.arr[Math.floor((challenge.left + challenge.right) / 2)]})`}
          </div>
        )}
      </Card>

      {/* Log */}
      <Card glass className="p-3 bg-slate-950/60 border-white/5 flex flex-col gap-1.5">
        {log.map((l, i) => (
          <p key={i} className="font-mono text-[10px] text-slate-400 pl-1 border-l border-white/5 animate-slide-up">{l}</p>
        ))}
      </Card>
    </div>
  );
};
