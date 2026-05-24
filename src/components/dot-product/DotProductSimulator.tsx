import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DotProductSimulatorProps {
  onComplete: () => void;
}

interface Vec2 { x: number; y: number; }

const normalize = (v: Vec2): Vec2 => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 1 };
  return { x: v.x / len, y: v.y / len };
};

const dot2 = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y;
const len2 = (v: Vec2) => Math.sqrt(v.x * v.x + v.y * v.y);

export const DotProductSimulator: React.FC<DotProductSimulatorProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Guard is at center, facing direction is draggable
  const [guardAngleDeg, setGuardAngleDeg] = useState(0); // degrees, 0 = right
  const [playerPos, setPlayerPos] = useState<Vec2>({ x: 0.75, y: 0.3 }); // normalized 0-1
  const [fovDeg, setFovDeg] = useState(90); // total FOV angle

  const [dotValue, setDotValue] = useState(0);
  const [detected, setDetected] = useState(false);
  const [isDraggingPlayer, setIsDraggingPlayer] = useState(false);
  const [isDraggingGuard, setIsDraggingGuard] = useState(false);

  const getCanvasPos = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Vec2 => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Guard position (center)
    const guardPx: Vec2 = { x: cx, y: cy };
    // Player position
    const playerPx: Vec2 = { x: playerPos.x * W, y: playerPos.y * H };

    // Facing direction
    const angleRad = (guardAngleDeg * Math.PI) / 180;
    const facing: Vec2 = { x: Math.cos(angleRad), y: Math.sin(angleRad) };

    // toPlayer vector
    const toPlayer: Vec2 = { x: playerPx.x - guardPx.x, y: playerPx.y - guardPx.y };
    const toPlayerNorm = normalize(toPlayer);
    const facingNorm = normalize(facing);
    const dp = dot2(facingNorm, toPlayerNorm);

    // FOV threshold
    const halfFovRad = (fovDeg / 2) * (Math.PI / 180);
    const threshold = Math.cos(halfFovRad);
    const isDetected = dp > threshold;

    setDotValue(dp);
    setDetected(isDetected);

    // === DRAWING ===
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += W / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += H / 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Vision cone
    const coneColor = isDetected ? 'rgba(239,68,68,' : 'rgba(16,185,129,';
    const coneAngle1 = angleRad - halfFovRad;
    const coneAngle2 = angleRad + halfFovRad;
    const coneRadius = Math.max(W, H) * 0.55;

    ctx.beginPath();
    ctx.moveTo(guardPx.x, guardPx.y);
    ctx.arc(guardPx.x, guardPx.y, coneRadius, coneAngle1, coneAngle2);
    ctx.closePath();
    ctx.fillStyle = coneColor + '0.08)';
    ctx.fill();
    ctx.strokeStyle = coneColor + '0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cone edge lines
    ctx.beginPath();
    ctx.moveTo(guardPx.x, guardPx.y);
    ctx.lineTo(guardPx.x + Math.cos(coneAngle1) * coneRadius, guardPx.y + Math.sin(coneAngle1) * coneRadius);
    ctx.strokeStyle = coneColor + '0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(guardPx.x, guardPx.y);
    ctx.lineTo(guardPx.x + Math.cos(coneAngle2) * coneRadius, guardPx.y + Math.sin(coneAngle2) * coneRadius);
    ctx.stroke();

    // Facing arrow
    const arrowEnd: Vec2 = { x: guardPx.x + facingNorm.x * 70, y: guardPx.y + facingNorm.y * 70 };
    ctx.beginPath();
    ctx.moveTo(guardPx.x, guardPx.y);
    ctx.lineTo(arrowEnd.x, arrowEnd.y);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Arrowhead
    const aHeadAngle = Math.atan2(facingNorm.y, facingNorm.x);
    ctx.beginPath();
    ctx.moveTo(arrowEnd.x, arrowEnd.y);
    ctx.lineTo(arrowEnd.x - 10 * Math.cos(aHeadAngle - 0.4), arrowEnd.y - 10 * Math.sin(aHeadAngle - 0.4));
    ctx.lineTo(arrowEnd.x - 10 * Math.cos(aHeadAngle + 0.4), arrowEnd.y - 10 * Math.sin(aHeadAngle + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    // f⃗ label
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('f⃗', arrowEnd.x + 6, arrowEnd.y - 6);

    // To-player arrow (dashed)
    const distPx = len2(toPlayer);
    if (distPx > 20) {
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(guardPx.x, guardPx.y);
      ctx.lineTo(playerPx.x, playerPx.y);
      ctx.strokeStyle = 'rgba(167,139,250,0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      // t⃗ label
      ctx.fillStyle = '#c4b5fd';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('t⃗', (guardPx.x + playerPx.x) / 2 + 6, (guardPx.y + playerPx.y) / 2 - 6);
    }

    // Guard dot circle — drag handle for angle
    const handlePos: Vec2 = { x: guardPx.x + facingNorm.x * 90, y: guardPx.y + facingNorm.y * 90 };
    ctx.beginPath();
    ctx.arc(handlePos.x, handlePos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(96,165,250,0.2)';
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↻', handlePos.x, handlePos.y);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Guard body (soldier emoji-like)
    ctx.beginPath();
    ctx.arc(guardPx.x, guardPx.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30,41,59,0.95)';
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💂', guardPx.x, guardPx.y + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Player
    const playerColor = isDetected ? '#f87171' : '#34d399';
    ctx.beginPath();
    ctx.arc(playerPx.x, playerPx.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = isDetected ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)';
    ctx.fill();
    ctx.strokeStyle = playerColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🕵️', playerPx.x, playerPx.y + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Status label on canvas
    ctx.fillStyle = isDetected ? 'rgba(239,68,68,0.85)' : 'rgba(52,211,153,0.85)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(isDetected ? '🚨 DETECTED!' : '✅ Hidden', 10, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px monospace';
    ctx.fillText(`dot = ${dp.toFixed(3)}  threshold = ${threshold.toFixed(3)}`, 10, H - 10);

  }, [guardAngleDeg, playerPos, fovDeg]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer events on canvas
  const hitTestPlayer = (pos: Vec2, canvas: HTMLCanvasElement): boolean => {
    const dx = pos.x - playerPos.x;
    const dy = pos.y - playerPos.y;
    return Math.sqrt(dx * dx * canvas.width * canvas.width + dy * dy * canvas.height * canvas.height) < 22;
  };

  const hitTestGuardHandle = (pos: Vec2, canvas: HTMLCanvasElement): boolean => {
    const angleRad = (guardAngleDeg * Math.PI) / 180;
    const handleNx = (canvas.width / 2 + Math.cos(angleRad) * 90) / canvas.width;
    const handleNy = (canvas.height / 2 + Math.sin(angleRad) * 90) / canvas.height;
    const dx = pos.x - handleNx;
    const dy = pos.y - handleNy;
    return Math.sqrt(dx * dx * canvas.width * canvas.width + dy * dy * canvas.height * canvas.height) < 22;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e, canvas);
    if (hitTestPlayer(pos, canvas)) { setIsDraggingPlayer(true); return; }
    if (hitTestGuardHandle(pos, canvas)) { setIsDraggingGuard(true); return; }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e, canvas);

    if (isDraggingPlayer) {
      setPlayerPos({ x: Math.max(0.02, Math.min(0.98, pos.x)), y: Math.max(0.02, Math.min(0.98, pos.y)) });
    }
    if (isDraggingGuard) {
      const cx = 0.5;
      const cy = 0.5;
      const angle = Math.atan2(pos.y - cy, pos.x - cx) * (180 / Math.PI);
      setGuardAngleDeg(angle);
    }
  };

  const handlePointerUp = () => {
    setIsDraggingPlayer(false);
    setIsDraggingGuard(false);
  };

  const handleReset = () => {
    setGuardAngleDeg(0);
    setPlayerPos({ x: 0.75, y: 0.3 });
    setFovDeg(90);
  };

  const dotColor = dotValue > Math.cos((fovDeg / 2) * Math.PI / 180)
    ? 'text-red-400'
    : dotValue > 0
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className="flex flex-col gap-5 animate-slide-up w-full">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60">
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className={cn("flex items-center gap-1.5 font-black", detected ? 'text-red-400' : 'text-emerald-400')}>
            <span className={cn("w-2 h-2 rounded-full inline-block", detected ? 'bg-red-400 animate-pulse' : 'bg-emerald-400')} />
            {detected ? '🚨 PLAYER DETECTED' : '✅ Player Hidden'}
          </span>
          <span className="text-muted-foreground">
            dot = <span className={cn("font-black text-sm", dotColor)}>{dotValue.toFixed(3)}</span>
          </span>
        </div>
        <Button variant="outline" size="sm" className="h-7 rounded-lg text-[10px] border-white/5 bg-white/3 font-bold cursor-pointer" onClick={handleReset}>
          <RefreshCw size={10} /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Canvas */}
        <Card glass className="lg:col-span-2 p-3 bg-slate-950/60 border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Vision Cone Simulator</span>
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground select-none">
              <span>💂 Drag <span className="text-blue-400 font-bold">↻</span> to rotate guard</span>
              <span>🕵️ Drag spy to move</span>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={560}
            height={340}
            className="w-full rounded-xl border border-white/5 bg-slate-950/80 touch-none cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </Card>

        {/* Controls panel */}
        <div className="flex flex-col gap-4">
          {/* Dot product meter */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Live Dot Product</span>
            <div className="flex flex-col gap-2">
              <div className={cn("text-3xl font-black tabular-nums text-center py-2 rounded-xl border",
                detected ? 'border-red-500/25 bg-red-500/8 text-red-400' : 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400'
              )}>
                {dotValue.toFixed(3)}
              </div>
              {/* Bar showing -1 to 1 */}
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                <div
                  className={cn("absolute top-0 bottom-0 rounded-full transition-all duration-150",
                    detected ? "bg-red-500" : dotValue > 0 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{
                    left: dotValue >= 0 ? '50%' : `${50 + dotValue * 50}%`,
                    width: `${Math.abs(dotValue) * 50}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                <span>-1</span><span>0</span><span>+1</span>
              </div>
            </div>
          </Card>

          {/* FOV Slider */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Field of View</span>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">FOV Angle</span>
                <span className="text-sm font-black text-white">{fovDeg}°</span>
              </div>
              <input
                type="range" min={20} max={180} step={5}
                value={fovDeg}
                onChange={(e) => setFovDeg(parseInt(e.target.value))}
                className="w-full accent-neon-primary cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>Narrow (20°)</span><span>Wide (180°)</span>
              </div>
              <div className="text-[9px] text-muted-foreground border-t border-white/5 pt-2">
                Threshold: <strong className="text-white font-mono">{Math.cos((fovDeg / 2) * Math.PI / 180).toFixed(3)}</strong>
                <span className="ml-1">(= cos({fovDeg / 2}°))</span>
              </div>
            </div>
          </Card>

          {/* Guard direction */}
          <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Guard Facing Direction</span>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Angle</span>
                <span className="text-sm font-black text-blue-400">{Math.round(guardAngleDeg)}°</span>
              </div>
              <input
                type="range" min={-180} max={180} step={1}
                value={guardAngleDeg}
                onChange={(e) => setGuardAngleDeg(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none"
              />
              <div className="flex flex-col gap-1 text-[9px] text-muted-foreground font-mono">
                <span>f⃗ = [{Math.cos(guardAngleDeg * Math.PI / 180).toFixed(2)}, {Math.sin(guardAngleDeg * Math.PI / 180).toFixed(2)}]</span>
              </div>
            </div>
          </Card>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-[10px] select-none">
            {[
              { color: 'bg-blue-400', label: 'f⃗ = Guard facing (normalized)' },
              { color: 'bg-purple-400', label: 't⃗ = Guard → Player (normalized)' },
              { color: 'bg-emerald-400', label: 'Green cone = hidden' },
              { color: 'bg-red-400', label: 'Red cone = detected' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.color}`} />
                <span className="text-muted-foreground font-mono">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="neon" className="rounded-xl h-11 px-6 cursor-pointer" onClick={onComplete}>
          <Zap size={16} /><span>Continue to Game</span><ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
