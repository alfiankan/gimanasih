import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Lightbulb, AlertCircle, RefreshCw, Brain, Plus, Layers, Zap, Database } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const KHashInteractiveWidget: React.FC = () => {
  const [k, setK] = useState<number>(3);
  const m = 16;
  const words = ['apple', 'banana', 'cherry'];

  const getHashesForWord = (word: string, hashCount: number): number[] => {
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

  const activeBits = new Set<number>();
  wordHashes.forEach(item => {
    item.indices.forEach(idx => activeBits.add(idx));
  });

  const saturation = (activeBits.size / m) * 100;
  const n = 3;
  const fpp = Math.pow(1 - Math.exp(-k * n / m), k) * 100;

  return (
    <div className="flex flex-col gap-4 bg-black/20 border border-white/5 rounded-2xl p-4 text-left select-none animate-slide-up mt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Hash functions (k) = <span className="text-neon-secondary text-sm font-black">{k}</span>
          </label>
          <span className="text-[10px] text-muted-foreground">Drag to see how false positive rate changes live!</span>
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

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bit Array (m = 16)</span>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 w-full">
          {Array.from({ length: m }).map((_, idx) => {
            const isActive = activeBits.has(idx);
            return (
              <div
                key={idx}
                className={cn(
                  "aspect-square rounded border flex flex-col items-center justify-center text-[10px] transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-neon-primary to-neon-secondary border-transparent scale-105 shadow-[0_0_8px_rgba(16,185,129,0.3)] text-white"
                    : "bg-white/2 border-white/5 text-muted-foreground"
                )}
              >
                <span className="opacity-50 text-[7px] leading-none mb-0.5">{idx}</span>
                <span className="font-mono font-bold leading-none">{isActive ? '1' : '0'}</span>
              </div>
            );
          })}
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Bit Saturation</span>
          <span className="text-base font-black text-white">{activeBits.size}/16 ({saturation.toFixed(0)}%)</span>
          <div className="h-1.5 w-full bg-white/5 rounded-full mt-1">
            <div
              className={cn("h-full rounded-full transition-all duration-300", saturation > 70 ? "bg-red-500" : saturation > 40 ? "bg-amber-500" : "bg-neon-primary")}
              style={{ width: `${saturation}%` }}
            />
          </div>
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
            {k <= 2 && '⚠️ Too few checks — easy overlaps.'}
            {k >= 3 && k <= 5 && '✅ Sweet spot — good balance!'}
            {k >= 6 && '🔴 Over-saturated — too many false positives!'}
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
      title: '1. The Problem — Checking a Billion Usernames',
      icon: Brain,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Imagine you're building Twitter. When someone types a new username, you need to check if it's already taken. But you have <strong className="text-white">500 million users</strong>. Querying your main database for every keystroke would be <strong className="text-red-400">brutally slow and expensive</strong>. 😩
          </p>
          <div className="grid grid-cols-2 gap-3 select-none text-xs">
            <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/5 flex flex-col gap-2">
              <span className="text-2xl text-center">🐢</span>
              <span className="font-black text-red-400 text-center">Database Lookup</span>
              <ul className="flex flex-col gap-1 text-muted-foreground leading-snug">
                <li>• Hits disk/network every time</li>
                <li>• Scales poorly with size</li>
                <li>• Costs money at scale</li>
                <li>• ~1–100ms per query</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl border border-neon-primary/25 bg-neon-primary/5 flex flex-col gap-2">
              <span className="text-2xl text-center">⚡</span>
              <span className="font-black text-neon-primary text-center">Bloom Filter</span>
              <ul className="flex flex-col gap-1 text-muted-foreground leading-snug">
                <li>• Lives in RAM, never disk</li>
                <li>• Constant O(k) time</li>
                <li>• Uses kilobytes, not GB</li>
                <li>• ~microseconds per query</li>
              </ul>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-neon-primary/20 bg-neon-primary/5 text-xs leading-relaxed text-foreground">
            <strong>The trick:</strong> A Bloom Filter tells you <em>instantly</em> if something is <strong className="text-emerald-400">definitely NOT</strong> in the set — so you only hit the slow database when there's actually a chance of a match.
          </div>
        </div>
      )
    },
    {
      title: '2. The Core — Just a Row of Light Switches',
      icon: Lightbulb,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Inside a Bloom Filter is just a <strong className="text-white">bit array</strong> — a fixed row of slots, each holding either <code className="bg-white/10 px-1 rounded text-[11px]">0</code> (off) or <code className="bg-white/10 px-1 rounded text-[11px]">1</code> (on). Think of it as a row of <strong className="text-white">light switches</strong>, all starting off.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4 select-none">
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Empty Bloom Filter (m = 8 slots)</span>
              <div className="grid grid-cols-8 gap-2 w-full max-w-sm">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-full aspect-square rounded-lg border border-white/10 bg-slate-900/60 flex items-center justify-center font-mono text-sm font-black text-slate-600">0</div>
                    <span className="text-[8px] text-muted-foreground">{i}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">Every slot starts at 0 — the filter knows nothing yet.</p>
          </div>
          <div className="p-3 rounded-xl border border-neon-secondary/20 bg-neon-secondary/5 text-xs leading-relaxed text-muted-foreground">
            💡 <strong className="text-white">Why so tiny?</strong> It doesn't store the actual values (usernames, emails, etc.) — only tiny bits! A filter for 1 million items only needs ~1.2 MB of RAM.
          </div>
        </div>
      )
    },
    {
      title: '3. Hash Functions — The Fingerprinting Machine',
      icon: RefreshCw,
      iconColor: 'text-neon-warning',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            To use a Bloom Filter, every item gets put through <strong className="text-white">k hash functions</strong>. Each hash function is like a <strong className="text-white">fingerprinting machine</strong> — it takes any string and spits out a number (the index to flip in the array).
          </p>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 select-none">
            <div className="flex items-center justify-center">
              <span className="font-mono text-white bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold">"apple"</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] text-muted-foreground font-bold">3 hash functions</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Hash1("apple") % 16', result: 3, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
                { label: 'Hash2("apple") % 16', result: 9, color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
                { label: 'Hash3("apple") % 16', result: 14, color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
              ].map((h, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border ${h.color} text-xs font-mono`}>
                  <span className="text-muted-foreground">{h.label}</span>
                  <span className={`font-black text-sm ${h.color.split(' ')[0]}`}>→ {h.result}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground">→ Flip bits at positions 3, 9, and 14 to <strong className="text-white">1</strong></p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A good hash function spreads outputs <strong className="text-white">evenly</strong> so different words hit different positions — minimizing accidental overlaps.
          </p>
        </div>
      )
    },
    {
      title: '4. Inserting an Item — Flipping Switches',
      icon: Plus,
      iconColor: 'text-neon-success',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            To <strong className="text-white">add "apple"</strong> to the filter: run it through all k hash functions, get the indices, and flip those slots to <code className="bg-white/10 px-1 rounded text-[11px] text-emerald-400">1</code>.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 select-none">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-white font-bold">"apple"</span>
              <span className="text-muted-foreground">→ hashes → slots</span>
              <span className="font-mono text-emerald-400 font-black">3, 9, 14</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 w-full">
              {Array.from({ length: 8 }).map((_, idx) => {
                const active = [3, 1, 6].includes(idx); // visual positions scaled to 8
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-full aspect-square rounded-lg border flex items-center justify-center font-mono text-xs font-black transition-all duration-300",
                      active ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-110" : "border-white/10 bg-slate-900/60 text-slate-600"
                    )}>
                      {active ? '1' : '0'}
                    </div>
                    <span className="text-[8px] text-muted-foreground">{idx}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Bits at positions 1, 3, 6 flipped to 1. <strong className="text-white">"apple" itself is never stored!</strong></p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="font-black text-emerald-400 block mb-1">✅ What's saved</span>
              <span className="text-muted-foreground">Just 3 flipped bits. The word itself is gone.</span>
            </div>
            <div className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5">
              <span className="font-black text-red-400 block mb-1">❌ What's NOT saved</span>
              <span className="text-muted-foreground">You can never get "apple" back from the filter.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '5. Querying — "Is This Username Taken?"',
      icon: AlertCircle,
      iconColor: 'text-neon-danger',
      content: (
        <div className="concept-slide-content flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            To check if "apple" is in the filter: hash it → get indices → check those bits. Two possible results:
          </p>
          <div className="flex flex-col gap-3 select-none">
            <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/5 flex gap-3 items-start">
              <span className="text-2xl shrink-0">🚫</span>
              <div>
                <span className="font-black text-red-400 text-sm block mb-1">DEFINITELY NOT in set</span>
                <span className="text-xs text-muted-foreground leading-relaxed">If <strong className="text-white">any</strong> of the checked bits is <code className="bg-white/10 px-1 rounded">0</code> — the item was 100% never inserted. No need to check the database!</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 flex gap-3 items-start">
              <span className="text-2xl shrink-0">🤔</span>
              <div>
                <span className="font-black text-amber-400 text-sm block mb-1">PROBABLY in set (go check DB)</span>
                <span className="text-xs text-muted-foreground leading-relaxed">If <strong className="text-white">all</strong> bits are <code className="bg-white/10 px-1 rounded">1</code> — it was probably inserted. But could be a <strong className="text-amber-300">false positive</strong>! Query the real database to confirm.</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-neon-warning/20 bg-neon-warning/5 text-xs leading-relaxed text-muted-foreground">
            💡 <strong className="text-white">False Positive Example:</strong> "mango" never inserted, but its hash positions (3, 9) were already flipped by "apple". Filter says "maybe yes!" — this is the trade-off for speed and tiny memory.
          </div>
        </div>
      )
    },
    {
      title: '6. Tuning with k — The Sweet Spot',
      icon: Layers,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3 animate-slide-up">
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
            How many hash functions (k) should you use? Too few → easy overlaps. Too many → array fills up fast → everything looks like a hit. Drag the slider to find the sweet spot:
          </p>
          <KHashInteractiveWidget />
        </div>
      )
    },
    {
      title: '7. Where Bloom Filters Are Used in the Wild',
      icon: Database,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Bloom Filters are everywhere in production systems — anywhere you need a <strong className="text-white">fast "definitely not" check</strong> before doing expensive work:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { name: 'Google Chrome', emoji: '🌐', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400', desc: 'Used in Safe Browsing to check if a URL is malicious without sending every URL to Google\'s servers.' },
              { name: 'Cassandra / HBase', emoji: '🗄️', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400', desc: 'Databases use bloom filters to skip reading SSTables for keys that definitely don\'t exist — huge I/O savings.' },
              { name: 'Akamai CDN', emoji: '⚡', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400', desc: 'Avoids storing one-hit-wonder URLs in cache by filtering items seen only once before caching them.' },
              { name: 'Bitcoin', emoji: '₿', color: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400', desc: 'Lightweight wallet clients use bloom filters to ask full nodes for transactions without revealing which addresses belong to you.' },
            ].map(item => (
              <div key={item.name} className={`p-3 rounded-xl border ${item.color} flex flex-col gap-1`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{item.emoji}</span>
                  <span className={`text-xs font-extrabold ${item.color.split(' ')[2]}`}>{item.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
  ]

  const ActiveIcon = slides[currentSlide].icon

  return (
    <Card
      glass
      className="concept-container p-6 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col gap-6 min-h-[520px]"
    >
      {/* ProgressBar */}
      <div className="concept-progress-bar flex justify-center gap-1.5 select-none">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "progress-step-dot h-1.5 flex-1 max-w-[40px] bg-white/10 rounded-full cursor-pointer transition-all duration-300",
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
          <ActiveIcon size={22} className={cn(slides[currentSlide].iconColor)} />
          <h2 className="slide-title text-base md:text-lg font-extrabold text-foreground tracking-tight">
            {slides[currentSlide].title}
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground font-bold shrink-0">{currentSlide + 1} / {slides.length}</span>
        </div>

        <div className="slide-content-wrapper flex-1 text-sm md:text-base leading-relaxed">
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="concept-controls flex justify-between mt-2 select-none">
        <Button
          variant="outline"
          className="w-full max-w-[150px] rounded-xl h-11 border-white/5 bg-white/3 font-bold text-foreground cursor-pointer"
          disabled={currentSlide === 0}
          onClick={() => setCurrentSlide(prev => prev - 1)}
        >
          <ArrowLeft size={18} />
          <span>Previous</span>
        </Button>

        {currentSlide === slides.length - 1 ? (
          <Button
            variant="neon"
            className="w-full max-w-[160px] rounded-xl h-11 cursor-pointer"
            onClick={onComplete}
          >
            <span>Try Simulator</span>
            <Zap size={16} />
          </Button>
        ) : (
          <Button
            variant="neon"
            className="w-full max-w-[150px] rounded-xl h-11 cursor-pointer"
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
