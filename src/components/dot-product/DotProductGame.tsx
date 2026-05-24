import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DotProductGameProps {
  highScore: number;
  setHighScore: (s: number) => void;
  onComplete: () => void;
  onFinishGame?: () => void;
}

interface Challenge {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}

// Rounds dot to 1 decimal
const rd = (n: number) => Math.round(n * 10) / 10;

const generateChallenge = (): Challenge => {
  const type = Math.floor(Math.random() * 4);

  if (type === 0) {
    // "What is the dot product of A and B?"
    const ax = Math.floor(Math.random() * 5) - 2;
    const ay = Math.floor(Math.random() * 5) - 2;
    const bx = Math.floor(Math.random() * 5) - 2;
    const by = Math.floor(Math.random() * 5) - 2;
    const correct = ax * bx + ay * by;
    const wrongs = [correct + 2, correct - 3, correct * -1].map(v => v === correct ? v + 1 : v);
    const choices = [correct, wrongs[0], wrongs[1], wrongs[2]].sort(() => Math.random() - 0.5).map(String);
    return {
      question: `What is the dot product?\nA⃗ = [${ax}, ${ay}]   B⃗ = [${bx}, ${by}]`,
      choices,
      answer: choices.indexOf(String(correct)),
      explanation: `${ax}×${bx} + ${ay}×${by} = ${ax * bx} + ${ay * by} = ${correct}`,
    };
  }

  if (type === 1) {
    // "What does this dot product sign tell you?"
    const signs: { sign: string; meaning: string; wrong1: string; wrong2: string }[] = [
      { sign: '> 0', meaning: 'Vectors point in same direction (angle < 90°)', wrong1: 'Vectors are perpendicular', wrong2: 'Vectors point opposite ways' },
      { sign: '= 0', meaning: 'Vectors are perpendicular (90° apart)', wrong1: 'Vectors are parallel', wrong2: 'One vector has zero length' },
      { sign: '< 0', meaning: 'Vectors point in opposite directions (angle > 90°)', wrong1: 'Vectors point in same direction', wrong2: 'Vectors are parallel' },
    ];
    const s = signs[Math.floor(Math.random() * signs.length)];
    const choices = [s.meaning, s.wrong1, s.wrong2, 'The vectors have the same magnitude'].sort(() => Math.random() - 0.5);
    return {
      question: `dot(A⃗, B⃗) ${s.sign}\n\nWhat does this tell you?`,
      choices,
      answer: choices.indexOf(s.meaning),
      explanation: `When the dot product is ${s.sign}: ${s.meaning}`,
    };
  }

  if (type === 2) {
    // Vision cone question
    const fovAngles = [45, 60, 90, 120, 180];
    const fov = fovAngles[Math.floor(Math.random() * fovAngles.length)];
    const threshold = Math.cos((fov / 2) * Math.PI / 180);
    const thStr = rd(threshold).toFixed(2);
    const wrongs = [rd(Math.cos((fov / 4) * Math.PI / 180)).toFixed(2), rd(Math.cos((fov) * Math.PI / 180)).toFixed(2), '0.00'];
    const choices = [thStr, ...wrongs.filter(w => w !== thStr)].sort(() => Math.random() - 0.5);
    return {
      question: `A guard has a ${fov}° field of view cone.\n\nWhat dot product threshold detects the player?`,
      choices,
      answer: choices.indexOf(thStr),
      explanation: `The threshold is cos(FOV/2) = cos(${fov / 2}°) ≈ ${thStr}. Player is detected when dot > ${thStr}.`,
    };
  }

  // type 3 — normalization / magnitude
  const ax = [3, 4, 5, 1][Math.floor(Math.random() * 4)];
  const ay = [4, 3, 0, 0][Math.floor(Math.random() * 4)];
  const mag = Math.sqrt(ax * ax + ay * ay);
  const magStr = rd(mag).toFixed(2);
  const wrongs = [rd(mag + 1).toFixed(2), rd(mag * 2).toFixed(2), rd(Math.sqrt(ax + ay)).toFixed(2)];
  const choices = [magStr, ...wrongs.filter(w => w !== magStr)].sort(() => Math.random() - 0.5);
  return {
    question: `What is the magnitude (length) of vector A⃗ = [${ax}, ${ay}]?\n\n|A⃗| = √(Aₓ² + Aᵧ²)`,
    choices,
    answer: choices.indexOf(magStr),
    explanation: `|A⃗| = √(${ax}² + ${ay}²) = √(${ax * ax} + ${ay * ay}) = √${ax * ax + ay * ay} ≈ ${magStr}`,
  };
};

export const DotProductGame: React.FC<DotProductGameProps> = ({ highScore, setHighScore, onComplete, onFinishGame }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextChallenge = useCallback(() => {
    setChallenge(generateChallenge());
    setFeedback(null);
  }, []);

  const handleStart = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setTimeRemaining(60);
    setStreak(0);
    setLog([]);
    nextChallenge();
  };

  const handleAnswer = (idx: number) => {
    if (!challenge || feedback) return;
    const isCorrect = idx === challenge.answer;
    if (isCorrect) {
      const bonus = streak >= 3 ? 20 : 10;
      setScore(p => p + bonus);
      setStreak(p => p + 1);
      setFeedback('correct');
      setLog(p => [`✅ +${bonus}pts${streak >= 3 ? ' streak!' : ''}: ${challenge.choices[challenge.answer]}`, ...p].slice(0, 6));
      setTimeout(nextChallenge, 700);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setLog(p => [`❌ Correct: ${challenge.choices[challenge.answer]}`, ...p].slice(0, 6));
      setTimeout(nextChallenge, 1400);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(p => {
        if (p <= 1) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
          setIsPlaying(false);
          if (onFinishGame) onFinishGame();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, onFinishGame]);

  useEffect(() => {
    if (isGameOver && score > highScore) setHighScore(score);
  }, [isGameOver, score, highScore, setHighScore]);

  const timerPct = (timeRemaining / 60) * 100;

  if (!isPlaying && !isGameOver) {
    return (
      <Card glass className="p-8 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col items-center gap-6 min-h-[380px] justify-center select-none">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neon-primary/10 border border-neon-primary/25 flex items-center justify-center text-3xl">🎯</div>
          <h3 className="text-xl font-extrabold text-foreground">Dot Product Challenge</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            60 seconds. Answer questions on dot product calculations, vision cone thresholds, and vector magnitudes. Streak bonuses for 3+ in a row!
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
      <Card glass className="p-8 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col items-center gap-5 min-h-[380px] justify-center select-none animate-slide-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center border text-3xl"
          style={{ borderColor: passed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)', background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {passed ? '🏆' : '💀'}
        </div>
        <div className="text-center flex flex-col gap-1">
          <h3 className="text-xl font-extrabold">{passed ? 'Excellent!' : 'Time\'s Up!'}</h3>
          <p className="text-sm text-muted-foreground">Score: <strong className="text-white text-lg">{score}</strong></p>
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
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60">
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="text-muted-foreground">Score: <span className="text-neon-primary text-sm font-black">{score}</span></span>
          {streak >= 2 && <span className="text-amber-400 animate-pulse">🔥 {streak}× Streak</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-1000", timerPct > 50 ? "bg-neon-primary" : timerPct > 25 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${timerPct}%` }} />
          </div>
          <span className={cn("text-xs font-black tabular-nums w-6 text-right", timeRemaining <= 10 && "text-red-400 animate-pulse")}>{timeRemaining}s</span>
        </div>
      </div>

      <Card glass className="p-5 bg-slate-950/60 border-white/5 flex flex-col gap-5">
        <pre className="text-sm md:text-base font-extrabold text-foreground tracking-tight leading-relaxed whitespace-pre-wrap font-sans">
          {challenge.question}
        </pre>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {challenge.choices.map((choice, idx) => {
            let cls = 'border-white/5 bg-white/2 hover:bg-white/8 text-slate-300 cursor-pointer hover:translate-x-1';
            if (feedback === 'correct' && idx === challenge.answer) cls = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 scale-[1.02]';
            if (feedback === 'wrong' && idx === challenge.answer) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 animate-pulse';
            return (
              <button
                key={idx}
                disabled={!!feedback}
                onClick={() => handleAnswer(idx)}
                className={cn("w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-200", cls)}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {feedback === 'wrong' && challenge && (
          <div className="p-3 rounded-xl border border-white/5 bg-white/2 text-[10px] text-muted-foreground animate-slide-up">
            <span className="font-bold text-white block mb-0.5">Explanation:</span>{challenge.explanation}
          </div>
        )}
      </Card>

      <Card glass className="p-3 bg-slate-950/60 border-white/5 flex flex-col gap-1">
        {log.map((l, i) => <p key={i} className="font-mono text-[10px] text-slate-400 pl-1 border-l border-white/5">{l}</p>)}
      </Card>
    </div>
  );
};
