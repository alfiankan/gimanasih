import React, { useState, useCallback } from 'react';
import { Shuffle, Search, RotateCcw, Zap, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BinarySearchSimulatorProps {
  onComplete: () => void;
}

interface StepLog {
  step: number;
  left: number;
  right: number;
  mid: number;
  midVal: number;
  action: string;
  status: 'searching' | 'found' | 'not-found';
}

const generateSortedArray = () => {
  const size = 12;
  const set = new Set<number>();
  while (set.size < size) set.add(Math.floor(Math.random() * 90) + 5);
  return Array.from(set).sort((a, b) => a - b);
};

export const BinarySearchSimulator: React.FC<BinarySearchSimulatorProps> = ({ onComplete }) => {
  const [arr, setArr] = useState<number[]>(generateSortedArray);
  const [target, setTarget] = useState<string>('');
  const [steps, setSteps] = useState<StepLog[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const autoRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIdx] ?? null;

  const computeSteps = useCallback((array: number[], tgt: number): StepLog[] => {
    const result: StepLog[] = [];
    let left = 0;
    let right = array.length - 1;
    let stepNum = 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midVal = array[mid];

      if (midVal === tgt) {
        result.push({ step: stepNum, left, right, mid, midVal, action: `arr[${mid}] = ${midVal} == ${tgt} → Found at index ${mid}! ✅`, status: 'found' });
        return result;
      } else if (midVal < tgt) {
        result.push({ step: stepNum, left, right, mid, midVal, action: `arr[${mid}] = ${midVal} < ${tgt} → Search right half (L = ${mid + 1})`, status: 'searching' });
        left = mid + 1;
      } else {
        result.push({ step: stepNum, left, right, mid, midVal, action: `arr[${mid}] = ${midVal} > ${tgt} → Search left half (R = ${mid - 1})`, status: 'searching' });
        right = mid - 1;
      }
      stepNum++;
    }

    result.push({ step: stepNum, left, right, mid: -1, midVal: -1, action: `L > R → ${tgt} is not in the array. ❌`, status: 'not-found' });
    return result;
  }, []);

  const handleSearch = () => {
    const tgt = parseInt(target);
    if (isNaN(tgt)) return;
    const computed = computeSteps(arr, tgt);
    setSteps(computed);
    setCurrentStepIdx(0);
    setIsSearching(true);
    setSearchDone(false);
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(p => p + 1);
    } else {
      setSearchDone(true);
    }
  };

  const stopAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    setAutoMode(false);
  };

  const handleAutoPlay = () => {
    setAutoMode(true);
    autoRef.current = setInterval(() => {
      setCurrentStepIdx(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(autoRef.current!);
          setAutoMode(false);
          setSearchDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const handleReset = () => {
    stopAuto();
    setArr(generateSortedArray());
    setTarget('');
    setSteps([]);
    setCurrentStepIdx(-1);
    setIsSearching(false);
    setSearchDone(false);
  };

  const getCellStyle = (idx: number) => {
    if (!currentStep) return 'border-white/10 bg-slate-900/50 text-slate-400';
    const { left, right, mid, status } = currentStep;
    if (idx === mid) {
      if (status === 'found') return 'border-emerald-500 bg-emerald-500/25 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-110';
      if (status === 'not-found') return 'border-red-500/50 bg-red-500/10 text-red-400';
      return 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-110';
    }
    if (idx < left || idx > right) return 'border-white/5 bg-white/2 text-slate-700 opacity-40';
    if (idx === left) return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
    if (idx === right) return 'border-red-500/50 bg-red-500/10 text-red-300';
    return 'border-white/10 bg-slate-900/50 text-slate-300';
  };

  const getLabelRow = (idx: number) => {
    if (!currentStep) return null;
    const { left, right, mid } = currentStep;
    const labels = [];
    if (idx === left) labels.push(<span key="L" className="text-blue-400 text-[8px] font-black">L</span>);
    if (idx === mid) labels.push(<span key="M" className="text-amber-400 text-[8px] font-black">M</span>);
    if (idx === right) labels.push(<span key="R" className="text-red-400 text-[8px] font-black">R</span>);
    return labels.length > 0 ? <div className="flex gap-0.5 justify-center mt-0.5">{labels}</div> : <div className="mt-0.5 h-3" />;
  };

  return (
    <div className="flex flex-col gap-5 animate-slide-up w-full">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60">
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="text-muted-foreground">Array:</span>
          <span className="text-neon-primary">{arr.length} elements</span>
          {isSearching && currentStep && (
            <span className={cn(
              "flex items-center gap-1.5",
              currentStep.status === 'found' ? 'text-emerald-400' :
              currentStep.status === 'not-found' ? 'text-red-400' : 'text-amber-400'
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full inline-block",
                currentStep.status === 'found' ? 'bg-emerald-400' :
                currentStep.status === 'not-found' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
              )} />
              Step {currentStepIdx + 1} / {steps.length}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-7 rounded-lg text-[10px] border-white/5 cursor-pointer bg-white/3 font-bold"
        >
          <RotateCcw size={10} />
          New Array
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visualizer */}
        <Card glass className="lg:col-span-2 p-5 bg-slate-950/60 border-white/5 flex flex-col gap-5">
          <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Sorted Array</span>

          {/* Array visualization */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {arr.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={cn(
                    "w-full aspect-square rounded-lg border flex items-center justify-center font-mono text-[11px] font-black transition-all duration-300 cursor-default",
                    getCellStyle(idx)
                  )}>
                    {val}
                  </div>
                  {isSearching ? getLabelRow(idx) : <div className="text-[8px] text-slate-700 mt-0.5">{idx}</div>}
                </div>
              ))}
            </div>

            {/* Legend */}
            {isSearching && (
              <div className="flex items-center gap-3 text-[9px] select-none animate-slide-up">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-amber-500 bg-amber-500/20 inline-block" />Mid (checking)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-blue-500/50 bg-blue-500/10 inline-block" />Left bound</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-red-500/50 bg-red-500/10 inline-block" />Right bound</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-white/5 bg-white/2 opacity-40 inline-block" />Eliminated</span>
              </div>
            )}
          </div>

          {/* Current step info */}
          {currentStep && (
            <div className={cn(
              "p-4 rounded-xl border animate-slide-up flex flex-col gap-2",
              currentStep.status === 'found' && "border-emerald-500/30 bg-emerald-500/8",
              currentStep.status === 'not-found' && "border-red-500/30 bg-red-500/8",
              currentStep.status === 'searching' && "border-amber-500/25 bg-amber-500/5",
            )}>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span>Left=<strong className="text-blue-400">{currentStep.left}</strong></span>
                <span>Mid=<strong className="text-amber-400">{currentStep.mid === -1 ? '–' : currentStep.mid}</strong></span>
                <span>Right=<strong className="text-red-400">{currentStep.right}</strong></span>
              </div>
              <p className={cn(
                "text-sm font-bold",
                currentStep.status === 'found' && "text-emerald-400",
                currentStep.status === 'not-found' && "text-red-400",
                currentStep.status === 'searching' && "text-amber-300",
              )}>
                {currentStep.action}
              </p>
            </div>
          )}

          {!isSearching && (
            <div className="flex items-center justify-center h-16 text-xs text-muted-foreground italic">
              Enter a target number and click Search to start the visualization →
            </div>
          )}

          {/* Regenerate button */}
          <Button
            variant="outline"
            size="sm"
            className="self-start h-8 rounded-xl text-[10px] border-white/5 bg-white/3 font-bold cursor-pointer"
            onClick={() => { stopAuto(); setArr(generateSortedArray()); setIsSearching(false); setSteps([]); setCurrentStepIdx(-1); setSearchDone(false); }}
          >
            <Shuffle size={10} />
            Shuffle Array
          </Button>
        </Card>

        {/* Controls + step log */}
        <div className="flex flex-col gap-4">
          {/* Search input */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Search Target</span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter a number..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                className="flex-1 rounded-xl bg-slate-950 border border-white/5 text-sm px-3 py-2.5 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-primary"
              />
              <Button
                variant="neon"
                className="h-10 px-3 rounded-xl cursor-pointer"
                disabled={!target}
                onClick={handleSearch}
              >
                <Search size={14} />
              </Button>
            </div>

            {/* Quick picks from array */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Quick pick from array:</span>
              <div className="flex flex-wrap gap-1">
                {arr.slice(0, 6).map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setTarget(String(v))}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-neon-primary/20 bg-neon-primary/5 text-neon-primary cursor-pointer hover:bg-neon-primary/10 transition-colors"
                  >
                    {v}
                  </button>
                ))}
                <button
                  onClick={() => setTarget(String(arr[arr.length - 1] + 5))}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/20 bg-red-500/5 text-red-400 cursor-pointer hover:bg-red-500/10 transition-colors"
                  title="A number not in the array"
                >
                  {arr[arr.length - 1] + 5} ❌
                </button>
              </div>
            </div>

            {/* Controls */}
            {isSearching && !searchDone && (
              <div className="flex gap-2 mt-1 animate-slide-up">
                <Button
                  variant="outline"
                  className="flex-1 h-9 rounded-xl border-white/5 bg-white/3 font-bold text-xs cursor-pointer"
                  onClick={handleNextStep}
                  disabled={autoMode}
                >
                  <ChevronRight size={14} />
                  Next Step
                </Button>
                {!autoMode ? (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 rounded-xl border-neon-primary/20 bg-neon-primary/5 text-neon-primary font-bold text-xs cursor-pointer"
                    onClick={handleAutoPlay}
                  >
                    ▶ Auto Play
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 rounded-xl border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold text-xs cursor-pointer"
                    onClick={stopAuto}
                  >
                    ⏸ Pause
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Step-by-step log */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-2.5 flex-grow">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Step Log</span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[260px] font-mono text-[9px]">
              {steps.length === 0 ? (
                <span className="text-muted-foreground italic">[ search steps will appear here ]</span>
              ) : (
                steps.map((s, i) => (
                  <div
                    key={s.step}
                    className={cn(
                      "p-2 rounded-lg border flex gap-2 items-start transition-all",
                      i === currentStepIdx && s.status === 'found' && "border-emerald-500/30 bg-emerald-500/8",
                      i === currentStepIdx && s.status === 'not-found' && "border-red-500/30 bg-red-500/8",
                      i === currentStepIdx && s.status === 'searching' && "border-amber-500/25 bg-amber-500/5",
                      i !== currentStepIdx && "border-white/5 bg-white/2 opacity-50",
                    )}
                  >
                    <span className="shrink-0 text-[8px] text-muted-foreground font-bold">#{s.step}</span>
                    <span className={cn(
                      "leading-snug",
                      i === currentStepIdx && s.status === 'found' && "text-emerald-400",
                      i === currentStepIdx && s.status === 'not-found' && "text-red-400",
                      i === currentStepIdx && s.status === 'searching' && "text-amber-300",
                      i !== currentStepIdx && "text-slate-500",
                    )}>
                      {s.action}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="neon" className="rounded-xl h-11 px-6 cursor-pointer" onClick={onComplete}>
          <Zap size={16} /><span>Continue to Game</span>
        </Button>
      </div>
    </div>
  );
};
