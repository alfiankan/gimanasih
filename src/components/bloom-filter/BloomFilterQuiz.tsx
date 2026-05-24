import React, { useState } from 'react'
import { Award, Check, X, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BloomFilterQuizProps {
  quizPassed: boolean
  setQuizPassed: (passed: boolean) => void
  onBack: () => void
}

interface Question {
  question: string
  options: string[]
  answerIdx: number
  explanation: string
}

export const BloomFilterQuiz: React.FC<BloomFilterQuizProps> = ({ setQuizPassed, onBack }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0)
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0)
  const [quizFinished, setQuizFinished] = useState<boolean>(false)

  const questions: Question[] = [
    {
      question: '1. What type of data structure is a Bloom Filter?',
      options: [
        'Deterministic and lossless',
        'Probabilistic and space-efficient',
        'Linear and sortable',
        'Hierarchical tree-like'
      ],
      answerIdx: 1,
      explanation: 'Bloom Filters are probabilistic because they trade absolute certainty for extreme memory savings, introducing a small chance of false positives.'
    },
    {
      question: '2. If a Bloom Filter query returns "NO", what is the guarantee?',
      options: [
        'The element is 100% definitely NOT in the set.',
        'The element is probably NOT in the set.',
        'The element is in the set but has expired.',
        'There is a 5% chance the element was inserted.'
      ],
      answerIdx: 0,
      explanation: 'If any of the bits at the hash indices is 0, the item could never have been inserted (as insertion always sets all hash index bits to 1). Thus, a "NO" is 100% guaranteed to be correct.'
    },
    {
      question: '3. Why do false positives occur in Bloom Filters?',
      options: [
        'Because the database has a slow response rate.',
        'Because bits decay over time inside memory.',
        'Because multiple different inputs hash to the exact same bit positions.',
        'Because the hash functions are not secure cryptographically.'
      ],
      answerIdx: 2,
      explanation: 'Hash collisions cause different strings to share the same bit slots. If other inserted elements already flipped those bits to 1, a new element querying those same slots will get a "YES" even if it was never inserted.'
    },
    {
      question: '4. What happens to the false positive rate as the number of elements inserted increases?',
      options: [
        'It decreases.',
        'It stays exactly the same.',
        'It increases.',
        'It drops to zero.'
      ],
      answerIdx: 2,
      explanation: 'As more elements are inserted, more bits in the array are flipped to 1. When the array is mostly filled with 1s, almost any query will return "YES", increasing the false positive rate.'
    },
    {
      question: '5. Which operation is NOT supported by a standard Bloom Filter?',
      options: [
        'Inserting a new element',
        'Checking if an element exists',
        'Hashing a string into bits',
        'Deleting an inserted element'
      ],
      answerIdx: 3,
      explanation: 'You cannot delete an item from a standard Bloom Filter because clearing its bits back to 0 might accidentally delete other elements that hash to the same indices!'
    }
  ]

  const activeQuestion = questions[currentQuestionIdx]

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return
    setSelectedOptionIdx(idx)
  }

  const handleSubmit = () => {
    if (selectedOptionIdx === null || isAnswered) return
    
    setIsAnswered(true)
    const isCorrect = selectedOptionIdx === activeQuestion.answerIdx
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1)
    }
  }

  const handleNext = () => {
    setSelectedOptionIdx(null)
    setIsAnswered(false)
    
    if (currentQuestionIdx === questions.length - 1) {
      setQuizFinished(true)
      const passed = correctAnswersCount >= 4 // 80% passing grade (4 out of 5)
      if (passed) {
        setQuizPassed(true)
      }
    } else {
      setCurrentQuestionIdx(prev => prev + 1)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestionIdx(0)
    setSelectedOptionIdx(null)
    setIsAnswered(false)
    setCorrectAnswersCount(0)
    setQuizFinished(false)
  }

  return (
    <Card 
      glass
      className="quiz-container p-5 rounded-2xl border-white/5 bg-slate-950/60 select-none w-full"
    >
      {!quizFinished ? (
        <div className="quiz-card-wrapper flex flex-col gap-4">
          {/* Quiz Header Info */}
          <div className="quiz-card-header flex justify-between items-center">
            <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block">
              Question {currentQuestionIdx + 1} of {questions.length}
            </span>
            <span className="correct-counter font-mono text-[10px] font-extrabold text-neon-secondary bg-neon-secondary/10 px-2.5 py-1 rounded-lg">
              {correctAnswersCount} Correct
            </span>
          </div>

          {/* Question Text */}
          <h3 className="quiz-question text-base font-extrabold text-foreground leading-normal mt-1 mb-2">
            {activeQuestion.question}
          </h3>

          {/* Options List */}
          <div className="quiz-options-list flex flex-col gap-2.5">
            {activeQuestion.options.map((option, idx) => {
              let optStyles = 'border-white/5 bg-white/2 text-slate-300 hover:border-neon-primary/30 hover:bg-neon-primary/5 hover:text-white'
              
              if (selectedOptionIdx === idx) {
                optStyles = 'border-neon-primary bg-neon-primary/10 text-white font-semibold'
              }
              
              if (isAnswered) {
                if (idx === activeQuestion.answerIdx) {
                  optStyles = 'border-neon-success bg-emerald-500/10 text-emerald-400 font-semibold'
                } else if (selectedOptionIdx === idx) {
                  optStyles = 'border-neon-danger bg-red-500/10 text-red-400 font-semibold'
                } else {
                  optStyles = 'border-white/2 bg-black/10 text-slate-500 opacity-50'
                }
              }

              return (
                <button
                  key={idx}
                  className={cn(
                    "quiz-option-btn w-full flex items-center gap-3 p-4 rounded-xl border text-sm text-left transition-all duration-250 cursor-pointer disabled:cursor-default",
                    optStyles
                  )}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                >
                  <span className={cn(
                    "option-letter font-mono font-extrabold text-neon-secondary",
                    isAnswered && idx === activeQuestion.answerIdx && "text-emerald-400",
                    isAnswered && selectedOptionIdx === idx && idx !== activeQuestion.answerIdx && "text-red-400"
                  )}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="option-text flex-1">{option}</span>
                  {isAnswered && idx === activeQuestion.answerIdx && <Check size={18} className="check-icon text-neon-success shrink-0" />}
                  {isAnswered && selectedOptionIdx === idx && idx !== activeQuestion.answerIdx && <X size={18} className="x-icon text-neon-danger shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Explanation Text */}
          {isAnswered && (
            <Card className="quiz-explanation-box p-4 rounded-xl border-neon-primary/20 bg-neon-primary/5 text-xs md:text-sm leading-relaxed animate-slide-up">
              <span className="explanation-label block font-bold text-purple-400 mb-1">Explanation:</span>
              <p className="explanation-text text-slate-300 leading-normal">{activeQuestion.explanation}</p>
            </Card>
          )}

          {/* Submit/Next controls */}
          <div className="quiz-controls-row mt-2">
            {!isAnswered ? (
              <Button 
                variant="neon"
                className="w-full rounded-2xl h-11 cursor-pointer"
                onClick={handleSubmit}
                disabled={selectedOptionIdx === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                variant="neon"
                className="w-full rounded-2xl h-11 cursor-pointer"
                onClick={handleNext}
              >
                {currentQuestionIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="quiz-results-screen flex flex-col items-center text-center gap-4 py-4 w-full">
          {correctAnswersCount >= 4 ? (
            <div className="success-certificate flex flex-col items-center gap-4 relative w-full select-none">
              <div className="badge-aura w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_70%)] flex items-center justify-center">
                <Award size={64} className="badge-medal text-neon-warning drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse" />
              </div>
              <h3 className="certificate-title text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">
                Bloom Filter Master
              </h3>
              <p className="certificate-score text-base font-extrabold text-neon-secondary font-mono">
                {correctAnswersCount} / {questions.length} Correct
              </p>
              <p className="certificate-desc text-sm text-muted-foreground max-w-sm leading-relaxed mb-2">
                Congratulations! You have completed the Bloom Filter lesson, mastered the math of false positives, and demonstrated server architecture safety skills.
              </p>
              <div className="gold-glow absolute w-24 h-24 rounded-full filter blur-[50px] bg-amber-500/10 top-1/10 pointer-events-none"></div>
              
              <Button 
                variant="neon" 
                className="w-full rounded-2xl h-12 bg-gradient-to-r from-neon-warning to-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] border-transparent font-bold cursor-pointer"
                onClick={onBack}
              >
                <Award size={16} />
                <span>Return to Materials</span>
              </Button>
            </div>
          ) : (
            <div className="fail-screen flex flex-col items-center gap-4 select-none w-full">
              <ShieldAlert size={64} className="fail-icon text-neon-danger drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-bounce" />
              <h3 className="text-xl font-extrabold text-foreground">Quiz Not Passed</h3>
              <p className="fail-score text-base font-extrabold text-neon-danger font-mono">{correctAnswersCount} / {questions.length} Correct</p>
              <p className="fail-desc text-sm text-muted-foreground max-w-sm leading-relaxed">
                You need at least 4 correct answers (80%) to unlock the Bloom Filter certificate. Rewatch the Concept slide details or experiment in the Sandbox simulator!
              </p>
              <div className="game-btn-row flex gap-2.5 w-full mt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-2xl h-11 bg-white/3 border-white/5 font-bold text-foreground cursor-pointer"
                  onClick={restartQuiz}
                >
                  Retry Quiz
                </Button>
                <Button 
                  variant="neon" 
                  className="flex-1 rounded-2xl h-11 cursor-pointer"
                  onClick={onBack}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
