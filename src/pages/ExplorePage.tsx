import React, { useState, useEffect, useRef } from 'react'
import { ExploreCard, type LessonData } from '../components/ExploreCard'
import { Sparkles, ArrowDown } from 'lucide-react'

interface ExplorePageProps {
  onStartLesson: (lessonId: string) => void
}

const INITIAL_LESSONS: LessonData[] = [
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    category: 'Probabilistic Structures',
    difficulty: 'Intermediate',
    duration: '12 mins',
    xp: 250,
    description: 'Learn how to test set membership in constant time and zero memory using multiple hash functions. Explore why false positives happen!',
    visualType: 'bloom'
  },
  {
    id: 'binary-search-tree',
    title: 'Binary Search Tree',
    category: 'Trees & Searching',
    difficulty: 'Beginner',
    duration: '8 mins',
    xp: 150,
    description: 'Discover how binary trees organize data for logarithmic searching. Visualize insertions, lookups, and traversals step-by-step.',
    visualType: 'bst'
  },
  {
    id: 'hash-tables',
    title: 'Hash Tables',
    category: 'Key-Value Mapping',
    difficulty: 'Beginner',
    duration: '10 mins',
    xp: 200,
    description: 'Deconstruct how hash functions map keys directly to array buckets. Master collisions, linear probing, and bucket chaining.',
    visualType: 'hashing'
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'Sorting Algorithms',
    difficulty: 'Intermediate',
    duration: '15 mins',
    xp: 300,
    description: 'Master the divide-and-conquer paradigm. Trace the pivot selection, partitioning, and recursive sorting array updates.',
    visualType: 'sort'
  }
]

const INFINITE_LESSONS: LessonData[] = [
  {
    id: 'dijkstra',
    title: "Dijkstra's Shortest Path",
    category: 'Graph Algorithms',
    difficulty: 'Advanced',
    duration: '18 mins',
    xp: 400,
    description: 'Find the absolute shortest route in a weighted network. Trace nodes in a priority queue as boundaries expand.',
    visualType: 'graph'
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    duration: '16 mins',
    xp: 350,
    description: 'Scale databases horizontally! Learn how hashing nodes onto a circular ring minimizes data movement when servers go offline.',
    visualType: 'hashing'
  },
  {
    id: 'raft-consensus',
    title: 'Raft Consensus',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    duration: '25 mins',
    xp: 500,
    description: 'Unpack how machines agree in a distributed cluster. Dive into leader elections, log replication, and split-brain resolution.',
    visualType: 'graph'
  }
]

export const ExplorePage: React.FC<ExplorePageProps> = ({ onStartLesson }) => {
  const [lessons, setLessons] = useState<LessonData[]>(INITIAL_LESSONS)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Infinite scroll listener
  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return

    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef.current
    
    // If scrolled close to the bottom (within 100px)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreLessons()
    }
  }

  const loadMoreLessons = () => {
    setIsLoading(true)
    
    // Simulate API delay for infinite pagination
    setTimeout(() => {
      setLessons((prev) => {
        const nextLessons = INFINITE_LESSONS.slice(prev.length - INITIAL_LESSONS.length, prev.length - INITIAL_LESSONS.length + 2)
        if (nextLessons.length === 0) {
          setHasMore(false)
          return prev
        }
        return [...prev, ...nextLessons]
      })
      setIsLoading(false)
    }, 1200)
  }

  // Double scroll safety check on resize or initialization
  useEffect(() => {
    handleScroll()
  }, [])

  return (
    <div className="explore-container">
      {/* Top Banner / Feed Indicator */}
      <header className="explore-header">
        <div className="explore-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Daily Algorithm Feed</span>
        </div>
        <div className="scroll-indicator">
          <span>Scroll down for more</span>
          <ArrowDown size={14} className="bounce-arrow" />
        </div>
      </header>

      {/* Snap Scroll Feed */}
      <div 
        className="explore-feed" 
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {lessons.map((lesson) => (
          <ExploreCard 
            key={lesson.id} 
            lesson={lesson} 
            onStart={onStartLesson} 
          />
        ))}

        {/* Loading card at the end */}
        {isLoading && (
          <div className="explore-slide">
            <div className="loading-card glass">
              <div className="spinner"></div>
              <p>Fetching next challenge...</p>
            </div>
          </div>
        )}

        {!hasMore && (
          <div className="explore-slide">
            <div className="end-feed-card glass">
              <h3>🏆 You've reached the edge!</h3>
              <p>Check the Materials tab to view the complete computer science catalog.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .explore-container {
          width: 100%;
          height: 100%;
          position: relative;
          background: var(--bg-deep);
        }

        .explore-header {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          pointer-events: none;
        }

        .explore-badge {
          background: rgba(139, 92, 246, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 8px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #c084fc;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          pointer-events: auto;
        }

        .sparkle-icon {
          animation: pulse-glow 2s infinite;
        }

        .scroll-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(0,0,0,0.4);
          padding: 6px 12px;
          border-radius: 10px;
          backdrop-filter: blur(8px);
        }

        .bounce-arrow {
          animation: float 1.5s infinite ease-in-out;
        }

        .loading-card, .end-feed-card {
          width: 100%;
          max-width: 420px;
          height: 100%;
          max-height: 640px;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          border: 1px solid var(--border-dim);
          text-align: center;
          gap: 16px;
          background: rgba(13, 20, 35, 0.4);
        }

        @media (max-height: 700px) {
          .loading-card, .end-feed-card {
            max-height: 520px;
          }
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          border-top-color: var(--neon-primary);
          animation: spin 1s linear infinite;
        }

        .end-feed-card h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .end-feed-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Offset Explore Container when bottom bar is present */
        @media (max-width: 768px) {
          .explore-container {
            padding-bottom: 76px;
          }
          .explore-feed {
            height: calc(100vh - 76px);
            height: calc(100svh - 76px);
          }
        }
      `}</style>
    </div>
  )
}
