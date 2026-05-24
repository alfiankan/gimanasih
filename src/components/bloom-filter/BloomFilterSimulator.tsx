import React, { useState, useRef } from 'react'
import { Plus, Search, RefreshCw, AlertCircle, ArrowRight, CheckCircle2, HelpCircle, Hash, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BloomFilterSimulatorProps {
  onComplete: () => void
}

interface OperationLog {
  id: number
  type: 'insert' | 'query'
  word: string
  indices: number[]
  result?: 'def-no' | 'prob-yes' | 'actual-yes' | 'false-positive'
  ts: string
}

const BIT_COUNT = 16

const getHashA = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % BIT_COUNT
  return Math.abs(hash)
}

const getHashB = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 17 + str.charCodeAt(i) + 5) % BIT_COUNT
  return Math.abs(hash)
}

const getIndices = (str: string): number[] => {
  if (!str) return []
  const s = str.trim().toLowerCase()
  const a = getHashA(s)
  const b = getHashB(s)
  return Array.from(new Set([a, b])) // deduplicate
}

export const BloomFilterSimulator: React.FC<BloomFilterSimulatorProps> = ({ onComplete }) => {
  const [bitArray, setBitArray] = useState<number[]>(new Array(BIT_COUNT).fill(0))
  const [insertedItems, setInsertedItems] = useState<string[]>([])
  const [inputText, setInputText] = useState<string>('')
  const [lastAction, setLastAction] = useState<{
    type: 'insert' | 'query' | null
    word: string
    indices: number[]
    result?: 'def-no' | 'prob-yes' | 'actual-yes' | 'false-positive'
  }>({ type: null, word: '', indices: [] })
  const [animatingIndices, setAnimatingIndices] = useState<number[]>([])
  const [opLog, setOpLog] = useState<OperationLog[]>([])
  const opIdRef = useRef(0)

  const indicesForInput = inputText ? getIndices(inputText) : []
  const saturation = (bitArray.filter(b => b === 1).length / BIT_COUNT) * 100

  const triggerAnimation = (indices: number[]) => {
    setAnimatingIndices(indices)
    setTimeout(() => setAnimatingIndices([]), 900)
  }

  const addLog = (entry: Omit<OperationLog, 'id' | 'ts'>) => {
    opIdRef.current += 1
    setOpLog(prev => [{
      ...entry,
      id: opIdRef.current,
      ts: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }, ...prev].slice(0, 8))
  }

  const handleInsert = () => {
    const word = inputText.trim()
    if (!word) return
    const indices = getIndices(word)
    const newBitArray = [...bitArray]
    indices.forEach(idx => { newBitArray[idx] = 1 })
    setBitArray(newBitArray)
    setInsertedItems(prev => prev.includes(word) ? prev : [...prev, word])
    setLastAction({ type: 'insert', word, indices })
    triggerAnimation(indices)
    addLog({ type: 'insert', word, indices })
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

    setLastAction({ type: 'query', word, indices, result })
    triggerAnimation(indices)
    addLog({ type: 'query', word, indices, result })
  }

  const handleClear = () => {
    setBitArray(new Array(BIT_COUNT).fill(0))
    setInsertedItems([])
    setLastAction({ type: null, word: '', indices: [] })
    setAnimatingIndices([])
    setOpLog([])
    setInputText('')
  }

  return (
    <div className="flex flex-col gap-5 animate-slide-up w-full select-none">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60">
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="text-muted-foreground">Filter Status:</span>
          <span className="flex items-center gap-1.5 text-neon-primary">
            <span className="w-2 h-2 rounded-full bg-neon-primary animate-pulse inline-block" />
            {insertedItems.length} items inserted
          </span>
          <span className="text-muted-foreground">
            Saturation: <span className={cn(
              "font-black",
              saturation > 70 ? "text-red-400" : saturation > 40 ? "text-amber-400" : "text-emerald-400"
            )}>{saturation.toFixed(0)}%</span>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="h-7 rounded-lg text-[10px] border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300 font-bold cursor-pointer"
        >
          <RefreshCw size={10} />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Bit array + input */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Bit Array Visualizer */}
          <Card glass className="p-5 bg-slate-950/60 border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Bit Array (m = {BIT_COUNT})</span>
              {/* Saturation bar */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground">{saturation.toFixed(0)}% full</span>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", saturation > 70 ? "bg-red-500" : saturation > 40 ? "bg-amber-500" : "bg-neon-primary")}
                    style={{ width: `${saturation}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Hash arrows row */}
            {animatingIndices.length > 0 && (
              <div className="flex gap-1 justify-center text-[9px] font-mono text-amber-400 animate-slide-up">
                {lastAction.type === 'insert' ? (
                  <span>⚡ Flipping bits at positions: <strong>{animatingIndices.join(', ')}</strong></span>
                ) : (
                  <span>🔍 Checking positions: <strong>{animatingIndices.join(', ')}</strong></span>
                )}
              </div>
            )}

            {/* Bit cells */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
              {bitArray.map((bit, idx) => {
                const isTypingHighlight = indicesForInput.includes(idx) && !animatingIndices.length
                const isAnimating = animatingIndices.includes(idx)
                const isLastAction = lastAction.indices.includes(idx) && !animatingIndices.length
                const isQueryResult = lastAction.type === 'query' && isLastAction

                let cellClass = ''
                if (bit === 1) cellClass = 'bg-neon-primary/20 border-neon-primary/50 text-emerald-400'
                else cellClass = 'bg-white/2 border-white/5 text-slate-600'

                if (isTypingHighlight) cellClass = 'bg-amber-500/15 border-amber-500 text-amber-300 scale-110 z-10 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                if (isAnimating) {
                  if (lastAction.type === 'insert') cellClass = 'bg-neon-primary/40 border-neon-primary text-white scale-125 z-10 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  else cellClass = 'bg-amber-500/30 border-amber-500 text-amber-200 scale-115 z-10 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                }
                if (isQueryResult && !isAnimating) {
                  if (lastAction.result === 'def-no') cellClass = `${bit === 1 ? 'bg-neon-primary/20 border-neon-primary/50 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400'}`
                  else cellClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                }

                return (
                  <div
                    key={idx}
                    className={cn(
                      "aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-200 relative",
                      cellClass
                    )}
                  >
                    <span className="text-[7px] leading-none mb-0.5 opacity-50">{idx}</span>
                    <span className="font-mono text-xs font-black leading-none">{bit}</span>
                  </div>
                )
              })}
            </div>

            {/* Hash legend for current input */}
            {indicesForInput.length > 0 && (
              <div className="flex items-center gap-3 text-[9px] font-mono bg-black/20 border border-white/5 rounded-xl px-3 py-2 animate-slide-up">
                <Hash size={10} className="text-amber-400 shrink-0" />
                <span className="text-muted-foreground">"{inputText}" →</span>
                <span className="text-amber-300 font-bold">HashA: {indicesForInput[0]}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-teal-300 font-bold">HashB: {indicesForInput[1] ?? indicesForInput[0]}</span>
                <span className="text-muted-foreground ml-1">bits will be checked/flipped</span>
              </div>
            )}
          </Card>

          {/* Input Controls */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Test the Filter</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a word (e.g. 'apple')"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl bg-slate-950 border border-white/5 text-sm px-4 py-2.5 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-primary transition-colors"
                maxLength={14}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInsert() }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="neon"
                className="rounded-xl h-11 cursor-pointer font-bold"
                onClick={handleInsert}
                disabled={!inputText}
              >
                <Plus size={16} />
                <span>Insert</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-11 bg-white/3 border-white/5 cursor-pointer font-bold text-foreground hover:bg-white/8"
                onClick={handleQuery}
                disabled={!inputText}
              >
                <Search size={16} />
                <span>Query</span>
              </Button>
            </div>

            {/* Feedback card */}
            <div className={cn(
              "rounded-xl p-3.5 border min-h-[60px] flex items-center transition-all duration-300",
              lastAction.type === 'insert' && "border-neon-primary/25 bg-neon-primary/5",
              lastAction.result === 'def-no' && "border-red-500/25 bg-red-500/5",
              lastAction.result === 'actual-yes' && "border-emerald-500/25 bg-emerald-500/5",
              lastAction.result === 'false-positive' && "border-amber-500/25 bg-amber-500/5",
              lastAction.type === null && "border-white/5 bg-black/10",
            )}>
              {lastAction.type === null && (
                <p className="text-xs text-muted-foreground text-center w-full">
                  💡 Try: insert <strong>"apple"</strong> and <strong>"banana"</strong>, then query <strong>"mango"</strong> — you might trigger a false positive!
                </p>
              )}

              {lastAction.type === 'insert' && (
                <div className="flex items-start gap-2.5 w-full animate-slide-up">
                  <CheckCircle2 size={18} className="text-neon-success mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-foreground">
                      ✅ Inserted <span className="font-mono text-neon-secondary">"{lastAction.word}"</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Flipped bits at indices <strong className="text-white">{lastAction.indices.join(' & ')}</strong> to 1. The word itself is NOT stored.
                    </p>
                  </div>
                </div>
              )}

              {lastAction.result === 'def-no' && (
                <div className="flex items-start gap-2.5 w-full animate-slide-up">
                  <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-foreground">
                      🚫 <span className="font-mono text-red-300">"{lastAction.word}"</span> is <strong>DEFINITELY NOT</strong> in the set
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Checked bits at {lastAction.indices.map(i => `[${i}]=${bitArray[i]}`).join(', ')}. A <strong className="text-white">0</strong> means it was never inserted. No DB query needed!
                    </p>
                  </div>
                </div>
              )}

              {lastAction.result === 'actual-yes' && (
                <div className="flex items-start gap-2.5 w-full animate-slide-up">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-foreground">
                      ✅ <span className="font-mono text-emerald-300">"{lastAction.word}"</span> is <strong>PROBABLY IN</strong> the set (verified!)
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      All bits at {lastAction.indices.join(', ')} are 1 — and we did insert this word. True positive!
                    </p>
                  </div>
                </div>
              )}

              {lastAction.result === 'false-positive' && (
                <div className="flex items-start gap-2.5 w-full animate-slide-up">
                  <HelpCircle size={18} className="text-amber-400 mt-0.5 shrink-0 animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-foreground">
                      ⚠️ <strong className="text-amber-300">FALSE POSITIVE!</strong> Filter says maybe, but <span className="font-mono text-amber-300">"{lastAction.word}"</span> was never inserted
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Bits at {lastAction.indices.join(', ')} were already flipped by other words. Classic bloom filter trade-off!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right panel: inserted items + operation log */}
        <div className="flex flex-col gap-4">
          {/* Inserted items */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-2.5">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Inserted Items ({insertedItems.length})</span>
            {insertedItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic font-mono">[ empty set ]</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {insertedItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neon-primary/10 border border-neon-primary/20 text-emerald-300 font-bold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[9px] text-muted-foreground leading-relaxed border-t border-white/5 pt-2">
              💡 Only bits are stored in the filter — the actual words above are shown for learning purposes only.
            </p>
          </Card>

          {/* Operation Log */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-2.5 flex-grow">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Operation Log</span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px] font-mono text-[9px]">
              {opLog.length === 0 ? (
                <span className="text-muted-foreground italic">[ no operations yet ]</span>
              ) : (
                opLog.map(op => (
                  <div key={op.id} className={cn(
                    "p-2 rounded-lg border flex flex-col gap-0.5 animate-slide-up",
                    op.type === 'insert' && "border-neon-primary/20 bg-neon-primary/5",
                    op.result === 'def-no' && "border-red-500/20 bg-red-500/5",
                    op.result === 'actual-yes' && "border-emerald-500/20 bg-emerald-500/5",
                    op.result === 'false-positive' && "border-amber-500/20 bg-amber-500/5",
                  )}>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-extrabold text-[9px] uppercase",
                        op.type === 'insert' && "text-neon-primary",
                        op.result === 'def-no' && "text-red-400",
                        op.result === 'actual-yes' && "text-emerald-400",
                        op.result === 'false-positive' && "text-amber-400",
                      )}>
                        {op.type === 'insert' ? '+ INSERT' :
                          op.result === 'def-no' ? '✗ NOT FOUND' :
                          op.result === 'actual-yes' ? '✓ FOUND' : '⚠ FALSE POS'}
                      </span>
                      <span className="text-muted-foreground text-[8px]">{op.ts}</span>
                    </div>
                    <span className="text-slate-300">"{op.word}" → bits [{op.indices.join(', ')}]</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Continue button */}
      <div className="flex justify-end">
        <Button
          variant="neon-secondary"
          size="lg"
          className="rounded-xl h-11 px-6 cursor-pointer text-sm font-bold"
          onClick={onComplete}
        >
          <Zap size={16} />
          <span>Continue to Challenge</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}
