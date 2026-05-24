import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Lightbulb, AlertCircle, RefreshCw, Brain, Plus, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const KHashInteractiveWidget: React.FC = () => {
  const [k, setK] = useState<number>(3);
  const m = 16;
  const words = ['apple', 'banana', 'cherry'];

  // Calculate hashes
  const getHashesForWord = (word: string, hashCount: number): number[] => {
    // Simple deterministic hashing
    const hashIndices: number[] = [];
    let baseHash = 0;
    for (let i = 0; i < word.length; i++) {
      baseHash = (baseHash * 33 + word.charCodeAt(i)) % 509;
    }
    for (let i = 0; i < hashCount; i++) {
      const idx = (baseHash + i * 7) % m;
      hashIndices.push(idx);
    }
    return hashIndices;
  };

  const wordHashes = words.map(w => ({
    word: w,
    indices: getHashesForWord(w, k)
  }));

  // Active bits in the array
  const activeBits = new Set<number>();
  wordHashes.forEach(item => {
    item.indices.forEach(idx => activeBits.add(idx));
  });

  const saturation = (activeBits.size / m) * 100;

  // Theoretical False Positive Probability: (1 - e^(-k * n / m))^k
  // n = 3 elements
  const n = 3;
  const fpp = Math.pow(1 - Math.exp(-k * n / m), k) * 100;

  return (
    <div className="flex flex-col gap-4 bg-black/20 border border-white/5 rounded-2xl p-4 text-left select-none animate-slide-up mt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Number of Hash Functions (k) = <span className="text-neon-secondary text-sm font-black">{k}</span>
          </label>
          <span className="text-[10px] text-muted-foreground">Adjust k to see how bit saturation and False Positive Rate shift.</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="8" 
          value={k} 
          onChange={(e) => setK(parseInt(e.target.value))}
          className="w-full sm:w-[150px] accent-neon-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
        />
      </div>

      {/* Bit Array Visualizer */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bit Array (m = 16)</span>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 w-full">
          {Array.from({ length: m }).map((_, idx) => {
            const isActive = activeBits.has(idx);
            return (
              <div 
                key={idx} 
                className={cn(
                  "aspect-square rounded border border-white/5 flex flex-col items-center justify-center text-[10px] transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-neon-primary to-neon-secondary border-transparent scale-105 shadow-[0_0_8px_rgba(16,185,129,0.3)] text-white" 
                    : "bg-white/2 text-muted-foreground"
                )}
              >
                <span className="opacity-50 text-[7px] leading-none mb-0.5">{idx}</span>
                <span className="font-mono font-bold leading-none">{isActive ? '1' : '0'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Hash Map Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {wordHashes.map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-300">"{item.word}" hashes:</span>
            <div className="flex flex-wrap gap-1">
              {item.indices.map((val, i) => (
                <span key={i} className="font-mono text-[9px] px-1.5 py-0.5 bg-white/5 rounded border border-white/5 font-extrabold text-neon-secondary">
                  {val}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tradeoff Explainer Stats */}
      <div className="grid grid-cols-2 gap-3 mt-1 border-t border-white/5 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Bit Saturation</span>
          <span className="text-base font-black text-white">{activeBits.size} / 16 ({saturation.toFixed(0)}%)</span>
          <span className="text-[9px] text-slate-400">
            {k <= 2 && 'Low saturation. Fast lookup, but overlaps can happen.'}
            {k >= 3 && k <= 5 && 'Optimal balance! Half of the bits are active.'}
            {k >= 6 && 'Too high! Array is saturated, false positive risk goes up.'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">False Positive Rate</span>
          <span className={cn(
            "text-base font-black transition-colors duration-200",
            fpp < 15 ? "text-neon-success" : fpp < 25 ? "text-neon-warning" : "text-neon-danger"
          )}>
            {fpp.toFixed(1)}%
          </span>
          <span className="text-[9px] text-slate-400">
            Probability of a false match query after inserting 3 items.
          </span>
        </div>
      </div>
    </div>
  );
};

interface BloomFilterConceptProps {
  onComplete: () => void
}

export const BloomFilterConcept: React.FC<BloomFilterConceptProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const slides = [
    {
      title: '1. What is a Bloom Filter?',
      icon: Brain,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Imagine you run a massive social network and need to check if a username is already taken. Querying a database of 1 billion users is slow!
          </p>
          <div className="highlight-box p-4 rounded-xl border border-neon-primary/20 bg-neon-primary/5 text-sm md:text-base leading-relaxed text-foreground">
            A <strong>Bloom Filter</strong> is a lightning-fast, space-efficient <em>probabilistic</em> data structure. It tells you immediately if an element is <strong>definitely not</strong> in a set, or if it is <strong>probably</strong> in the set.
          </div>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 mt-2 select-none">
            <div className="visual-database w-4/5 text-center text-xs md:text-sm text-slate-400 bg-white/5 border border-white/5 py-2.5 rounded-xl font-semibold">
              Database (Slow)
            </div>
            <div className="visual-divider font-mono text-[10px] text-muted-foreground font-bold">VS</div>
            <div className="visual-bloom-icon w-4/5 text-center text-xs md:text-sm text-white bg-gradient-to-r from-neon-primary to-neon-secondary py-3 rounded-xl font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
              Bloom Filter (Instant, Tiny Memory)
            </div>
          </div>
        </div>
      )
    },
    {
      title: '2. The Core Memory: Bit Array',
      icon: Lightbulb,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Under the hood, a Bloom Filter is just a simple <strong>bit array</strong> of size <em>m</em>. When initialized, every single cell is set to <strong>0</strong> (representing empty/false).
          </p>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            It uses extremely small memory because it doesn't store the actual data (like usernames or strings) — it only stores bits (0 or 1)!
          </p>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 mt-2 select-none">
            <div className="concept-bit-array grid grid-cols-8 gap-1.5 w-full max-w-[400px]">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => (
                <div key={val} className="concept-bit-cell aspect-square border border-white/5 rounded-lg flex flex-col items-center justify-center bg-white/2">
                  <span className="bit-idx text-[8px] text-muted-foreground mb-0.5">{val}</span>
                  <span className="bit-val font-mono text-sm font-extrabold text-foreground">0</span>
                </div>
              ))}
            </div>
            <span className="visual-caption text-xs text-muted-foreground">An empty Bloom Filter bit array of size m = 8</span>
          </div>
        </div>
      )
    },
    {
      title: '3. Hash Functions',
      icon: RefreshCw,
      iconColor: 'text-neon-warning',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            A Bloom Filter uses <strong>k</strong> independent hash functions. A hash function takes any input string and maps it to a number between <strong>0</strong> and <strong>m - 1</strong>.
          </p>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 mt-2 select-none">
            <div className="hash-flow-demo flex flex-col items-center gap-3.5 w-full">
              <span className="input-key font-mono text-white bg-white/5 border border-white/5 px-4 py-1.5 rounded-lg text-sm font-bold">"apple"</span>
              <div className="hash-functions-split flex flex-col gap-2 w-full">
                <div className="hash-machine-pill p-3 border border-white/5 rounded-xl bg-slate-900/50 flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Hash A(x) % 8 ➔</span>
                  <span className="neon-value text-neon-secondary font-extrabold shadow-sm">2</span>
                </div>
                <div className="hash-machine-pill p-3 border border-white/5 rounded-xl bg-slate-900/50 flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Hash B(x) % 8 ➔</span>
                  <span className="neon-value text-emerald-400 font-extrabold shadow-sm">5</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
            A good hash function distributes inputs uniformly, minimizing the chance of two different words hitting the exact same index.
          </p>
        </div>
      )
    },
    {
      title: '4. The k-Hash Algorithm (Optimal Hash Count)',
      icon: Layers,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3 animate-slide-up">
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
            How many hash functions (<em>k</em>) should we choose? It's a delicate tradeoff:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
            <li><strong>Too few hashes (low k)</strong>: Fast, but checks fewer bits per element, leading to more overlaps.</li>
            <li><strong>Too many hashes (high k)</strong>: The array fills up with 1s too fast, causing false positives.</li>
          </ul>
          <KHashInteractiveWidget />
        </div>
      )
    },
    {
      title: '5. Inserting Elements',
      icon: Plus,
      iconColor: 'text-neon-success',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            To insert an item, run it through all <em>k</em> hash functions to calculate the indices. Flip the bits at those indices to <strong>1</strong>.
          </p>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 mt-2 select-none">
            <p className="visual-title text-xs font-bold text-muted-foreground mb-1">
              Inserting <span className="font-mono text-neon-secondary font-extrabold">"apple"</span> (hashes: 2, 5)
            </p>
            <div className="concept-bit-array grid grid-cols-8 gap-1.5 w-full max-w-[400px]">
              {[0, 0, 1, 0, 0, 1, 0, 0].map((val, idx) => {
                const isActive = idx === 2 || idx === 5
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "concept-bit-cell aspect-square border border-white/5 rounded-lg flex flex-col items-center justify-center bg-white/2 transition-all duration-300",
                      isActive && "bg-gradient-to-br from-neon-primary to-neon-secondary border-transparent scale-105 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    )}
                  >
                    <span className={cn("bit-idx text-[8px] text-muted-foreground mb-0.5", isActive && "text-white/60")}>{idx}</span>
                    <span className="bit-val font-mono text-sm font-extrabold text-foreground">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Notice that we don't store "apple" anywhere. We only flipped the bits at indices 2 and 5 to 1!
          </p>
        </div>
      )
    },
    {
      title: '6. Querying & False Positives',
      icon: AlertCircle,
      iconColor: 'text-neon-danger',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            To check if an item exists, check the bits at its hash indices:
          </p>
          <ul className="concept-list list-disc pl-5 flex flex-col gap-1.5 text-sm md:text-base text-muted-foreground">
            <li>If <strong>any</strong> of the bits is <strong>0</strong>, the item is <strong>100% Definite No</strong> (it was never inserted).</li>
            <li>If <strong>all</strong> bits are <strong>1</strong>, the item is <strong>Maybe Yes</strong>.</li>
          </ul>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col items-stretch justify-center gap-3 mt-2 select-none">
            <div className="false-positive-card p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs md:text-sm leading-relaxed text-foreground text-left">
              <span className="bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                False Positive Demo
              </span>
              <p className="mt-1">
                If you query <span className="font-mono text-neon-secondary font-extrabold">"banana"</span> (hashes: 2, 5), the filter says "Yes" even if you never inserted it, because those bits were already flipped by "apple"! This is a <strong>False Positive</strong>.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  const ActiveIcon = slides[currentSlide].icon

  return (
    <Card 
      glass
      className="concept-container p-6 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col gap-6 min-h-[480px]"
    >
      {/* ProgressBar */}
      <div className="concept-progress-bar flex justify-center gap-2 select-none">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "progress-step-dot h-1.5 flex-1 max-w-[50px] bg-white/10 rounded-full cursor-pointer transition-all duration-300",
              idx === currentSlide && "bg-neon-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              idx < currentSlide && "bg-neon-secondary"
            )}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>

      {/* Main Slide Card */}
      <div className="concept-card flex-1 flex flex-col gap-4">
        <div className="slide-title-wrapper flex items-center gap-3 border-b border-white/5 pb-3.5">
          <ActiveIcon size={24} className={cn(slides[currentSlide].iconColor)} />
          <h2 className="slide-title text-base md:text-lg font-extrabold text-foreground tracking-tight">
            {slides[currentSlide].title}
          </h2>
        </div>
        
        <div className="slide-content-wrapper flex-1 text-sm md:text-base leading-relaxed">
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="concept-controls flex justify-between mt-2 select-none">
        <Button 
          variant="outline"
          className="w-full max-w-[150px] rounded-xl h-11 border-white/5 bg-white/3"
          disabled={currentSlide === 0}
          onClick={() => setCurrentSlide(prev => prev - 1)}
        >
          <ArrowLeft size={18} />
          <span>Previous</span>
        </Button>

        {currentSlide === slides.length - 1 ? (
          <Button 
            variant="neon" 
            className="w-full max-w-[160px] rounded-xl h-11"
            onClick={onComplete}
          >
            <span>Simulator</span>
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button 
            variant="neon" 
            className="w-full max-w-[150px] rounded-xl h-11"
            onClick={() => setCurrentSlide(prev => prev + 1)}
          >
            <span>Next</span>
            <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </Card>
  )
}
