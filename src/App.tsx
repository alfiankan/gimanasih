import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { ExplorePage } from './pages/ExplorePage'
import { MaterialsPage } from './pages/MaterialsPage'
import { BloomFilterLesson } from './pages/BloomFilterLesson'
import { Award, Lock } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<string>('explore')
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])

  const handleStartLesson = (lessonId: string) => {
    setActiveTab(`lesson-${lessonId}`)
  }

  const markBadgeAsUnlocked = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev
      return [...prev, badgeId]
    })
  }

  const renderActivePage = () => {
    if (activeTab === 'explore') {
      return <ExplorePage onStartLesson={handleStartLesson} />
    }
    if (activeTab === 'materials') {
      return <MaterialsPage onStartLesson={handleStartLesson} />
    }
    if (activeTab === 'lesson-bloom-filter') {
      return (
        <BloomFilterLesson 
          onBack={() => {
            setActiveTab('materials')
          }}
          // Let's pass a function to mark badge as unlocked when passed
          onPass={() => markBadgeAsUnlocked('bloom-filter')}
        />
      )
    }
    if (activeTab === 'achievements') {
      return (
        <div className="achievements-page">
          <header className="achievements-header">
            <h2 className="section-title">Your Badge Gallery</h2>
            <p className="section-desc">Complete interactive quizzes to earn digital certificates.</p>
          </header>

          <div className="badges-grid">
            {/* Bloom Filter Badge */}
            <div className={`badge-card glass ${unlockedBadges.includes('bloom-filter') ? 'unlocked' : 'locked'}`}>
              <div className="badge-card-icon-wrapper">
                <Award size={36} className="badge-icon" />
              </div>
              <h3 className="badge-name">Bloom Filter Master</h3>
              <p className="badge-description">Understand bit arrays, false positive margins, and spam filters.</p>
              {unlockedBadges.includes('bloom-filter') ? (
                <span className="badge-status-tag active">Earned</span>
              ) : (
                <span className="badge-status-tag inactive">
                  <Lock size={12} />
                  Locked
                </span>
              )}
            </div>

            {/* Locked Badges */}
            {[
              { id: 'bst', name: 'BST Explorer', desc: 'Master tree traversals, lookup efficiency, and node rotations.' },
              { id: 'hashing', name: 'Hash Guru', desc: 'Build hash grids and master linear and chaining collisions.' },
              { id: 'quick-sort', name: 'Divide & Conqueror', desc: 'Understand array pivot choices and partition routines.' }
            ].map((locked) => (
              <div key={locked.id} className="badge-card glass locked">
                <div className="badge-card-icon-wrapper">
                  <Lock size={30} className="lock-icon" />
                </div>
                <h3 className="badge-name">{locked.name}</h3>
                <p className="badge-description">{locked.desc}</p>
                <span className="badge-status-tag inactive">
                  Locked
                </span>
              </div>
            ))}
          </div>

          <style>{`
            .achievements-page {
              padding: 24px 16px;
              display: flex;
              flex-direction: column;
              gap: 24px;
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              margin-bottom: 80px;
              animation: slide-up 0.5s ease;
            }

            @media (min-width: 769px) {
              .achievements-page {
                margin-left: 260px;
                margin-bottom: 24px;
                max-width: 800px;
              }
            }

            .achievements-header {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .section-title {
              font-size: 1.25rem;
              font-weight: 800;
              color: var(--text-primary);
              border-left: 4px solid var(--neon-primary);
              padding-left: 10px;
            }

            .section-desc {
              font-size: 0.85rem;
              color: var(--text-secondary);
            }

            .badges-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
              gap: 16px;
            }

            .badge-card {
              border-radius: 20px;
              padding: 20px 14px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              border: 1px solid var(--border-dim);
              transition: all 0.25s ease;
              gap: 12px;
              position: relative;
              overflow: hidden;
            }

            .badge-card.unlocked {
              border-color: rgba(245, 158, 11, 0.4);
              background: linear-gradient(135deg, rgba(20, 27, 45, 0.6) 0%, rgba(245, 158, 11, 0.05) 100%);
              box-shadow: 0 4px 20px -5px rgba(245, 158, 11, 0.15);
            }

            .badge-card.unlocked:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 30px -5px rgba(245, 158, 11, 0.3);
            }

            .badge-card.locked {
              opacity: 0.6;
              background: rgba(13, 20, 35, 0.2);
            }

            .badge-card-icon-wrapper {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.02);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid var(--border-dim);
              transition: all 0.3s ease;
            }

            .badge-card.unlocked .badge-card-icon-wrapper {
              color: var(--neon-warning);
              background: rgba(245, 158, 11, 0.1);
              border-color: rgba(245, 158, 11, 0.25);
              filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
            }

            .badge-card.locked .badge-card-icon-wrapper {
              color: var(--text-muted);
            }

            .badge-name {
              font-size: 0.9rem;
              font-weight: 700;
              color: var(--text-primary);
            }

            .badge-description {
              font-size: 0.75rem;
              color: var(--text-secondary);
              line-height: 1.4;
              flex-grow: 1;
            }

            .badge-status-tag {
              font-size: 0.7rem;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 4px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }

            .badge-status-tag.active {
              background: rgba(245, 158, 11, 0.15);
              color: #fbbf24;
              border: 1px solid rgba(245, 158, 11, 0.3);
            }

            .badge-status-tag.inactive {
              background: rgba(255, 255, 255, 0.05);
              color: var(--text-muted);
              border: 1px solid var(--border-dim);
            }
          `}</style>
        </div>
      )
    }
    return null
  }

  // Override props for BloomFilterLesson to wire up badge unlocking!
  const pageContent = () => {
    if (activeTab === 'lesson-bloom-filter') {
      return (
        <BloomFilterLesson 
          onBack={() => setActiveTab('materials')}
          // Set passing state to trigger unlocked badge in parent
          onPass={() => {
            if (!unlockedBadges.includes('bloom-filter')) {
              setUnlockedBadges(prev => [...prev, 'bloom-filter'])
            }
          }}
        />
      )
    }
    return renderActivePage()
  }

  return (
    <>
      {pageContent()}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  )
}

export default App
