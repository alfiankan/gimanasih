import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Search, Zap, Database, Code2, TrendingDown, GitCompare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BinarySearchConceptProps {
  onComplete: () => void;
}

export const BinarySearchConcept: React.FC<BinarySearchConceptProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: '1. The Problem — Finding a Number in a Phone Book',
      icon: Search,
      iconColor: 'text-neon-primary',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Imagine you're looking for "Smith" in a phone book with <strong className="text-white">1,000 pages</strong>. Would you start at page 1 and flip through every page? Of course not! You'd open the <strong className="text-white">middle</strong>, check if "Smith" comes before or after, and cut half the book away. That's binary search.
          </p>
          <div className="grid grid-cols-2 gap-3 select-none text-xs">
            <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/5 flex flex-col gap-2">
              <span className="text-2xl text-center">🐌</span>
              <span className="font-black text-red-400 text-center">Linear Search</span>
              <ul className="flex flex-col gap-1 text-muted-foreground leading-snug">
                <li>• Check every item one by one</li>
                <li>• 1,000,000 items → up to 1,000,000 checks</li>
                <li>• Gets slower as data grows</li>
                <li>• O(n) time complexity</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl border border-neon-primary/25 bg-neon-primary/5 flex flex-col gap-2">
              <span className="text-2xl text-center">⚡</span>
              <span className="font-black text-neon-primary text-center">Binary Search</span>
              <ul className="flex flex-col gap-1 text-muted-foreground leading-snug">
                <li>• Halve the search space each step</li>
                <li>• 1,000,000 items → only 20 checks!</li>
                <li>• Stays fast even with huge data</li>
                <li>• O(log n) time complexity</li>
              </ul>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs leading-relaxed text-muted-foreground">
            ⚠️ <strong className="text-white">One catch:</strong> Binary search only works on <strong className="text-amber-300">sorted</strong> data. The array must be in order so you know which half to keep.
          </div>
        </div>
      ),
    },
    {
      title: '2. How It Works — The Halving Game',
      icon: GitCompare,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Binary search keeps track of 3 pointers: <strong className="text-blue-400">left</strong>, <strong className="text-emerald-400">mid</strong>, and <strong className="text-red-400">right</strong>. At each step it checks the middle element:
          </p>
          <div className="flex flex-col gap-2.5 text-xs select-none">
            {[
              { icon: '🎯', color: 'border-emerald-500/25 bg-emerald-500/5', title: 'arr[mid] == target', desc: 'Found it! Return the index. Done!' },
              { icon: '⬅️', color: 'border-blue-500/25 bg-blue-500/5', title: 'arr[mid] > target', desc: 'Target is smaller → move right pointer to mid-1. Throw away the right half.' },
              { icon: '➡️', color: 'border-purple-500/25 bg-purple-500/5', title: 'arr[mid] < target', desc: 'Target is bigger → move left pointer to mid+1. Throw away the left half.' },
            ].map((step, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${step.color}`}>
                <span className="text-lg shrink-0">{step.icon}</span>
                <div>
                  <code className="text-white font-black block mb-0.5">{step.title}</code>
                  <span className="text-muted-foreground leading-snug">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-2 select-none">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Example: Find 7 in [1, 3, 5, 7, 9, 11, 13]</p>
            {[
              { arr: [1,3,5,7,9,11,13], l:0, r:6, mid:3, midVal:7, note:'mid=7 == 7 → Found! ✅' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex gap-1 justify-center">
                  {step.arr.map((v, idx) => (
                    <div key={idx} className={cn(
                      "w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-black transition-all",
                      idx === step.mid && "border-emerald-500 bg-emerald-500/20 text-emerald-300 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
                      idx === step.l && idx !== step.mid && "border-blue-500/50 text-blue-300",
                      idx === step.r && idx !== step.mid && "border-red-500/50 text-red-300",
                      idx !== step.l && idx !== step.r && idx !== step.mid && "border-white/10 text-slate-500"
                    )}>
                      {v}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-center text-[9px] font-mono">
                  <span className="text-blue-400">L=0</span>
                  <span className="text-emerald-400">mid=3 ← checked</span>
                  <span className="text-red-400">R=6</span>
                </div>
                <p className="text-[10px] text-center text-emerald-400 font-bold">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '3. Step-by-Step Trace — Find 11',
      icon: TrendingDown,
      iconColor: 'text-neon-warning',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Let's trace finding <strong className="text-white">11</strong> in the array <code className="bg-white/10 px-1.5 rounded text-[11px]">[2, 5, 8, 11, 14, 18, 23]</code>. Watch how we eliminate half each step:
          </p>
          <div className="flex flex-col gap-3 select-none text-xs">
            {[
              { step: 1, l: 0, r: 6, mid: 3, midVal: 11, arr: [2,5,8,11,14,18,23], action: 'mid=11 == 11 → Found in 1 step! 🎉', result: 'found', keep: [3] },
            ].map((s) => (
              <div key={s.step} className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-emerald-400">Step {s.step}</span>
                  <span className="text-muted-foreground">L={s.l} M={s.mid} R={s.r}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {s.arr.map((v, i) => (
                    <div key={i} className={cn(
                      "flex-1 h-8 rounded border flex items-center justify-center font-mono font-black text-[10px]",
                      i === s.mid && "border-emerald-500 bg-emerald-500/25 text-emerald-300",
                      i !== s.mid && "border-white/10 text-slate-500"
                    )}>{v}</div>
                  ))}
                </div>
                <p className="text-emerald-400 font-bold">{s.action}</p>
              </div>
            ))}
            {/* Multi-step example */}
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-1">Now find 18 in [2, 5, 8, 11, 14, 18, 23]:</p>
            {[
              { step: 1, l: 0, r: 6, mid: 3, midVal: 11, arr: [2,5,8,11,14,18,23], action: 'mid=11 < 18 → move left to 4', result: 'right', keep: [4,5,6] },
              { step: 2, l: 4, r: 6, mid: 5, midVal: 18, arr: [2,5,8,11,14,18,23], action: 'mid=18 == 18 → Found! ✅', result: 'found', keep: [5] },
            ].map((s) => (
              <div key={s.step} className={cn(
                "p-3 rounded-xl border",
                s.result === 'found' ? "border-emerald-500/25 bg-emerald-500/5" : "border-white/10 bg-white/2"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("font-black", s.result === 'found' ? "text-emerald-400" : "text-slate-300")}>Step {s.step}</span>
                  <span className="text-muted-foreground">L={s.l} M={s.mid} R={s.r}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {s.arr.map((v, i) => (
                    <div key={i} className={cn(
                      "flex-1 h-8 rounded border flex items-center justify-center font-mono font-black text-[10px]",
                      i === s.mid && s.result === 'found' && "border-emerald-500 bg-emerald-500/25 text-emerald-300",
                      i === s.mid && s.result !== 'found' && "border-amber-500 bg-amber-500/15 text-amber-300",
                      i < s.l || i > s.r ? "border-white/5 text-slate-700 opacity-40" : i !== s.mid ? "border-white/10 text-slate-400" : ""
                    )}>{v}</div>
                  ))}
                </div>
                <p className={cn("font-bold text-[10px]", s.result === 'found' ? "text-emerald-400" : "text-amber-400")}>{s.action}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '4. The Code — It\'s Simpler Than You Think',
      icon: Code2,
      iconColor: 'text-neon-success',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Here's the actual binary search implementation. Notice how elegant it is — just a <strong className="text-white">while loop</strong> with 3 pointers:
          </p>
          <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 font-mono text-xs leading-relaxed select-all overflow-x-auto">
            <div className="text-slate-500 mb-2">// Iterative Binary Search — O(log n)</div>
            <div><span className="text-purple-400">function</span> <span className="text-blue-400">binarySearch</span><span className="text-white">(arr, target) {'{'}</span></div>
            <div className="pl-4"><span className="text-purple-400">let</span> <span className="text-amber-300">left</span> = <span className="text-emerald-400">0</span>;</div>
            <div className="pl-4"><span className="text-purple-400">let</span> <span className="text-red-400">right</span> = arr.length - <span className="text-emerald-400">1</span>;</div>
            <div className="mt-2 pl-4"><span className="text-purple-400">while</span> (left {'<='} right) {'{'}</div>
            <div className="pl-8"><span className="text-purple-400">const</span> <span className="text-neon-primary">mid</span> = Math.floor((left + right) / <span className="text-emerald-400">2</span>);</div>
            <div className="pl-8 mt-1"><span className="text-purple-400">if</span> (arr[mid] === target) <span className="text-purple-400">return</span> mid; <span className="text-slate-500">// ✅ Found!</span></div>
            <div className="pl-8"><span className="text-purple-400">if</span> (arr[mid] {'<'} target) left = mid + <span className="text-emerald-400">1</span>; <span className="text-slate-500">// Go right</span></div>
            <div className="pl-8"><span className="text-purple-400">else</span> right = mid - <span className="text-emerald-400">1</span>; <span className="text-slate-500">// Go left</span></div>
            <div className="pl-4">{'}'}</div>
            <div className="pl-4 mt-1"><span className="text-purple-400">return</span> <span className="text-red-400">-1</span>; <span className="text-slate-500">// ❌ Not found</span></div>
            <div>{'}'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="font-black text-emerald-400 block mb-1">✅ Returns</span>
              <span className="text-muted-foreground">The <strong className="text-white">index</strong> where target was found, or -1 if not found.</span>
            </div>
            <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <span className="font-black text-blue-400 block mb-1">⚙️ Complexity</span>
              <span className="text-muted-foreground"><strong className="text-white">O(log n)</strong> time, <strong className="text-white">O(1)</strong> space — constant memory!</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '5. O(log n) — Why Is It So Fast?',
      icon: TrendingDown,
      iconColor: 'text-neon-danger',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            <strong className="text-white">O(log n)</strong> means: every time your data doubles in size, you only need <strong className="text-white">1 more step</strong>. That's incredibly efficient.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-2.5 select-none">
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-2 border-b border-white/5">
              <span>Array Size (n)</span>
              <span className="text-red-400">Linear O(n)</span>
              <span className="text-emerald-400">Binary O(log n)</span>
            </div>
            {[
              { n: '10', lin: '10', bin: '4' },
              { n: '100', lin: '100', bin: '7' },
              { n: '1,000', lin: '1,000', bin: '10' },
              { n: '1,000,000', lin: '1,000,000', bin: '20' },
              { n: '1,000,000,000', lin: '1,000,000,000', bin: '30' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-white font-bold">{row.n}</span>
                <span className="text-red-400 font-mono">{row.lin} steps</span>
                <span className="text-emerald-400 font-mono font-black">{row.bin} steps</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl border border-neon-primary/20 bg-neon-primary/5 text-xs leading-relaxed text-muted-foreground">
            💡 <strong className="text-white">Real example:</strong> A database with 1 billion records can be searched in just <strong className="text-emerald-400">30 comparisons</strong> with binary search vs 1 billion with linear search. That's why databases use B-Trees (a generalization of binary search) for their indexes!
          </div>
        </div>
      ),
    },
    {
      title: '6. Common Pitfalls — Watch Out!',
      icon: Zap,
      iconColor: 'text-neon-warning',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Even experienced engineers get these wrong. Here are the classic binary search bugs:
          </p>
          <div className="flex flex-col gap-3 text-xs select-none">
            {[
              {
                bug: '🐛 Integer Overflow in mid calculation',
                bad: 'mid = (left + right) / 2',
                good: 'mid = left + (right - left) / 2',
                why: 'In languages with fixed integers (C, Java), left+right can overflow for huge arrays. Always subtract first.',
                color: 'border-red-500/25 bg-red-500/5',
              },
              {
                bug: '🐛 Off-by-one on boundaries',
                bad: 'while (left < right)',
                good: 'while (left <= right)',
                why: 'Using < instead of <= misses the case where the answer is at the final single-element position.',
                color: 'border-amber-500/25 bg-amber-500/5',
              },
              {
                bug: '🐛 Searching unsorted data',
                bad: 'binary search on any array',
                good: 'sort first, then binary search',
                why: 'Binary search assumes sorted order. Running it on unsorted data gives completely wrong results with no error.',
                color: 'border-purple-500/25 bg-purple-500/5',
              },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-xl border ${item.color}`}>
                <span className="font-black text-white block mb-2">{item.bug}</span>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-red-500/10 rounded-lg px-2 py-1.5">
                    <span className="text-red-400 text-[9px] font-bold block mb-0.5">❌ Don't</span>
                    <code className="text-slate-300 text-[10px]">{item.bad}</code>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg px-2 py-1.5">
                    <span className="text-emerald-400 text-[9px] font-bold block mb-0.5">✅ Do</span>
                    <code className="text-slate-300 text-[10px]">{item.good}</code>
                  </div>
                </div>
                <p className="text-muted-foreground leading-snug">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '7. Where Binary Search Is Used in the Real World',
      icon: Database,
      iconColor: 'text-neon-primary',
      content: (
        <div className="flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Binary search is one of the most fundamental algorithms in CS. It shows up everywhere:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { name: 'Database Indexes (B-Trees)', emoji: '🗄️', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400', desc: 'Every SQL database uses B-Trees (a multi-way binary search tree) for index lookups. SELECT * WHERE id=5 uses binary search under the hood.' },
              { name: 'Git Bisect', emoji: '🔀', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400', desc: 'git bisect uses binary search across commits to find which commit introduced a bug — halving the history each step.' },
              { name: 'Package Managers', emoji: '📦', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400', desc: 'npm, pip, and cargo use binary search to quickly find compatible package versions in sorted version registries.' },
              { name: 'Search Autocomplete', emoji: '🔍', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400', desc: 'Dictionary autocomplete uses binary search on sorted word lists to instantly find words starting with your prefix.' },
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
      ),
    },
  ];

  const ActiveIcon = slides[currentSlide].icon;

  return (
    <Card glass className="p-6 rounded-2xl border-white/5 bg-slate-950/60 flex flex-col gap-6 min-h-[520px]">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 select-none">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1.5 flex-1 max-w-[40px] rounded-full cursor-pointer transition-all duration-300",
              idx === currentSlide && "bg-neon-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              idx < currentSlide && "bg-neon-secondary",
              idx > currentSlide && "bg-white/10",
            )}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
          <ActiveIcon size={22} className={slides[currentSlide].iconColor} />
          <h2 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">{slides[currentSlide].title}</h2>
          <span className="ml-auto text-[10px] text-muted-foreground font-bold shrink-0">{currentSlide + 1} / {slides.length}</span>
        </div>
        <div className="flex-1">{slides[currentSlide].content}</div>
      </div>

      {/* Nav */}
      <div className="flex justify-between select-none">
        <Button
          variant="outline"
          className="w-full max-w-[150px] rounded-xl h-11 border-white/5 bg-white/3 font-bold text-foreground cursor-pointer"
          disabled={currentSlide === 0}
          onClick={() => setCurrentSlide(p => p - 1)}
        >
          <ArrowLeft size={18} /><span>Previous</span>
        </Button>
        {currentSlide === slides.length - 1 ? (
          <Button variant="neon" className="w-full max-w-[160px] rounded-xl h-11 cursor-pointer" onClick={onComplete}>
            <span>Try Simulator</span><Zap size={16} />
          </Button>
        ) : (
          <Button variant="neon" className="w-full max-w-[150px] rounded-xl h-11 cursor-pointer" onClick={() => setCurrentSlide(p => p + 1)}>
            <span>Next</span><ArrowRight size={18} />
          </Button>
        )}
      </div>
    </Card>
  );
};
