import React, { useState } from 'react'
import { FolderTree, type FolderItem } from '../components/FolderTree'
import { Search, Trophy, BookOpen, Layers } from 'lucide-react'

interface MaterialsPageProps {
  onStartLesson: (lessonId: string) => void
}

const COURSES_DATA: FolderItem[] = [
  {
    id: 'probabilistic',
    name: 'Probabilistic Data Structures',
    type: 'folder',
    children: [
      {
        id: 'bloom-filter',
        name: 'Bloom Filter',
        type: 'file',
        status: 'In Progress',
        xp: 250
      }
    ]
  },
  {
    id: 'trees-graphs',
    name: 'Trees & Graphs',
    type: 'folder',
    children: [
      {
        id: 'binary-search-tree',
        name: 'Binary Search Tree',
        type: 'file',
        status: 'Not Started',
        xp: 150
      },
      {
        id: 'dijkstra',
        name: "Dijkstra's Shortest Path",
        type: 'file',
        status: 'Not Started',
        xp: 400
      }
    ]
  },
  {
    id: 'sorting-searching',
    name: 'Sorting & Hashing',
    type: 'folder',
    children: [
      {
        id: 'hash-tables',
        name: 'Hash Tables',
        type: 'file',
        status: 'Not Started',
        xp: 200
      },
      {
        id: 'quick-sort',
        name: 'Quick Sort',
        type: 'file',
        status: 'Not Started',
        xp: 300
      },
      {
        id: 'consistent-hashing',
        name: 'Consistent Hashing',
        type: 'file',
        status: 'Not Started',
        xp: 350
      }
    ]
  }
]

export const MaterialsPage: React.FC<MaterialsPageProps> = ({ onStartLesson }) => {
  const [searchQuery, setSearchQuery] = useState<string>('')

  return (
    <div className="materials-container">
      {/* Top Banner Dashboard */}
      <section className="materials-hero glass">
        <div className="hero-stats">
          <div className="hero-stat-box">
            <Trophy className="stat-icon yellow" size={24} />
            <div className="stat-text">
              <span className="stat-value">250 XP</span>
              <span className="stat-label">Total Earned</span>
            </div>
          </div>
          <div className="hero-stat-box">
            <BookOpen className="stat-icon violet" size={24} />
            <div className="stat-text">
              <span className="stat-value">1 / 6</span>
              <span className="stat-label">Lessons Active</span>
            </div>
          </div>
          <div className="hero-stat-box">
            <Layers className="stat-icon cyan" size={24} />
            <div className="stat-text">
              <span className="stat-value">16%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Input Bar */}
      <div className="search-bar-wrapper glass">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search lessons, structures, or concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="clear-search-btn"
          >
            Clear
          </button>
        )}
      </div>

      {/* Course list */}
      <h2 className="materials-title">Computer Science Syllabus</h2>
      <div className="folder-tree-container">
        {COURSES_DATA.map((course) => (
          <FolderTree
            key={course.id}
            node={course}
            onSelectFile={onStartLesson}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      <style>{`
        .materials-container {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          margin-bottom: 80px; /* Offset mobile nav bar */
          animation: slide-up 0.5s ease;
        }

        @media (min-width: 769px) {
          .materials-container {
            margin-left: 260px; /* Offset desktop sidebar */
            margin-bottom: 24px;
            max-width: 800px;
          }
        }

        .materials-hero {
          border-radius: 24px;
          padding: 20px;
          border: 1px solid var(--border-dim);
          background: linear-gradient(135deg, rgba(20, 27, 45, 0.6) 0%, rgba(9, 13, 22, 0.8) 100%);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .hero-stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          padding: 8px 4px;
        }

        .stat-icon {
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.1));
        }

        .stat-icon.yellow {
          color: var(--neon-warning);
          filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
        }

        .stat-icon.violet {
          color: var(--neon-primary);
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
        }

        .stat-icon.cyan {
          color: var(--neon-secondary);
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
        }

        .stat-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.5);
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-input {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-family: var(--font-sans);
          outline: none;
          width: 100%;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .clear-search-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-secondary);
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .materials-title {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-top: 10px;
          color: var(--text-primary);
          border-left: 4px solid var(--neon-primary);
          padding-left: 10px;
        }

        .folder-tree-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>
    </div>
  )
}
