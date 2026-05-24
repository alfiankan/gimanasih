import React, { useState } from 'react'
import { Plus, Search, RefreshCw, AlertCircle, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <Card 
      glass
      className="simulator-container p-5 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col gap-5 select-none"
    >
      <div className="sim-header flex justify-between items-center">
        <h3 className="sim-title text-base font-extrabold text-foreground">Interactive Sandbox</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="clear-btn bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 font-mono text-[10px] rounded-lg px-2.5 h-8 flex items-center gap-1.5 cursor-pointer transition-all duration-200"
        >
          <RefreshCw size={12} />
          Reset Array
        </Button>
      </div>

      {/* Bit Array Visualizer */}
      <div className="sim-visualization-card flex flex-col gap-2">
        <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block">
          16-Bit Array (m = 16)
        </span>
        <div className="bit-tape grid grid-cols-8 sm:grid-cols-16 gap-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
          {bitArray.map((bit, idx) => {
            const isHighlightedByTyping = indicesForInput.includes(idx)
            const isHighlightedByAction = lastAction.indices.includes(idx)
            
            let borderStyle = 'border-white/5'
            let bgStyle = 'bg-white/2'
            let textStyle = 'text-muted-foreground'
            let animateClass = ''

            if (bit === 1) {
              bgStyle = 'bg-neon-primary/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
              borderStyle = 'border-neon-primary/50'
              textStyle = 'text-emerald-400 font-extrabold'
            }

            if (isHighlightedByTyping) {
              borderStyle = 'border-neon-secondary'
              animateClass = 'animate-pulse scale-[1.03] z-10'
            } else if (isHighlightedByAction && lastAction.type === 'query') {
              if (lastAction.result === 'def-no') {
                bgStyle = 'bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                borderStyle = 'border-neon-danger'
                textStyle = 'text-red-400 font-extrabold'
              } else {
                bgStyle = 'bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                borderStyle = 'border-neon-success'
                textStyle = 'text-emerald-400 font-extrabold'
              }
              animateClass = 'scale-[1.03] z-10'
            }

            return (
              <div 
                key={idx} 
                className={cn(
                  "bit-cell aspect-square rounded-lg flex flex-col items-center justify-center border transition-all duration-200",
                  bgStyle,
                  borderStyle,
                  animateClass
                )}
              >
                <span className="bit-index-label text-[8px] text-muted-foreground mb-0.5">{idx}</span>
                <span className={cn("bit-cell-value font-mono text-xs", textStyle)}>{bit}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Inputs Area */}
      <div className="sim-controls-layout flex flex-col gap-3">
        <div className="input-field-wrapper relative w-full flex items-center">
          <Input
            type="text"
            placeholder="Type a word (e.g. 'gems')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="sim-input h-12 pr-44 rounded-2xl bg-slate-950/40 border-white/5 text-sm"
            maxLength={12}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert()
            }}
          />
          {inputText && (
            <div className="live-hash-indicator absolute right-3 font-mono text-[9px] text-slate-400 bg-slate-950 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none select-none">
              <span>A: <strong className="text-emerald-400">{indicesForInput[0]}</strong></span>
              <span className="text-muted-foreground">•</span>
              <span>B: <strong className="text-teal-400">{indicesForInput[1]}</strong></span>
            </div>
          )}
        </div>

        <div className="sim-btn-row flex gap-2 w-full">
          <Button 
            variant="neon"
            className="sim-action-btn flex-1 rounded-2xl h-11 cursor-pointer"
            onClick={handleInsert}
            disabled={!inputText}
          >
            <Plus size={18} />
            <span>Insert</span>
          </Button>
          
          <Button 
            variant="outline"
            className="sim-action-btn flex-1 rounded-2xl h-11 bg-white/3 border-white/5 cursor-pointer font-bold text-foreground"
            onClick={handleQuery}
            disabled={!inputText}
          >
            <Search size={18} />
            <span>Query</span>
          </Button>
        </div>
      </div>

      {/* Simulation Feedback Card */}
      <Card className="sim-feedback-box min-h-[72px] rounded-2xl p-4 bg-black/10 border-white/5 flex items-center justify-center">
        {lastAction.type === 'insert' && (
          <div className="action-feedback flex items-start gap-3 w-full">
            <CheckCircle2 className="feedback-icon text-neon-success mt-0.5" size={20} />
            <div className="flex flex-col gap-0.5">
              <p className="feedback-desc text-xs md:text-sm font-bold text-foreground">
                Successfully inserted <strong className="font-mono text-neon-secondary">"{lastAction.word}"</strong> into filter.
              </p>
              <p className="feedback-subtext text-[10px] md:text-xs text-muted-foreground leading-normal">
                Hash index values: <strong>{lastAction.indices[0]}</strong> and <strong>{lastAction.indices[1]}</strong> flipped to <strong>1</strong>.
              </p>
            </div>
          </div>
        )}

        {lastAction.type === 'query' && lastAction.result === 'def-no' && (
          <div className="action-feedback flex items-start gap-3 w-full animate-slide-up">
            <AlertCircle className="feedback-icon text-neon-danger mt-0.5" size={20} />
            <div className="flex flex-col gap-0.5">
              <p className="feedback-desc text-xs md:text-sm font-bold text-foreground">
                Query Result for <strong className="font-mono">"{lastAction.word}"</strong>: <strong>DEFINITELY NOT IN SET</strong>
              </p>
              <p className="feedback-subtext text-[10px] md:text-xs text-muted-foreground leading-normal">
                Indices checked: {lastAction.indices.map((idx, i) => (
                  <span key={i} className="inline-block bg-white/3 px-1.5 py-0.5 rounded border border-white/5 mx-0.5 text-[9px] font-mono">
                    Index {idx} ({bitArray[idx]})
                  </span>
                ))}. Since at least one checked cell is <strong>0</strong>, it is mathematically impossible for the item to be in the set.
              </p>
            </div>
          </div>
        )}

        {lastAction.type === 'query' && lastAction.result === 'actual-yes' && (
          <div className="action-feedback flex items-start gap-3 w-full animate-slide-up">
            <CheckCircle2 className="feedback-icon text-neon-success mt-0.5" size={20} />
            <div className="flex flex-col gap-0.5">
              <p className="feedback-desc text-xs md:text-sm font-bold text-foreground">
                Query Result for <strong className="font-mono">"{lastAction.word}"</strong>: <strong>PROBABLY IN SET (Verified)</strong>
              </p>
              <p className="feedback-subtext text-[10px] md:text-xs text-muted-foreground leading-normal">
                All checked bit cells ({lastAction.indices.join(', ')}) are set to <strong>1</strong>. The item is verified in the set because it was previously inserted.
              </p>
            </div>
          </div>
        )}

        {lastAction.type === 'query' && lastAction.result === 'false-positive' && (
          <div className="action-feedback flex items-start gap-3 w-full animate-slide-up">
            <HelpCircle className="feedback-icon text-neon-warning mt-0.5 animate-pulse" size={20} />
            <div className="flex flex-col gap-0.5">
              <p className="feedback-desc text-xs md:text-sm font-bold text-foreground">
                Query Result for <strong className="font-mono">"{lastAction.word}"</strong>: <strong>MAYBE IN SET (False Positive!)</strong>
              </p>
              <p className="feedback-subtext text-[10px] md:text-xs text-muted-foreground leading-normal">
                All checked bit cells ({lastAction.indices.join(', ')}) are set to <strong>1</strong>, but <strong className="font-mono">"{lastAction.word}"</strong> was <strong>never inserted</strong>! The bits were flipped by other words. This is a false positive!
              </p>
            </div>
          </div>
        )}

        {lastAction.type === null && (
          <p className="feedback-placeholder text-xs text-muted-foreground leading-relaxed text-center">
            Type a word to test. Try inserting "apple" and "google", then query "micro" to see if you can trigger a false positive!
          </p>
        )}
      </Card>

      {/* Inserted Items Panel */}
      <div className="sim-inserted-items bg-black/10 border border-white/5 rounded-2xl p-4">
        <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block mb-2">
          Actual elements in Set ({insertedItems.length})
        </span>
        {insertedItems.length === 0 ? (
          <p className="empty-set font-mono text-xs text-muted-foreground select-none">[ Empty Set ]</p>
        ) : (
          <div className="items-pills-list flex flex-wrap gap-1.5">
            {insertedItems.map((item, idx) => (
              <span key={idx} className="inserted-pill text-xs font-mono px-2.5 py-1 rounded-lg text-slate-300 bg-white/3 border border-white/5 select-none">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button 
        variant="neon-secondary" 
        size="lg"
        className="w-full rounded-2xl py-6 cursor-pointer text-base"
        onClick={onComplete}
      >
        <span>Play the Challenge Game</span>
        <ArrowRight size={18} />
      </Button>
    </Card>
  )
}
