import React, { useState } from 'react'
import { Plus, Search, RefreshCw, AlertCircle, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react'

interface BloomFilterSimulatorProps {
  onComplete: () => void
}

export const BloomFilterSimulator: React.FC<BloomFilterSimulatorProps> = ({ onComplete }) => {
  const [bitArray, setBitArray] = useState<number[]>(new Array(16).fill(0))
  const [insertedItems, setInsertedItems] = useState<string[]>([])
  const [inputText, setInputText] = useState<string>('')
  
  // Simulation details
  const [lastAction, setLastAction] = useState<{
    type: 'insert' | 'query' | 'clear' | null
    word: string
    indices: number[]
    result?: 'def-no' | 'prob-yes' | 'actual-yes' | 'false-positive'
  }>({ type: null, word: '', indices: [] })

  // Simplified visual hash functions
  const getHashA = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 16
    }
    return Math.abs(hash)
  }

  const getHashB = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 17 + str.charCodeAt(i) + 5) % 16
    }
    return Math.abs(hash)
  }

  const getIndices = (str: string): number[] => {
    if (!str) return []
    const cleanStr = str.trim().toLowerCase()
    return [getHashA(cleanStr), getHashB(cleanStr)]
  }

  const handleInsert = () => {
    const word = inputText.trim()
    if (!word) return

    const indices = getIndices(word)
    const newBitArray = [...bitArray]
    indices.forEach(idx => {
      newBitArray[idx] = 1
    })

    setBitArray(newBitArray)
    setInsertedItems(prev => {
      if (prev.includes(word)) return prev
      return [...prev, word]
    })
    setLastAction({
      type: 'insert',
      word,
      indices
    })
    setInputText('')
  }

  const handleQuery = () => {
    const word = inputText.trim()
    if (!word) return

    const indices = getIndices(word)
    const allBitsSet = indices.every(idx => bitArray[idx] === 1)
    const isInserted = insertedItems.some(item => item.toLowerCase() === word.toLowerCase())

    let result: 'def-no' | 'prob-yes' | 'actual-yes' | 'false-positive'
    if (!allBitsSet) {
      result = 'def-no'
    } else if (isInserted) {
      result = 'actual-yes'
    } else {
      result = 'false-positive'
    }

    setLastAction({
      type: 'query',
      word,
      indices,
      result
    })
  }

  const handleClear = () => {
    setBitArray(new Array(16).fill(0))
    setInsertedItems([])
    setLastAction({ type: 'clear', word: '', indices: [] })
    setInputText('')
  }

  const indicesForInput = inputText ? getIndices(inputText) : []

  return (
    <div className="simulator-container glass">
      <div className="sim-header">
        <h3 className="sim-title">Interactive Sandbox</h3>
        <button className="clear-btn font-mono" onClick={handleClear}>
          <RefreshCw size={14} />
          Reset Array
        </button>
      </div>

      {/* Bit Array Visualizer */}
      <div className="sim-visualization-card">
        <span className="section-label">16-Bit Array (m = 16)</span>
        <div className="bit-tape">
          {bitArray.map((bit, idx) => {
            // Check if this cell is highlighted by current typing
            const isHighlightedByTyping = indicesForInput.includes(idx)
            // Check if this cell was used in the last action
            const isHighlightedByAction = lastAction.indices.includes(idx)
            
            let cellClass = ''
            if (bit === 1) cellClass += ' active'
            if (isHighlightedByTyping) cellClass += ' highlight-pulse'
            else if (isHighlightedByAction && lastAction.type === 'query') {
              if (lastAction.result === 'def-no') cellClass += ' query-danger'
              else cellClass += ' query-success'
            }

            return (
              <div key={idx} className={`bit-cell ${cellClass}`}>
                <span className="bit-index-label">{idx}</span>
                <span className="bit-cell-value font-mono">{bit}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Inputs Area */}
      <div className="sim-controls-layout">
        <div className="input-field-wrapper">
          <input
            type="text"
            placeholder="Type a word (e.g. 'gems')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="sim-input"
            maxLength={12}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert()
            }}
          />
          {inputText && (
            <div className="live-hash-indicator font-mono">
              <span>A: h({inputText}) % 16 = <strong className="violet">{indicesForInput[0]}</strong></span>
              <span>•</span>
              <span>B: h({inputText}) % 16 = <strong className="cyan">{indicesForInput[1]}</strong></span>
            </div>
          )}
        </div>

        <div className="sim-btn-row">
          <button 
            className="btn btn-primary sim-action-btn"
            onClick={handleInsert}
            disabled={!inputText}
          >
            <Plus size={18} />
            <span>Insert</span>
          </button>
          <button 
            className="btn btn-secondary sim-action-btn"
            onClick={handleQuery}
            disabled={!inputText}
          >
            <Search size={18} />
            <span>Query</span>
          </button>
        </div>
      </div>

      {/* Simulation Feedback Card */}
      <div className="sim-feedback-box">
        {lastAction.type === 'insert' && (
          <div className="action-feedback insert-ok">
            <CheckCircle2 className="feedback-icon green" size={20} />
            <div>
              <p className="feedback-desc">
                Successfully inserted <strong className="font-mono">"{lastAction.word}"</strong> into filter.
              </p>
              <p className="feedback-subtext">
                Hash index values: <strong>{lastAction.indices[0]}</strong> and <strong>{lastAction.indices[1]}</strong> flipped to <strong>1</strong>.
              </p>
            </div>
          </div>
        )}

        {lastAction.type === 'query' && lastAction.result === 'def-no' && (
          <div className="action-feedback query-no">
            <AlertCircle className="feedback-icon red" size={20} />
            <div>
              <p className="feedback-desc">
                Query Result for <strong className="font-mono">"{lastAction.word}"</strong>: <strong>DEFINITELY NOT IN SET</strong>
              </p>
              <p className="feedback-subtext">
                Indices checked: {lastAction.indices.map((idx, i) => (
                  <span key={i} className="inline-check-idx">
                    Index {idx} ({bitArray[idx]})
                  </span>
                ))}. Since at least one checked cell is <strong>0</strong>, it is mathematically impossible for the item to be in the set.
              </p>
            </div>
          </div>
        )}

        {lastAction.type === 'query' && lastAction.result === 'actual-yes' && (
          <div className="action-feedback query-yes">
            <CheckCircle2 className="feedback-icon green" size={20} />
            <div>
              <p className="feedback-desc">
                Query Result for <strong className="font-mono">"{lastAction.word}"</strong>: <strong>PROBABLY IN SET (Verified)</strong>
              </p>
              <p className="feedback-subtext">
                All checked bit cells ({lastAction.indices.join(', ')}) are set to <strong>1</strong>. The item is verified in the set because it was previously inserted.
              </p>
            </div>
          </div>
        )}

        {lastAction.type === 'query' && lastAction.result === 'false-positive' && (
          <div className="action-feedback query-warning">
            <HelpCircle className="feedback-icon orange animate-pulse" size={20} />
            <div>
              <p className="feedback-desc">
                Query Result for <strong className="font-mono">"{lastAction.word}"</strong>: <strong>MAYBE IN SET (False Positive!)</strong>
              </p>
              <p className="feedback-subtext">
                All checked bit cells ({lastAction.indices.join(', ')}) are set to <strong>1</strong>, but <strong className="font-mono">"{lastAction.word}"</strong> was **never inserted**! The bits were flipped by other words. This is a false positive!
              </p>
            </div>
          </div>
        )}

        {lastAction.type === null && (
          <p className="feedback-placeholder">
            Type a word to test. Try inserting "apple" and "google", then query "micro" to see if you can trigger a false positive!
          </p>
        )}
      </div>

      {/* Inserted Items Panel */}
      <div className="sim-inserted-items">
        <span className="section-label">Actual elements in Set ({insertedItems.length})</span>
        {insertedItems.length === 0 ? (
          <p className="empty-set font-mono">[ Empty Set ]</p>
        ) : (
          <div className="items-pills-list">
            {insertedItems.map((item, idx) => (
              <span key={idx} className="inserted-pill font-mono glass">{item}</span>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-primary continue-lesson-btn" onClick={onComplete}>
        <span>Play the Challenge Game</span>
        <ArrowRight size={18} />
      </button>

      <style>{`
        .simulator-container {
          padding: 20px;
          border-radius: 24px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.45);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sim-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .clear-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .clear-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--neon-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          display: block;
        }

        .bit-tape {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          width: 100%;
          background: rgba(0,0,0,0.25);
          padding: 8px;
          border-radius: 14px;
          border: 1px solid var(--border-dim);
        }

        .bit-cell {
          aspect-ratio: 1;
          border: 1px solid var(--border-dim);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.01);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .bit-cell.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: inset 0 0 10px rgba(139, 92, 246, 0.2);
        }

        .bit-cell.active .bit-cell-value {
          color: #a78bfa;
        }

        .bit-cell.highlight-pulse {
          animation: pulse-glow 1.5s infinite;
          border-color: var(--neon-secondary);
          transform: scale(1.05);
          z-index: 2;
        }

        .bit-cell.query-success {
          background: rgba(16, 185, 129, 0.25);
          border-color: var(--neon-success);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
          transform: scale(1.05);
        }

        .bit-cell.query-danger {
          background: rgba(239, 68, 68, 0.25);
          border-color: var(--neon-danger);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
          transform: scale(1.05);
        }

        .bit-index-label {
          font-size: 0.55rem;
          color: var(--text-muted);
          margin-bottom: 1px;
        }

        .bit-cell-value {
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        /* Controls Layout */
        .sim-controls-layout {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-field-wrapper {
          position: relative;
          width: 100%;
        }

        .sim-input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-dim);
          color: #ffffff;
          padding: 16px;
          border-radius: 14px;
          font-size: 1rem;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color 0.2s ease;
        }

        .sim-input:focus {
          border-color: var(--neon-primary);
        }

        .live-hash-indicator {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(13, 20, 35, 0.85);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-dim);
        }

        .live-hash-indicator .violet {
          color: #a78bfa;
        }

        .live-hash-indicator .cyan {
          color: #22d3ee;
        }

        .sim-btn-row {
          display: flex;
          gap: 10px;
        }

        .sim-action-btn {
          flex: 1;
          border-radius: 12px;
        }

        /* Feedback box styling */
        .sim-feedback-box {
          min-height: 70px;
          border-radius: 14px;
          padding: 16px;
          background: rgba(0,0,0,0.15);
          border: 1px solid var(--border-dim);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feedback-placeholder {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.4;
        }

        .action-feedback {
          display: flex;
          gap: 12px;
          width: 100%;
          align-items: flex-start;
        }

        .feedback-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feedback-icon.green {
          color: var(--neon-success);
        }

        .feedback-icon.red {
          color: var(--neon-danger);
        }

        .feedback-icon.orange {
          color: var(--neon-warning);
        }

        .feedback-desc {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .feedback-subtext {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }

        .inline-check-idx {
          display: inline-block;
          background: rgba(255,255,255,0.04);
          padding: 1px 4px;
          border-radius: 4px;
          margin: 0 2px;
          border: 1px solid var(--border-dim);
        }

        /* Set panel */
        .sim-inserted-items {
          background: rgba(0,0,0,0.15);
          border: 1px solid var(--border-dim);
          border-radius: 14px;
          padding: 14px;
        }

        .empty-set {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .items-pills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .inserted-pill {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 6px;
          color: var(--text-primary);
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }

        .continue-lesson-btn {
          width: 100%;
          border-radius: 16px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  )
}
