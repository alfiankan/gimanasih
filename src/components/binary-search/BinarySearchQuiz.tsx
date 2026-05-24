import React, { useState } from 'react';
import { Award, Check, X, ArrowRight, HelpCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BinarySearchQuizProps {
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
    text: 'What is the time complexity of binary search?',
    options: ['O(n) — linear', 'O(n²) — quadratic', 'O(log n) — logarithmic', 'O(1) — constant'],
    answer: 2,
    explanation: 'Binary search is O(log n) because each step halves the remaining search space. For n=1,000,000 items, it only needs ~20 steps!'
  },
  {
    id: 2,
    text: 'Binary search can only be performed on data that is...',
    options: ['Stored in a linked list', 'Sorted in ascending or descending order', 'Loaded in memory (not on disk)', 'Containing only integers'],
    answer: 1,
    explanation: 'Binary search requires sorted data. Without ordering, we cannot know which half to discard after each comparison.'
  },
  {
    id: 3,
    text: 'For the array [3, 7, 12, 18, 25, 31, 40] (length=7), what is the mid index at the first step (L=0, R=6)?',
    options: ['Index 2 (value 12)', 'Index 3 (value 18)', 'Index 4 (value 25)', 'Index 1 (value 7)'],
    answer: 1,
    explanation: 'mid = Math.floor((0 + 6) / 2) = Math.floor(3) = 3. The value at index 3 is 18.'
  },
  {
    id: 4,
    text: 'Why is `mid = left + (right - left) / 2` safer than `mid = (left + right) / 2`?',
    options: [
      'It runs faster on modern CPUs.',
      'It avoids integer overflow when left + right exceeds the max integer value.',
      'It works with unsorted arrays.',
      'It reduces the number of steps needed.'
    ],
    answer: 1,
    explanation: 'In languages with bounded integers (Java, C), left + right can overflow for very large arrays. Subtracting first (right - left) keeps the number small and safe.'
  },
  {
    id: 5,
    text: 'You search for 99 in array [2, 5, 10, 20, 35]. What does binary search return?',
    options: [
      'The closest value (35)',
      '-1 (not found)',
      'The last index (4)',
      'Throws an error'
    ],
    answer: 1,
    explanation: 'When the search space is exhausted (left > right) without finding the target, binary search returns -1 to indicate the value is not in the array.'
  },
];

export const BinarySearchQuiz: React.FC<BinarySearchQuizProps> = ({ setQuizPassed, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = questions[currentIdx];
  const passScore = Math.ceil(questions.length * 0.75); // 75% to pass

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === activeQuestion.answer) setCorrectAnswers(p => p + 1);
  };

  const handleNext = () => {
    if (currentIdx === questions.length - 1) {
      const passed = (correctAnswers + (selectedOpt === activeQuestion.answer ? 1 : 0)) >= passScore;
      setQuizFinished(true);
      if (passed) setQuizPassed(true);
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
              <HelpCircle size={12} />Question {currentIdx + 1} of {questions.length}
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
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-200 flex justify-between items-center',
                    cls,
                    !isSubmitted && 'cursor-pointer hover:translate-x-1'
                  )}
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
                ? `You got ${finalScore}/${questions.length} correct. Binary Search Master unlocked!`
                : `You got ${finalScore}/${questions.length}. Need ${passScore} to pass. Review the concept and try again!`}
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
