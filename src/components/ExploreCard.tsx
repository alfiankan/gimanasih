import React from 'react'
import { Sparkles, Brain, Clock, Zap, BookOpen } from 'lucide-react'

export interface LessonData {
  id: string
  title: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  xp: number
  description: string
  visualType: 'bloom' | 'bst' | 'hashing' | 'sort' | 'graph'
}

interface ExploreCardProps {
  lesson: LessonData
  onStart: (lessonId: string) => void
}

export const ExploreCard: React.FC<ExploreCardProps> = ({ lesson, onStart }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'badge-emerald'
      case 'Intermediate': return 'badge-cyan'
      case 'Advanced': return 'badge-violet'
      default: return 'badge-cyan'
    }
  }

  // Renders a beautiful visual teaser corresponding to the algorithm type
  const renderVisualTeaser = () => {
    switch (lesson.visualType) {
      case 'bloom':
        return (
          <div className="teaser-box bloom-teaser">
            <div className="teaser-hash-line"></div>
            <div className="teaser-bit-tape">
              {[0, 1, 0, 0, 1, 0, 1, 1].map((bit, i) => (
                <div key={i} className={`teaser-bit-cell ${bit ? 'active' : ''}`}>
                  {bit}
                </div>
              ))}
            </div>
            <div className="glow-particle violet-glow"></div>
            <div className="glow-particle cyan-glow"></div>
          </div>
        )
      case 'bst':
        return (
          <div className="teaser-box bst-teaser">
            <svg viewBox="0 0 100 80" className="teaser-svg">
              {/* Nodes and branches */}
              <line x1="50" y1="15" x2="25" y2="40" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <line x1="50" y1="15" x2="75" y2="40" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <circle cx="50" cy="15" r="8" fill="var(--neon-primary)" />
              <circle cx="25" cy="40" r="8" fill="var(--neon-secondary)" />
              <circle cx="75" cy="40" r="8" fill="var(--neon-secondary)" />
              <text x="50" y="18" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">8</text>
              <text x="25" y="43" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">3</text>
              <text x="75" y="43" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">10</text>
            </svg>
          </div>
        )
      case 'hashing':
        return (
          <div className="teaser-box hashing-teaser">
            <div className="hashing-flow">
              <span className="hash-key font-mono">"user_1"</span>
              <span className="hash-arrow">➔</span>
              <span className="hash-box font-mono glass">MD5</span>
              <span className="hash-arrow">➔</span>
              <span className="hash-index font-mono badge-cyan">Index 7</span>
            </div>
          </div>
        )
      case 'sort':
        return (
          <div className="teaser-box sort-teaser">
            <div className="sort-bars">
              {[30, 80, 50, 95, 20, 60, 40].map((height, i) => (
                <div
                  key={i}
                  className="sort-bar"
                  style={{
                    height: `${height}%`,
                    background: i === 3 ? 'var(--neon-primary)' : i === 4 ? 'var(--neon-secondary)' : 'var(--border-neon-hover)'
                  }}
                />
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="teaser-box default-teaser">
            <Brain size={48} className="floating-brain" />
          </div>
        )
    }
  }

  return (
    <div className="explore-slide">
      <div className="explore-card-container glass">
        {/* Category Header */}
        <div className="card-header">
          <span className="category-tag">
            <Sparkles size={14} />
            {lesson.category}
          </span>
          <div className="header-meta">
            <span className={`badge ${getDifficultyColor(lesson.difficulty)}`}>
              {lesson.difficulty}
            </span>
          </div>
        </div>

        {/* Visual Teaser Area */}
        <div className="card-visual-area">
          {renderVisualTeaser()}
        </div>

        {/* Info Area */}
        <div className="card-info-area">
          <h2 className="lesson-title">{lesson.title}</h2>
          <p className="lesson-description">{lesson.description}</p>
          
          <div className="lesson-stats">
            <div className="stat-item">
              <Clock size={16} />
              <span>{lesson.duration}</span>
            </div>
            <div className="stat-item">
              <Zap size={16} />
              <span>{lesson.xp} XP</span>
            </div>
          </div>

          <button className="btn btn-primary cta-btn" onClick={() => onStart(lesson.id)}>
            <BookOpen size={18} />
            <span>Dive Into Lesson</span>
          </button>
        </div>
      </div>

      <style>{`
        .explore-card-container {
          width: 100%;
          max-width: 420px;
          height: 100%;
          max-height: 640px;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(13, 20, 35, 0.65);
          box-shadow: var(--shadow-premium), inset 0 0 20px rgba(139, 92, 246, 0.05);
          animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-height: 700px) {
          .explore-card-container {
            max-height: 520px;
            padding: 16px;
            border-radius: 24px;
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .category-tag {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--neon-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-visual-area {
          flex: 1.2;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          border: 1px solid var(--border-dim);
          overflow: hidden;
          margin-bottom: 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Teaser styles */
        .teaser-box {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* Bloom Teaser */
        .bloom-teaser {
          flex-direction: column;
          gap: 16px;
        }

        .teaser-hash-line {
          position: absolute;
          width: 80%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--neon-primary), var(--neon-secondary), transparent);
          top: 35%;
        }

        .teaser-bit-tape {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          padding: 8px;
          border-radius: 12px;
          border: 1px solid var(--border-dim);
        }

        .teaser-bit-cell {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          border: 1px solid var(--border-dim);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
        }

        .teaser-bit-cell.active {
          color: #ffffff;
          background: linear-gradient(135deg, var(--neon-primary), var(--neon-secondary));
          border-color: transparent;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        .glow-particle {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.3;
        }

        .violet-glow {
          background: var(--neon-primary);
          top: 20%;
          left: 20%;
          animation: float 4s infinite ease-in-out;
        }

        .cyan-glow {
          background: var(--neon-secondary);
          bottom: 20%;
          right: 20%;
          animation: float 4s infinite ease-in-out 2s;
        }

        /* BST Teaser */
        .teaser-svg {
          width: 60%;
          height: auto;
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
        }

        /* Hashing Teaser */
        .hashing-flow {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid var(--border-dim);
          font-size: 0.85rem;
        }

        .hash-key {
          color: var(--neon-secondary);
        }

        .hash-arrow {
          color: var(--text-muted);
        }

        .hash-box {
          padding: 4px 8px;
          border-radius: 6px;
          border-color: rgba(255,255,255,0.1);
        }

        /* Sort Teaser */
        .sort-teaser {
          padding: 24px;
        }

        .sort-bars {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          width: 80%;
          height: 60%;
        }

        .sort-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
        }

        /* Info Area */
        .card-info-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lesson-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .lesson-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .lesson-stats {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          margin-bottom: 8px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .cta-btn {
          width: 100%;
          border-radius: 16px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}
