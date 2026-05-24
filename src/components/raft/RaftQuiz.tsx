import React, { useState } from 'react';
import { Award, Check, X, ArrowRight, HelpCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  text: string;
  options: string[];
  answer: number; // 0-based index
  explanation: string;
}

interface RaftQuizProps {
  quizPassed: boolean;
  setQuizPassed: (passed: boolean) => void;
  onBack: () => void;
}

export const RaftQuiz: React.FC<RaftQuizProps> = ({ setQuizPassed, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const questions: Question[] = [
    {
      id: 1,
      text: 'What triggers a Follower node in a Raft cluster to initiate a Leader Election?',
      options: [
        'It receives a client write request directly.',
        'It detects that another follower has crashed.',
        'It fails to receive heartbeats before its randomized election timeout expires.',
        'The term number reaches a preset maximum.'
      ],
      answer: 2,
      explanation: 'Followers stay passive as long as they receive regular heartbeats from the Leader. If a follower hears nothing before its randomized election timeout expires, it starts an election.'
    },
    {
      id: 2,
      text: 'In a 5-node Raft cluster, what is the minimum quorum size (majority votes) required to elect a leader or commit a log entry?',
      options: [
        '2 nodes',
        '3 nodes',
        '4 nodes',
        '5 nodes'
      ],
      answer: 1,
      explanation: 'A majority is defined as N/2 + 1. For a 5-node cluster, the strict majority is 3. This ensures that only one leader can be established at any given time.'
    },
    {
      id: 3,
      text: 'If a network partition splits a 5-node cluster into Group A {Node 1, Node 2} and Group B {Node 3, Node 4, Node 5}, what happens to client writes sent to Group A?',
      options: [
        'They are committed normally since Node 1 was the old leader.',
        'They are rejected immediately with an error.',
        'They are accepted by Node 1 but can never be committed because a quorum (3 nodes) cannot be reached.',
        'They are automatically forwarded to Group B through a backup channel.'
      ],
      answer: 2,
      explanation: 'Group A only contains 2 nodes, which is less than the majority quorum (3). Thus, the old leader inside Group A can accept client writes, but it can never commit them. Once healed, Group A will overwrite its uncommitted logs with Group B\'s committed logs.'
    },
    {
      id: 4,
      text: 'Why are election timeouts randomized in Raft?',
      options: [
        'To speed up client command latency.',
        'To reduce CPU power consumption.',
        'To prevent split votes where multiple candidate nodes start elections simultaneously and divide the votes.',
        'To randomly balance the network traffic load across nodes.'
      ],
      answer: 2,
      explanation: 'If all nodes had the same election timeout, they would all timeout together, vote for themselves, and create a split vote where no one gets a majority. Randomizing timeouts breaks this symmetry.'
    }
  ];

  const activeQuestion = questions[currentIdx];

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === activeQuestion.answer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx === questions.length - 1) {
      const passed = correctAnswers >= 3; // 75% or higher to pass
      setQuizFinished(true);
      if (passed) {
        setQuizPassed(true);
      }
    } else {
      setCurrentIdx(prev => prev + 1);
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

  return (
    <Card glass className="quiz-container p-5 rounded-2xl border-white/5 bg-slate-950/60 select-none w-full min-h-[380px] flex flex-col justify-between">
      {!quizFinished ? (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest flex items-center gap-1">
              <HelpCircle size={12} />
              Question {activeQuestion.id} of {questions.length}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Score: {correctAnswers} / {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-sm md:text-base font-extrabold text-foreground tracking-tight leading-relaxed pt-1 select-none">
            {activeQuestion.text}
          </h3>

          {/* Options */}
          <div className="flex flex-col gap-2.5 mt-2">
            {activeQuestion.options.map((option, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === activeQuestion.answer;
              
              let optionClass = "border-white/5 bg-white/2 hover:bg-white/5 text-slate-300";
              if (isSelected) {
                optionClass = "border-neon-primary bg-neon-primary/10 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]";
              }
              if (isSubmitted) {
                if (isCorrect) {
                  optionClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                } else if (isSelected) {
                  optionClass = "border-red-500 bg-red-500/10 text-red-400";
                } else {
                  optionClass = "border-white/5 bg-white/2 opacity-40 text-slate-400";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-200 flex justify-between items-center",
                    optionClass,
                    !isSubmitted && "cursor-pointer hover:translate-x-1"
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

          {/* Explanation */}
          {isSubmitted && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] md:text-xs text-muted-foreground leading-relaxed animate-slide-up mt-2 select-none">
              <span className="font-extrabold text-white block mb-0.5">Explanation:</span>
              {activeQuestion.explanation}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-neon-secondary/15 flex items-center justify-center border border-neon-secondary/35 text-neon-secondary shadow-[0_0_20px_rgba(52,211,153,0.15)]">
            <Award size={36} />
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {correctAnswers >= 3 ? 'Quiz Passed!' : 'Quiz Failed'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mt-1">
              {correctAnswers >= 3 
                ? `Outstanding! You answered ${correctAnswers} out of ${questions.length} questions correctly.`
                : `You got ${correctAnswers} out of ${questions.length} correct. You need at least 3 correct answers to pass.`
              }
            </p>
          </div>

          <div className="game-btn-row flex gap-2.5 w-full max-w-xs mt-4">
            {correctAnswers >= 3 ? (
              <Button 
                variant="neon" 
                className="flex-1 rounded-xl h-11 cursor-pointer font-bold"
                onClick={onBack}
              >
                <ArrowLeft size={16} />
                <span>Return to Syllabus</span>
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 bg-white/3 border-white/5 font-bold cursor-pointer text-foreground"
                  onClick={handleRestart}
                >
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 bg-white/3 border-white/5 font-bold cursor-pointer text-foreground"
                  onClick={onBack}
                >
                  Exit
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Control Action Button at Bottom */}
      {!quizFinished && (
        <div className="flex justify-end mt-4 border-t border-white/5 pt-3">
          {!isSubmitted ? (
            <Button 
              variant="neon" 
              className="rounded-xl h-10 px-5 cursor-pointer font-bold"
              disabled={selectedOpt === null}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          ) : (
            <Button 
              variant="neon" 
              className="rounded-xl h-10 px-5 cursor-pointer font-bold"
              onClick={handleNext}
            >
              <span>{currentIdx === questions.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
