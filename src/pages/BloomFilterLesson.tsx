import React, { useState } from 'react'
import { ArrowLeft, BookOpen, Cpu, Gamepad2, Award } from 'lucide-react'
import { BloomFilterConcept } from '../components/bloom-filter/BloomFilterConcept'
import { BloomFilterSimulator } from '../components/bloom-filter/BloomFilterSimulator'
import { BloomFilterGame } from '../components/bloom-filter/BloomFilterGame'
import { BloomFilterQuiz } from '../components/bloom-filter/BloomFilterQuiz'

interface BloomFilterLessonProps {
  onBack: () => void
  onPass?: () => void
}

type TabType = 'concept' | 'simulator' | 'game' | 'quiz'

export const BloomFilterLesson: React.FC<BloomFilterLessonProps> = ({ onBack, onPass }) => {
  const [activeTab, setActiveTab] = useState<TabType>('concept')
  const [quizPassed, setQuizPassed] = useState<boolean>(false)
  const [gameHighScore, setGameHighScore] = useState<number>(0)

  const renderContent = () => {
    switch (activeTab) {
      case 'concept':
        return <BloomFilterConcept onComplete={() => setActiveTab('simulator')} />
      case 'simulator':
        return <BloomFilterSimulator onComplete={() => setActiveTab('game')} />
      case 'game':
        return (
          <BloomFilterGame 
            highScore={gameHighScore} 
            setHighScore={setGameHighScore} 
            onComplete={() => setActiveTab('quiz')} 
          />
        )
      case 'quiz':
        return (
          <BloomFilterQuiz 
            quizPassed={quizPassed} 
            setQuizPassed={(passed: boolean) => {
              setQuizPassed(passed)
              if (passed && onPass) onPass()
            }}
            onBack={onBack} 
          />
        )
      default:
        return null
    }
  }

  const tabs = [
    { id: 'concept', label: 'Concept', icon: BookOpen },
    { id: 'simulator', label: 'Simulator', icon: Cpu },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'quiz', label: 'Quiz', icon: Award },
  ]

  return (
    <div className="lesson-container">
      {/* Top Header */}
      <header className="lesson-header glass">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="lesson-header-title">
          <span className="lesson-category">Probabilistic Structures</span>
          <h1 className="lesson-name">Bloom Filter</h1>
        </div>
        <div className="lesson-badge-status">
          {quizPassed ? (
            <span className="status-badge-passed">Passed</span>
          ) : (
            <span className="status-badge-ongoing">Learning</span>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="lesson-tabs glass">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className={`lesson-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              <Icon size={18} />
              <span className="tab-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Main Panel Content */}
      <main className="lesson-content-area">
        {renderContent()}
      </main>

      <style>{`
        .lesson-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          margin-bottom: 80px;
          animation: slide-up 0.4s ease;
        }

        @media (min-width: 769px) {
          .lesson-container {
            margin-left: 260px;
            max-width: 800px;
            margin-top: 16px;
            margin-bottom: 24px;
          }
        }

        .lesson-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-radius: 20px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.6);
        }

        .back-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-dim);
          color: var(--text-primary);
          padding: 8px 14px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--text-secondary);
        }

        .lesson-header-title {
          text-align: center;
        }

        .lesson-category {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--neon-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .lesson-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .lesson-badge-status {
          display: flex;
          align-items: center;
        }

        .status-badge-passed {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .status-badge-ongoing {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 4px 10px;
          border-radius: 8px;
        }

        /* Tabs Navigation styling */
        .lesson-tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.8);
        }

        .lesson-tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 10px 4px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        @media (min-width: 500px) {
          .lesson-tab-btn {
            flex-direction: row;
            gap: 8px;
            padding: 10px 12px;
          }
        }

        .lesson-tab-btn:hover {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
        }

        .lesson-tab-btn.active {
          color: var(--neon-primary);
          background: rgba(139, 92, 246, 0.1);
          font-weight: 700;
          box-shadow: inset 0 0 8px rgba(139, 92, 246, 0.05);
        }

        .tab-label {
          font-size: 0.7rem;
          font-weight: 600;
        }

        @media (min-width: 500px) {
          .tab-label {
            font-size: 0.85rem;
          }
        }

        .lesson-content-area {
          min-height: 380px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  )
}
