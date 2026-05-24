import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Zap, Eye, Target, Code2, TrendingDown, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DotProductConceptProps {
  onComplete: () => void;
}

export const DotProductConcept: React.FC<DotProductConceptProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: '1. What Is a Dot Product?',
      icon: Zap,
      iconColor: 'text-neon-primary',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            A <strong className="text-white">dot product</strong> takes two vectors and returns a single number that tells you <strong className="text-white">how much they point in the same direction</strong>. It's one of the most used operations in game dev, 3D graphics, and machine learning.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 select-none">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">The formula</p>
            <div className="flex flex-col gap-2">
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center font-mono text-sm">
                <span className="text-blue-400">A⃗</span> · <span className="text-purple-400">B⃗</span> = <span className="text-blue-400">Aₓ</span>×<span className="text-purple-400">Bₓ</span> + <span className="text-blue-400">Aᵧ</span>×<span className="text-purple-400">Bᵧ</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                {[
                  { label: 'Example', a: '[3, 4]', b: '[1, 2]', result: '3×1 + 4×2 = 11', color: 'border-blue-500/20 bg-blue-500/5' },
                ].map((ex) => (
                  <div key={ex.label} className={`col-span-3 p-2.5 rounded-xl border ${ex.color} font-mono flex items-center gap-3`}>
                    <span className="text-blue-400">A={ex.a}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-purple-400">B={ex.b}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-emerald-400 font-black">{ex.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs select-none">
            {[
              { sign: '> 0', meaning: 'Vectors point in same direction', emoji: '→→', color: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400' },
              { sign: '= 0', meaning: 'Vectors are perpendicular (90°)', emoji: '→↑', color: 'border-amber-500/25 bg-amber-500/5 text-amber-400' },
              { sign: '< 0', meaning: 'Vectors point opposite directions', emoji: '→←', color: 'border-red-500/25 bg-red-500/5 text-red-400' },
            ].map((r) => (
              <div key={r.sign} className={`p-2.5 rounded-xl border ${r.color} flex flex-col gap-1 text-center`}>
                <span className="text-lg">{r.emoji}</span>
                <code className="font-black text-[11px]">dot {r.sign}</code>
                <span className="text-muted-foreground text-[9px] leading-snug">{r.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '2. The Geometric Meaning — Angle Between Vectors',
      icon: Target,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            The dot product is also equal to: <strong className="text-white">|A| × |B| × cos(θ)</strong> — where θ is the angle between them. This is the geometric definition and it's the key to everything.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-3 select-none">
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center font-mono text-sm">
              <span className="text-white">A⃗ · B⃗</span> = <span className="text-amber-400">|A|</span> × <span className="text-purple-400">|B|</span> × <span className="text-neon-primary">cos(θ)</span>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { angle: '0°', cos: 'cos(0°) = 1.0', dot: 'Maximum positive', desc: 'Perfectly aligned — same direction', color: 'text-emerald-400', bar: 100 },
                { angle: '45°', cos: 'cos(45°) ≈ 0.7', dot: 'Positive', desc: 'Mostly same direction', color: 'text-neon-secondary', bar: 70 },
                { angle: '90°', cos: 'cos(90°) = 0', dot: 'Zero', desc: 'Perpendicular — no shared direction', color: 'text-amber-400', bar: 0 },
                { angle: '135°', cos: 'cos(135°) ≈ -0.7', dot: 'Negative', desc: 'Mostly opposite', color: 'text-orange-400', bar: -70 },
                { angle: '180°', cos: 'cos(180°) = -1.0', dot: 'Maximum negative', desc: 'Exactly opposite directions', color: 'text-red-400', bar: -100 },
              ].map((row) => (
                <div key={row.angle} className="flex items-center gap-3">
                  <span className="w-8 text-[10px] font-black text-muted-foreground shrink-0">{row.angle}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-300",
                      row.bar >= 0 ? "bg-neon-primary" : "bg-red-500"
                    )} style={{ width: `${Math.abs(row.bar)}%`, marginLeft: row.bar < 0 ? `${100 - Math.abs(row.bar)}%` : 0 }} />
                  </div>
                  <span className={`text-[9px] font-bold w-20 shrink-0 ${row.color}`}>{row.dot}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-neon-primary/20 bg-neon-primary/5 text-xs text-muted-foreground leading-relaxed">
            💡 <strong className="text-white">Normalization trick:</strong> If both vectors are normalized (length = 1), the dot product directly gives you cos(θ). This is used constantly in games and shaders to find angles cheaply.
          </div>
        </div>
      ),
    },
    {
      title: '3. The Stealth Game — Guard\'s Field of View',
      icon: Eye,
      iconColor: 'text-neon-warning',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            In a stealth game, you need to check: <strong className="text-white">is the player inside the guard's vision cone?</strong> The dot product solves this in 2 lines of code.
          </p>
          <div className="flex flex-col gap-3 text-xs select-none">
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">The two vectors you need:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-blue-500/25 bg-blue-500/5">
                  <span className="text-blue-400 font-black block mb-1">f⃗ — Facing vector</span>
                  <span className="text-muted-foreground leading-snug">The direction the guard is looking. Example: [0, 1] = looking up.</span>
                </div>
                <div className="p-2.5 rounded-xl border border-purple-500/25 bg-purple-500/5">
                  <span className="text-purple-400 font-black block mb-1">t⃗ — Target vector</span>
                  <span className="text-muted-foreground leading-snug">From guard's position → to player's position. Normalized first!</span>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 font-mono text-[11px]">
                <div className="text-slate-500 mb-1">// Can guard see player?</div>
                <div><span className="text-purple-400">const</span> dot = <span className="text-blue-400">normalize(f)</span> · <span className="text-purple-400">normalize(t)</span>;</div>
                <div className="mt-1"><span className="text-purple-400">if</span> (dot <span className="text-amber-400">&gt;</span> <span className="text-emerald-400">0</span>) <span className="text-slate-400">→</span> <span className="text-red-400 font-black">🚨 DETECTED!</span></div>
                <div><span className="text-purple-400">if</span> (dot <span className="text-amber-400">&lt;=</span> <span className="text-emerald-400">0</span>) <span className="text-slate-400">→</span> <span className="text-emerald-400 font-black">✅ hidden</span></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs select-none">
            {[
              { title: 'Behind guard', dot: 'dot < 0', emoji: '🟢', desc: 'Player is behind the guard — safe!', color: 'border-emerald-500/25 bg-emerald-500/5' },
              { title: 'Perpendicular', dot: 'dot = 0', emoji: '🟡', desc: 'On the shoulder line — borderline', color: 'border-amber-500/25 bg-amber-500/5' },
              { title: 'In front', dot: 'dot > 0', emoji: '🔴', desc: 'In front of guard — detected!', color: 'border-red-500/25 bg-red-500/5' },
            ].map((item) => (
              <div key={item.title} className={`p-2.5 rounded-xl border ${item.color} flex flex-col gap-1 text-center`}>
                <span className="text-xl">{item.emoji}</span>
                <code className="font-black text-[10px] text-white">{item.dot}</code>
                <span className="text-muted-foreground text-[9px] leading-snug">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '4. Tighter Vision Cone — The Threshold Trick',
      icon: Target,
      iconColor: 'text-neon-danger',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            A simple <code className="bg-white/10 px-1.5 rounded text-[11px]">dot &gt; 0</code> check gives a 180° vision cone (anything in front). For a tighter cone (like 60° or 45°), compare the dot product against a <strong className="text-white">threshold</strong>.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-3 select-none">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Threshold = cos(half-angle)</p>
            <div className="flex flex-col gap-2">
              {[
                { fov: '180° cone', halfAngle: '90°', cos: 'cos(90°) = 0', threshold: 'dot > 0', color: 'border-blue-500/25 bg-blue-500/5 text-blue-400', width: '100%' },
                { fov: '90° cone', halfAngle: '45°', cos: 'cos(45°) ≈ 0.71', threshold: 'dot > 0.71', color: 'border-neon-primary/25 bg-neon-primary/5 text-neon-primary', width: '60%' },
                { fov: '60° cone', halfAngle: '30°', cos: 'cos(30°) ≈ 0.87', threshold: 'dot > 0.87', color: 'border-amber-500/25 bg-amber-500/5 text-amber-400', width: '40%' },
                { fov: '45° cone', halfAngle: '22.5°', cos: 'cos(22.5°) ≈ 0.92', threshold: 'dot > 0.92', color: 'border-red-500/25 bg-red-500/5 text-red-400', width: '28%' },
              ].map((row) => (
                <div key={row.fov} className={`flex items-center gap-3 p-2 rounded-xl border ${row.color}`}>
                  <div className="flex flex-col gap-0.5 shrink-0 w-20">
                    <span className="font-black text-[10px]">{row.fov}</span>
                    <code className="text-[9px] text-muted-foreground">{row.threshold}</code>
                  </div>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-current opacity-60`} style={{ width: row.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-neon-secondary/20 bg-neon-secondary/5 text-xs text-muted-foreground leading-relaxed">
            💡 <strong className="text-white">Tip:</strong> Pre-compute the threshold once as <code className="bg-white/10 px-1 rounded text-[10px]">Math.cos(angleInRadians)</code> and reuse it every frame — no expensive inverse trig needed at runtime!
          </div>
        </div>
      ),
    },
    {
      title: '5. The Code — Clean Implementation',
      icon: Code2,
      iconColor: 'text-neon-success',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Here's the complete implementation. Notice it's just arithmetic — no trigonometry at runtime:
          </p>
          <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto select-all">
            <div className="text-slate-500 mb-2">// Normalize a 2D vector to length 1</div>
            <div><span className="text-purple-400">function</span> <span className="text-blue-400">normalize</span>(v) {'{'}</div>
            <div className="pl-4"><span className="text-purple-400">const</span> len = Math.sqrt(v.x**<span className="text-emerald-400">2</span> + v.y**<span className="text-emerald-400">2</span>);</div>
            <div className="pl-4"><span className="text-purple-400">return</span> {'{ x: v.x / len, y: v.y / len }'};</div>
            <div>{'}'}</div>
            <div className="mt-3 text-slate-500">// Dot product of two 2D vectors</div>
            <div><span className="text-purple-400">function</span> <span className="text-blue-400">dot</span>(a, b) {'{'}</div>
            <div className="pl-4"><span className="text-purple-400">return</span> a.x * b.x + a.y * b.y;</div>
            <div>{'}'}</div>
            <div className="mt-3 text-slate-500">// Can guard see player? (60° FOV cone)</div>
            <div><span className="text-purple-400">function</span> <span className="text-blue-400">canSeePlayer</span>(guard, player, facing, fovAngle) {'{'}</div>
            <div className="pl-4 text-slate-500">// Vector from guard → player</div>
            <div className="pl-4"><span className="text-purple-400">const</span> toPlayer = normalize({'{'}</div>
            <div className="pl-8">x: player.x - guard.x,</div>
            <div className="pl-8">y: player.y - guard.y</div>
            <div className="pl-4">{'}'});</div>
            <div className="pl-4 mt-1"><span className="text-purple-400">const</span> facingNorm = normalize(facing);</div>
            <div className="pl-4"><span className="text-purple-400">const</span> dotResult = dot(facingNorm, toPlayer);</div>
            <div className="pl-4"><span className="text-purple-400">const</span> threshold = Math.cos(fovAngle / <span className="text-emerald-400">2</span>);</div>
            <div className="pl-4 mt-1"><span className="text-purple-400">return</span> dotResult {'>'} threshold; <span className="text-slate-500">// true = detected!</span></div>
            <div>{'}'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="font-black text-emerald-400 block mb-1">⚡ Performance</span>
              <span className="text-muted-foreground">Only 5 multiply + 3 add ops. Runs millions of times per frame in games.</span>
            </div>
            <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <span className="font-black text-blue-400 block mb-1">🔧 In Unity</span>
              <span className="text-muted-foreground"><code className="text-[9px]">Vector3.Dot(transform.forward, dir)</code> is the built-in equivalent.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '6. Beyond Games — Where Dot Products Show Up',
      icon: TrendingDown,
      iconColor: 'text-neon-warning',
      content: (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Dot product is everywhere. Once you see it, you can't unsee it:
          </p>
          <div className="flex flex-col gap-2 text-xs select-none">
            {[
              { name: '🎮 Diffuse Lighting (Shaders)', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400', desc: 'dot(surfaceNormal, lightDirection) tells you how bright a surface is. This is the Lambert lighting model used in every 3D game.' },
              { name: '🤖 Similarity in Machine Learning', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400', desc: 'In recommendation systems and NLP, dot product (cosine similarity) measures how similar two items or documents are. Used in every search engine.' },
              { name: '🔭 Backface Culling', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400', desc: 'If dot(faceNormal, cameraDirection) < 0, the polygon is facing away — skip rendering it. Saves ~50% GPU work.' },
              { name: '📐 Projecting onto an Axis', color: 'border-amber-500/20 bg-amber-500/5 text-amber-400', desc: 'dot(velocity, normal) tells you the speed component in a direction. Used for physics (wall sliding, bouncing).' },
            ].map((item) => (
              <div key={item.name} className={`p-3 rounded-xl border ${item.color} flex flex-col gap-1`}>
                <span className={`font-extrabold text-xs ${item.color.split(' ')[2]}`}>{item.name}</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '7. Real Systems That Use It',
      icon: Database,
      iconColor: 'text-neon-primary',
      content: (
        <div className="flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Dot product isn't just academic — it's at the core of industry systems you use daily:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { name: 'ChatGPT / Embeddings', emoji: '🧠', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400', desc: 'LLMs find the most relevant text by computing dot products between query embeddings and document embeddings. Called "semantic search".' },
              { name: 'Unreal / Unity Engine', emoji: '🎮', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400', desc: 'Vision cone checks, lighting, physics projections, and GPU shaders all use dot products millions of times per frame.' },
              { name: 'Spotify Recommendations', emoji: '🎵', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400', desc: 'Song similarity is calculated via dot product on audio feature vectors. That\'s how it finds songs "similar" to what you like.' },
              { name: 'GPU Neural Networks', emoji: '⚡', color: 'border-amber-500/20 bg-amber-500/5 text-amber-400', desc: 'Every neural network layer is matrix multiplication — which is just millions of dot products done in parallel on GPUs.' },
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

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
          <ActiveIcon size={22} className={slides[currentSlide].iconColor} />
          <h2 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">{slides[currentSlide].title}</h2>
          <span className="ml-auto text-[10px] text-muted-foreground font-bold shrink-0">{currentSlide + 1}/{slides.length}</span>
        </div>
        <div className="flex-1">{slides[currentSlide].content}</div>
      </div>

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
