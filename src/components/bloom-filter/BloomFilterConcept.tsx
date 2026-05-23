import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Lightbulb, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

interface BloomFilterConceptProps {
  onComplete: () => void
}

export const BloomFilterConcept: React.FC<BloomFilterConceptProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const slides = [
    {
      title: '1. What is a Bloom Filter?',
      icon: Sparkles,
      iconColor: 'var(--neon-primary)',
      content: (
        <div className="concept-slide-content">
          <p>Imagine you run a massive social network and need to check if a username is already taken. Querying a database of 1 billion users is slow!</p>
          <p className="highlight-box glass">
            A <strong>Bloom Filter</strong> is a lightning-fast, space-efficient <em>probabilistic</em> data structure. It tells you immediately if an element is <strong>definitely not</strong> in a set, or if it is <strong>probably</strong> in the set.
          </p>
          <div className="concept-visual">
            <div className="visual-database">Database (Slow)</div>
            <div className="visual-divider font-mono">VS</div>
            <div className="visual-bloom-icon pulse">Bloom Filter (Instant, Tiny Memory)</div>
          </div>
        </div>
      )
    },
    {
      title: '2. The Core Memory: Bit Array',
      icon: Lightbulb,
      iconColor: 'var(--neon-secondary)',
      content: (
        <div className="concept-slide-content">
          <p>Under the hood, a Bloom Filter is just a simple **bit array** of size <em>m</em>. When initialized, every single cell is set to <strong>0</strong> (representing empty/false).</p>
          <p>It uses extremely small memory because it doesn't store the actual data (like usernames or strings) — it only stores bits (0 or 1)!</p>
          <div className="concept-visual">
            <div className="concept-bit-array">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => (
                <div key={val} className="concept-bit-cell">
                  <span className="bit-idx">{val}</span>
                  <span className="bit-val font-mono">0</span>
                </div>
              ))}
            </div>
            <span className="visual-caption">An empty Bloom Filter bit array of size m = 8</span>
          </div>
        </div>
      )
    },
    {
      title: '3. Hash Functions',
      icon: RefreshCw,
      iconColor: 'var(--neon-warning)',
      content: (
        <div className="concept-slide-content">
          <p>A Bloom Filter uses <strong>k</strong> independent hash functions. A hash function takes any input string and maps it to a number between <strong>0</strong> and <strong>m - 1</strong>.</p>
          <div className="concept-visual">
            <div className="hash-flow-demo">
              <span className="input-key font-mono">"apple"</span>
              <div className="hash-functions-split">
                <div className="hash-machine-pill glass font-mono">Hash A(x) % 8 ➔ <span className="neon-value cyan">2</span></div>
                <div className="hash-machine-pill glass font-mono">Hash B(x) % 8 ➔ <span className="neon-value violet">5</span></div>
              </div>
            </div>
          </div>
          <p>A good hash function distributes inputs uniformly, minimizing the chance of two different words hitting the exact same index.</p>
        </div>
      )
    },
    {
      title: '4. Inserting Elements',
      icon: Sparkles,
      iconColor: 'var(--neon-success)',
      content: (
        <div className="concept-slide-content">
          <p>To insert an item, run it through all <em>k</em> hash functions to calculate the indices. Flip the bits at those indices to <strong>1</strong>.</p>
          <div className="concept-visual">
            <p className="visual-title">Inserting <span className="font-mono text-neon">"apple"</span> (hashes: 2, 5)</p>
            <div className="concept-bit-array">
              {[0, 0, 1, 0, 0, 1, 0, 0].map((val, idx) => {
                const isActive = idx === 2 || idx === 5
                return (
                  <div key={idx} className={`concept-bit-cell ${isActive ? 'active' : ''}`}>
                    <span className="bit-idx">{idx}</span>
                    <span className="bit-val font-mono">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <p>Notice that we don't store "apple" anywhere. We only flipped the bits at indices 2 and 5 to 1!</p>
        </div>
      )
    },
    {
      title: '5. Querying & False Positives',
      icon: AlertCircle,
      iconColor: 'var(--neon-danger)',
      content: (
        <div className="concept-slide-content">
          <p>To check if an item exists, check the bits at its hash indices:</p>
          <ul className="concept-list">
            <li>If <strong>any</strong> of the bits is <strong>0</strong>, the item is <strong>100% Definite No</strong> (it was never inserted).</li>
            <li>If <strong>all</strong> bits are <strong>1</strong>, the item is <strong>Maybe Yes</strong>.</li>
          </ul>
          <div className="concept-visual">
            <div className="false-positive-card glass">
              <span className="badge badge-cyan">False Positive Demo</span>
              <p className="margin-top-sm">If you query <span className="font-mono text-neon">"banana"</span> (hashes: 2, 5), the filter says "Yes" even if you never inserted it, because those bits were already flipped by "apple"! This is a <strong>False Positive</strong>.</p>
            </div>
          </div>
        </div>
      )
    }
  ]

  const ActiveIcon = slides[currentSlide].icon

  return (
    <div className="concept-container glass">
      {/* ProgressBar */}
      <div className="concept-progress-bar">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`progress-step-dot ${idx === currentSlide ? 'active' : ''} ${idx < currentSlide ? 'completed' : ''}`}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>

      {/* Main Slide Card */}
      <div className="concept-card">
        <div className="slide-title-wrapper">
          <ActiveIcon size={24} style={{ color: slides[currentSlide].iconColor }} />
          <h2 className="slide-title">{slides[currentSlide].title}</h2>
        </div>
        
        <div className="slide-content-wrapper">
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="concept-controls">
        <button 
          className="btn btn-secondary nav-arrow-btn"
          disabled={currentSlide === 0}
          onClick={() => setCurrentSlide(prev => prev - 1)}
        >
          <ArrowLeft size={18} />
          <span>Previous</span>
        </button>

        {currentSlide === slides.length - 1 ? (
          <button className="btn btn-primary nav-arrow-btn" onClick={onComplete}>
            <span>Go to Simulator</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button className="btn btn-primary nav-arrow-btn" onClick={() => setCurrentSlide(prev => prev + 1)}>
            <span>Next</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      <style>{`
        .concept-container {
          padding: 24px;
          border-radius: 24px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.45);
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-height: 480px;
        }

        .concept-progress-bar {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .progress-step-dot {
          height: 6px;
          flex: 1;
          max-width: 50px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .progress-step-dot.active {
          background: var(--neon-primary);
          box-shadow: var(--glow-violet);
        }

        .progress-step-dot.completed {
          background: var(--neon-secondary);
        }

        .concept-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .slide-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-dim);
          padding-bottom: 14px;
        }

        .slide-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .slide-content-wrapper {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .concept-slide-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .highlight-box {
          padding: 16px;
          border-radius: 16px;
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .text-neon {
          color: var(--neon-secondary);
          font-weight: 700;
        }

        .concept-visual {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          border: 1px solid var(--border-dim);
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
        }

        /* Database VS Bloom Visuals */
        .visual-database {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-dim);
          padding: 10px 20px;
          border-radius: 10px;
          color: var(--text-secondary);
          width: 80%;
          text-align: center;
        }

        .visual-bloom-icon {
          background: linear-gradient(135deg, var(--neon-primary), var(--neon-secondary));
          padding: 12px 24px;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 700;
          box-shadow: var(--glow-violet);
          width: 80%;
          text-align: center;
        }

        .pulse {
          animation: pulse-glow 2.5s infinite;
        }

        .visual-divider {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Bit Array Visualizer */
        .concept-bit-array {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          width: 100%;
          max-width: 400px;
        }

        .concept-bit-cell {
          aspect-ratio: 1;
          border: 1px solid var(--border-dim);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.01);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .concept-bit-cell.active {
          background: linear-gradient(135deg, var(--neon-primary), var(--neon-secondary));
          border-color: transparent;
          transform: scale(1.05);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
        }

        .concept-bit-cell.active .bit-val {
          color: #ffffff;
        }

        .bit-idx {
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .bit-val {
          font-weight: 800;
          font-size: 0.95rem;
        }

        .visual-caption {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Hash split demo */
        .hash-flow-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .input-key {
          font-size: 1.1rem;
          color: #ffffff;
          background: rgba(255,255,255,0.05);
          padding: 6px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-dim);
        }

        .hash-functions-split {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .hash-machine-pill {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .neon-value {
          font-weight: 800;
        }

        .neon-value.cyan {
          color: var(--neon-secondary);
          text-shadow: 0 0 5px rgba(6,182,212,0.4);
        }

        .neon-value.violet {
          color: #a78bfa;
          text-shadow: 0 0 5px rgba(139,92,246,0.4);
        }

        .concept-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .false-positive-card {
          padding: 16px;
          border-radius: 12px;
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.03);
          font-size: 0.85rem;
          text-align: left;
        }

        .margin-top-sm {
          margin-top: 8px;
        }

        .concept-controls {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .nav-arrow-btn {
          flex: 1;
          max-width: 160px;
        }

        .nav-arrow-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
