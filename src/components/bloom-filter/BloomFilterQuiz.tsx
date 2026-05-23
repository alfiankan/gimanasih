import React, { useState } from 'react'
import { Award, Check, X, ShieldAlert, Sparkles } from 'lucide-react'

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

export const BloomFilterQuiz: React.FC<BloomFilterQuizProps> = ({ quizPassed: _quizPassed, setQuizPassed, onBack }) => {
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
    <div className="quiz-container glass">
      {!quizFinished ? (
        <div className="quiz-card-wrapper">
          {/* Quiz Header Info */}
          <div className="quiz-card-header">
            <span className="section-label">Question {currentQuestionIdx + 1} of {questions.length}</span>
            <span className="correct-counter font-mono">{correctAnswersCount} Correct</span>
          </div>

          {/* Question Text */}
          <h3 className="quiz-question">{activeQuestion.question}</h3>

          {/* Options List */}
          <div className="quiz-options-list">
            {activeQuestion.options.map((option, idx) => {
              let optionClass = ''
              if (selectedOptionIdx === idx) optionClass += ' selected'
              
              if (isAnswered) {
                if (idx === activeQuestion.answerIdx) {
                  optionClass += ' correct'
                } else if (selectedOptionIdx === idx) {
                  optionClass += ' incorrect'
                } else {
                  optionClass += ' dimmed'
                }
              }

              return (
                <button
                  key={idx}
                  className={`quiz-option-btn glass ${optionClass}`}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                >
                  <span className="option-letter font-mono">{String.fromCharCode(65 + idx)}.</span>
                  <span className="option-text">{option}</span>
                  {isAnswered && idx === activeQuestion.answerIdx && <Check size={18} className="check-icon" />}
                  {isAnswered && selectedOptionIdx === idx && idx !== activeQuestion.answerIdx && <X size={18} className="x-icon" />}
                </button>
              )
            })}
          </div>

          {/* Explanation Text */}
          {isAnswered && (
            <div className="quiz-explanation-box glass">
              <span className="explanation-label">Explanation:</span>
              <p className="explanation-text">{activeQuestion.explanation}</p>
            </div>
          )}

          {/* Submit/Next controls */}
          <div className="quiz-controls-row">
            {!isAnswered ? (
              <button 
                className="btn btn-primary quiz-action-btn"
                onClick={handleSubmit}
                disabled={selectedOptionIdx === null}
              >
                Submit Answer
              </button>
            ) : (
              <button className="btn btn-primary quiz-action-btn" onClick={handleNext}>
                {currentQuestionIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="quiz-results-screen">
          {correctAnswersCount >= 4 ? (
            <div className="success-certificate">
              <div className="badge-aura">
                <Award size={64} className="badge-medal animate-pulse" />
              </div>
              <h3 className="certificate-title">Bloom Filter Master</h3>
              <p className="certificate-score font-mono">{correctAnswersCount} / {questions.length} Correct</p>
              <p className="certificate-desc">
                Congratulations! You have completed the Bloom Filter lesson, mastered the math of false positives, and demonstrated server architecture safety skills.
              </p>
              <div className="glow-particle gold-glow"></div>
              <button className="btn btn-primary cta-finish" onClick={onBack}>
                <Sparkles size={16} />
                <span>Return to Materials</span>
              </button>
            </div>
          ) : (
            <div className="fail-screen">
              <ShieldAlert size={64} className="fail-icon" />
              <h3>Quiz Not Passed</h3>
              <p className="fail-score font-mono">{correctAnswersCount} / {questions.length} Correct</p>
              <p className="fail-desc">
                You need at least 4 correct answers (80%) to unlock the Bloom Filter certificate. Rewatch the Concept slide details or experiment in the Sandbox simulator!
              </p>
              <div className="game-btn-row">
                <button className="btn btn-secondary" onClick={restartQuiz}>
                  Retry Quiz
                </button>
                <button className="btn btn-primary" onClick={onBack}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .quiz-container {
          padding: 20px;
          border-radius: 24px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.45);
        }

        .quiz-card-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .quiz-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .correct-counter {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--neon-secondary);
          background: rgba(6, 182, 212, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .quiz-question {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .quiz-options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quiz-option-btn {
          width: 100%;
          display: flex;
          align-items: center;
          text-align: left;
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.3);
          transition: all 0.2s ease;
          gap: 10px;
          color: var(--text-secondary);
        }

        .quiz-option-btn:hover:not(:disabled) {
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(139, 92, 246, 0.04);
          color: var(--text-primary);
        }

        .quiz-option-btn.selected {
          border-color: var(--neon-primary);
          background: rgba(139, 92, 246, 0.08);
          color: var(--text-primary);
        }

        .quiz-option-btn.correct {
          border-color: var(--neon-success);
          background: rgba(16, 185, 129, 0.1);
          color: #ffffff;
        }

        .quiz-option-btn.incorrect {
          border-color: var(--neon-danger);
          background: rgba(239, 68, 68, 0.1);
          color: #ffffff;
        }

        .quiz-option-btn.dimmed {
          opacity: 0.45;
        }

        .option-letter {
          font-weight: 800;
          color: var(--neon-secondary);
        }

        .quiz-option-btn.correct .option-letter {
          color: #34d399;
        }

        .quiz-option-btn.incorrect .option-letter {
          color: #f87171;
        }

        .check-icon {
          margin-left: auto;
          color: var(--neon-success);
        }

        .x-icon {
          margin-left: auto;
          color: var(--neon-danger);
        }

        /* Explanation Box */
        .quiz-explanation-box {
          padding: 14px;
          border-radius: 12px;
          border-color: rgba(139, 92, 246, 0.2);
          background: rgba(139, 92, 246, 0.03);
          font-size: 0.85rem;
          line-height: 1.45;
          animation: slide-up 0.3s ease;
        }

        .explanation-label {
          display: block;
          font-weight: 700;
          color: #a78bfa;
          margin-bottom: 4px;
        }

        .explanation-text {
          color: var(--text-secondary);
        }

        .quiz-action-btn {
          width: 100%;
          border-radius: 14px;
        }

        /* Results Certificate styles */
        .quiz-results-screen {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px 10px;
        }

        .success-certificate {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          position: relative;
          width: 100%;
        }

        .badge-aura {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-medal {
          color: var(--neon-warning);
          filter: drop-shadow(0 0 15px rgba(245,158,11,0.6));
        }

        .certificate-title {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          background: linear-gradient(135deg, #ffffff 40%, var(--neon-warning));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .certificate-score {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--neon-secondary);
        }

        .certificate-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 380px;
          line-height: 1.55;
        }

        .gold-glow {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          filter: blur(50px);
          background: var(--neon-warning);
          opacity: 0.15;
          top: 10%;
          pointer-events: none;
        }

        .cta-finish {
          width: 100%;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--neon-warning), #d97706);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
          color: #ffffff;
        }

        .cta-finish:hover {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
        }

        /* Fail Screen */
        .fail-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .fail-icon {
          color: var(--neon-danger);
          filter: drop-shadow(0 0 10px rgba(239,68,68,0.4));
        }

        .fail-score {
          font-size: 1.1rem;
          color: var(--neon-danger);
          font-weight: 700;
        }

        .fail-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 360px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
