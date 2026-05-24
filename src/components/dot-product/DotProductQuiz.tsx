import React, { useState } from 'react';
import { Award, Check, X, ArrowRight, HelpCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DotProductQuizProps {
  quizPassed: boolean;
  setQuizPassed: (passed: boolean) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: 'What is the dot product of A⃗ = [3, 4] and B⃗ = [2, -1]?',
    options: ['10', '2', '14', '-2'],
    answer: 1,
    explanation: '3×2 + 4×(-1) = 6 - 4 = 2. Remember: multiply matching components then add them together.',
  },
  {
    id: 2,
    text: 'If dot(A⃗, B⃗) = 0, what does this tell us about the two vectors?',
    options: [
      'They point in exactly the same direction',
      'They are perpendicular (at 90° to each other)',
      'One of the vectors is zero-length',
      'They point in exactly opposite directions',
    ],
    answer: 1,
    explanation: 'When the dot product is 0, cos(θ) = 0, which means θ = 90°. The vectors are perfectly perpendicular.',
  },
  {
    id: 3,
    text: 'In a stealth game, a guard faces direction [0, 1] (pointing up). The player is at direction [1, 0] from the guard (to the right). Is the player detected with a 90° FOV cone?',
    options: [
      'Yes — dot = 1, which exceeds the threshold',
      'No — dot = 0, which is on the exact boundary, not inside the cone',
      'Yes — any positive dot product means detected',
      'No — the player must be directly behind to hide',
    ],
    answer: 1,
    explanation: 'dot([0,1], [1,0]) = 0×1 + 1×0 = 0. For a 90° FOV, threshold = cos(45°) ≈ 0.71. Since 0 < 0.71, the player is NOT detected.',
  },
  {
    id: 4,
    text: 'Why must you normalize (make length = 1) vectors before computing a dot product for angle/FOV checks?',
    options: [
      'Normalization makes the computation faster',
      'Without normalization, the dot product mixes angle AND distance, making thresholds unreliable',
      'Normalized vectors can be stored with less memory',
      'Normalization is only needed for 3D vectors, not 2D',
    ],
    answer: 1,
    explanation: 'dot(A, B) = |A| × |B| × cos(θ). Without normalizing, |A| and |B| scale the result. A far-away player could produce a high dot product even when they are to the side. Normalizing isolates the angle.',
  },
  {
    id: 5,
    text: 'Which real-world system uses dot products to calculate how bright a surface appears under a light?',
    options: [
      'The Lambert diffuse lighting model in shaders',
      'JPEG image compression',
      'TCP/IP packet routing',
      'Database B-Tree indexing',
    ],
    answer: 0,
    explanation: 'Lambert lighting: brightness = max(0, dot(surfaceNormal, lightDir)). When the surface faces the light directly (dot = 1), it is fully lit. When perpendicular (dot = 0), it is in shadow.',
  },
];

export const DotProductQuiz: React.FC<DotProductQuizProps> = ({ setQuizPassed, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = questions[currentIdx];
  const passScore = Math.ceil(questions.length * 0.75);

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === activeQuestion.answer) setCorrectAnswers(p => p + 1);
  };

  const handleNext = () => {
    if (currentIdx === questions.length - 1) {
      const total = correctAnswers + (selectedOpt === activeQuestion.answer ? 1 : 0);
      setQuizFinished(true);
      if (total >= passScore) setQuizPassed(true);
    } else {
      setCurrentIdx(p => p + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setCorrectAnswers(0);
    setQuizFinished(false);
  };

  const finalScore = correctAnswers + (isSubmitted && selectedOpt === activeQuestion.answer ? 1 : 0);

  return (
    <Card glass className="p-5 rounded-2xl border-white/5 bg-slate-950/60 select-none w-full min-h-[380px] flex flex-col justify-between">
      {!quizFinished ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest flex items-center gap-1">
              <HelpCircle size={12} />Question {currentIdx + 1}/{questions.length}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Score: {correctAnswers}/{questions.length}</span>
          </div>

          <h3 className="text-sm md:text-base font-extrabold text-foreground tracking-tight leading-relaxed pt-1">
            {activeQuestion.text}
          </h3>

          <div className="flex flex-col gap-2.5 mt-1">
            {activeQuestion.options.map((option, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === activeQuestion.answer;
              let cls = 'border-white/5 bg-white/2 hover:bg-white/5 text-slate-300';
              if (isSelected) cls = 'border-neon-primary bg-neon-primary/10 text-white';
              if (isSubmitted) {
                if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                else if (isSelected) cls = 'border-red-500 bg-red-500/10 text-red-400';
                else cls = 'border-white/5 bg-white/2 opacity-40 text-slate-400';
              }
              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  className={cn('w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-200 flex justify-between items-center', cls, !isSubmitted && 'cursor-pointer hover:translate-x-1')}
                  onClick={() => setSelectedOpt(idx)}
                >
                  <span>{option}</span>
                  {isSubmitted && isCorrect && <Check size={14} className="text-emerald-400 shrink-0 ml-2" />}
                  {isSubmitted && isSelected && !isCorrect && <X size={14} className="text-red-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] md:text-xs text-muted-foreground leading-relaxed animate-slide-up mt-2">
              <span className="font-extrabold text-white block mb-0.5">Explanation:</span>
              {activeQuestion.explanation}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-neon-secondary/15 flex items-center justify-center border border-neon-secondary/35 text-neon-secondary">
            <Award size={36} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-extrabold text-white">{finalScore >= passScore ? '🎉 Quiz Passed!' : 'Not Quite!'}</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mt-1">
              {finalScore >= passScore
                ? `You got ${finalScore}/${questions.length} correct. Dot Product Master unlocked!`
                : `You got ${finalScore}/${questions.length}. Need ${passScore} to pass. Review the concept slides and try again!`}
            </p>
          </div>
          <div className="flex gap-2.5 w-full max-w-xs mt-4">
            {finalScore >= passScore ? (
              <Button variant="neon" className="flex-1 rounded-xl h-11 cursor-pointer font-bold" onClick={onBack}>
                <ArrowLeft size={16} /><span>Back to Syllabus</span>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1 rounded-xl h-11 bg-white/3 border-white/5 font-bold cursor-pointer text-foreground" onClick={handleRestart}>Retry</Button>
                <Button variant="outline" className="flex-1 rounded-xl h-11 bg-white/3 border-white/5 font-bold cursor-pointer text-foreground" onClick={onBack}>Exit</Button>
              </>
            )}
          </div>
        </div>
      )}

      {!quizFinished && (
        <div className="flex justify-end mt-4 border-t border-white/5 pt-3">
          {!isSubmitted ? (
            <Button variant="neon" className="rounded-xl h-10 px-5 cursor-pointer font-bold" disabled={selectedOpt === null} onClick={handleSubmit}>Submit</Button>
          ) : (
            <Button variant="neon" className="rounded-xl h-10 px-5 cursor-pointer font-bold" onClick={handleNext}>
              <span>{currentIdx === questions.length - 1 ? 'Finish' : 'Next'}</span><ArrowRight size={14} />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
