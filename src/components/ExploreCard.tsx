import React from 'react'
import { Brain, Clock, Zap, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LessonData {
  id: string
  title: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  xp: number
  description: string
  visualType: 'bloom' | 'bst' | 'hashing' | 'sort' | 'graph' | 'raft'
}

interface ExploreCardProps {
  lesson: LessonData
  onStart: (lessonId: string) => void
}

export const ExploreCard: React.FC<ExploreCardProps> = ({ lesson, onStart }) => {
  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'Beginner': 
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
      case 'Intermediate': 
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
      case 'Advanced': 
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/25'
      default: 
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
    }
  }

  // Renders a beautiful visual teaser corresponding to the algorithm type
  const renderVisualTeaser = () => {
    switch (lesson.visualType) {
      case 'bloom':
        return (
          <div className="teaser-box w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
            <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px] drop-shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <defs>
                <filter id="glow-bloom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Items at Top */}
              {/* Insert "alice" */}
              <g transform="translate(45, 20)">
                <rect x="-26" y="-9" width="52" height="18" rx="6" fill="rgba(139, 92, 246, 0.15)" stroke="var(--neon-primary)" strokeWidth="1" filter="url(#glow-bloom)" />
                <text x="0" y="3" fill="#fff" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">"alice"</text>
                <text x="0" y="-12" fill="#a78bfa" fontSize="5.5" fontWeight="black" letterSpacing="0.5" textAnchor="middle">INSERT</text>
              </g>

              {/* Check "bob" */}
              <g transform="translate(155, 20)">
                <rect x="-26" y="-9" width="52" height="18" rx="6" fill="rgba(6, 182, 212, 0.15)" stroke="var(--neon-secondary)" strokeWidth="1" filter="url(#glow-bloom)" />
                <text x="0" y="3" fill="#fff" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">"bob"</text>
                <text x="0" y="-12" fill="#22d3ee" fontSize="5.5" fontWeight="black" letterSpacing="0.5" textAnchor="middle">CHECK</text>
              </g>

              {/* Hash Functions in Middle */}
              <g transform="translate(70, 58)">
                <rect x="-18" y="-8" width="36" height="16" rx="4" fill="#0f172a" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                <text x="0" y="2.5" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">hash_1</text>
              </g>
              <g transform="translate(130, 58)">
                <rect x="-18" y="-8" width="36" height="16" rx="4" fill="#0f172a" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                <text x="0" y="2.5" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">hash_2</text>
              </g>

              {/* Paths for "alice" (Insert) */}
              <path d="M 45 29 L 70 50" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,2" fill="none" opacity="0.8">
                <animate attributeName="stroke-dashoffset" values="15;0" dur="1.2s" repeatCount="indefinite" />
              </path>
              <path d="M 70 66 L 45 88" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,2" fill="none" opacity="0.8">
                <animate attributeName="stroke-dashoffset" values="15;0" dur="1.2s" repeatCount="indefinite" />
              </path>

              <path d="M 45 29 L 130 50" stroke="#8b5cf6" strokeWidth="0.8" strokeDasharray="3,2" fill="none" opacity="0.5">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.8s" repeatCount="indefinite" />
              </path>
              <path d="M 130 66 L 115 88" stroke="#8b5cf6" strokeWidth="0.8" strokeDasharray="3,2" fill="none" opacity="0.5">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.8s" repeatCount="indefinite" />
              </path>

              {/* Paths for "bob" (Check) */}
              <path d="M 155 29 L 70 50" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3,2" fill="none" opacity="0.5">
                <animate attributeName="stroke-dashoffset" values="0;20" dur="1.8s" repeatCount="indefinite" />
              </path>
              <path d="M 70 66 L 115 88" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3,2" fill="none" opacity="0.5">
                <animate attributeName="stroke-dashoffset" values="0;20" dur="1.8s" repeatCount="indefinite" />
              </path>

              <path d="M 155 29 L 130 50" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3,2" fill="none" opacity="0.8">
                <animate attributeName="stroke-dashoffset" values="0;15" dur="1.2s" repeatCount="indefinite" />
              </path>
              <path d="M 130 66 L 185 88" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3,2" fill="none" opacity="0.8">
                <animate attributeName="stroke-dashoffset" values="0;15" dur="1.2s" repeatCount="indefinite" />
              </path>

              {/* Bit Array at Bottom */}
              <g transform="translate(10, 88)">
                {/* 0 */}
                <rect x="0" y="0" width="16" height="16" rx="3" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <text x="8" y="10.5" fill="#475569" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">0</text>

                {/* 1 (alice) */}
                <rect x="25" y="0" width="16" height="16" rx="3" fill="rgba(139, 92, 246, 0.25)" stroke="#8b5cf6" strokeWidth="0.8" />
                <text x="33" y="10.5" fill="#fff" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">1</text>

                {/* 2 */}
                <rect x="50" y="0" width="16" height="16" rx="3" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <text x="58" y="10.5" fill="#475569" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">0</text>

                {/* 3 */}
                <rect x="75" y="0" width="16" height="16" rx="3" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <text x="83" y="10.5" fill="#475569" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">0</text>

                {/* 4 (alice & bob) */}
                <rect x="100" y="0" width="16" height="16" rx="3" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="0.8" />
                <rect x="100" y="0" width="16" height="16" rx="3" fill="none" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2,1.5" />
                <text x="108" y="10.5" fill="#fff" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">1</text>

                {/* 5 */}
                <rect x="125" y="0" width="16" height="16" rx="3" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <text x="133" y="10.5" fill="#475569" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">0</text>

                {/* 6 */}
                <rect x="150" y="0" width="16" height="16" rx="3" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <text x="158" y="10.5" fill="#475569" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">0</text>

                {/* 7 (bob) */}
                <rect x="175" y="0" width="16" height="16" rx="3" fill="rgba(6, 182, 212, 0.25)" stroke="#06b6d4" strokeWidth="0.8" />
                <text x="183" y="10.5" fill="#fff" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">1</text>
              </g>
            </svg>
          </div>
        )
      case 'bst':
        return (
          <div className="teaser-box w-full h-full flex items-center justify-center relative">
            <svg viewBox="0 0 100 80" className="teaser-svg w-3/5 height-auto filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              {/* Nodes and branches */}
              <line x1="50" y1="15" x2="25" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <line x1="50" y1="15" x2="75" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <circle cx="50" cy="15" r="8" fill="var(--neon-primary)" />
              <circle cx="25" cy="40" r="8" fill="var(--neon-secondary)" />
              <circle cx="75" cy="40" r="8" fill="var(--neon-secondary)" />
              <text x="50" y="18" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">8</text>
              <text x="25" y="43" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">3</text>
              <text x="75" y="43" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">10</text>
            </svg>
          </div>
        )
      case 'hashing':
        return (
          <div className="teaser-box w-full h-full flex items-center justify-center relative">
            <div className="hashing-flow flex items-center gap-2 p-3 bg-white/2 rounded-xl border border-white/5 text-xs font-semibold">
              <span className="hash-key font-mono text-neon-secondary">"user_1"</span>
              <span className="hash-arrow text-muted-foreground">➔</span>
              <span className="hash-box px-2 py-1 rounded bg-background/50 border border-white/5 font-mono text-[10px]">MD5</span>
              <span className="hash-arrow text-muted-foreground">➔</span>
              <span className="hash-index font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-[10px]">Index 7</span>
            </div>
          </div>
        )
      case 'sort':
        return (
          <div className="teaser-box w-full h-full flex items-center justify-center p-6 relative">
            <div className="sort-bars flex items-end gap-1.5 w-4/5 h-3/5">
              {[30, 80, 50, 95, 20, 60, 40].map((height, i) => (
                <div
                  key={i}
                  className="sort-bar flex-1 rounded-t transition-all duration-300"
                  style={{
                    height: `${height}%`,
                    background: i === 3 ? 'var(--neon-primary)' : i === 4 ? 'var(--neon-secondary)' : 'rgba(139, 92, 246, 0.4)'
                  }}
                />
              ))}
            </div>
          </div>
        )
      case 'raft':
        return (
          <div className="teaser-box w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
            <svg viewBox="0 0 200 150" className="w-full h-full max-h-[140px] drop-shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <defs>
                <filter id="glow-raft" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw cluster topology circle connection dashed lines */}
              <circle cx="100" cy="82" r="46" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1.5" strokeDasharray="4,4" />

              {/* Election Title */}
              <text x="100" y="18" fill="#f59e0b" fontSize="7.5" fontWeight="black" letterSpacing="1" textAnchor="middle">LEADER ELECTION</text>

              {/* Connective Arrows / Vote Flows from followers to Candidate */}
              {/* Candidate is Node 1 at top: (100, 38) */}
              {/* Node 2 (Right): (144, 70) */}
              {/* Node 3 (Bottom Right): (127, 122) */}
              {/* Node 4 (Bottom Left): (73, 122) */}
              {/* Node 5 (Left): (56, 70) */}

              {/* Vote requests / grants */}
              {/* Node 2 to Candidate */}
              <path d="M 144 70 Q 122 46 100 38" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2" fill="none">
                <animate attributeName="stroke-dashoffset" values="15;0" dur="1.2s" repeatCount="indefinite" />
              </path>
              
              {/* Node 3 to Candidate */}
              <path d="M 127 122 Q 113.5 80 100 38" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2" fill="none">
                <animate attributeName="stroke-dashoffset" values="15;0" dur="1s" repeatCount="indefinite" />
              </path>

              {/* Node 4 to Candidate (Failed) */}
              <path d="M 73 122 Q 86.5 80 100 38" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,2" fill="none" opacity="0.2" />

              {/* Node 5 to Candidate */}
              <path d="M 56 70 Q 78 46 100 38" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2" fill="none">
                <animate attributeName="stroke-dashoffset" values="15;0" dur="1.4s" repeatCount="indefinite" />
              </path>

              {/* Node 1: Candidate (Top, (100, 38)) */}
              <g transform="translate(100, 38)">
                <circle r="13" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="1.8" filter="url(#glow-raft)">
                  <animate attributeName="r" values="13;14;13" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="0" y="2.5" fill="#f59e0b" fontSize="7" fontWeight="black" textAnchor="middle">CAND</text>
                <text x="0" y="22" fill="#f59e0b" fontSize="5.5" fontWeight="bold" textAnchor="middle">Node 1 (Term 2)</text>
                <text x="0" y="28.5" fill="#10b981" fontSize="5" fontWeight="black" textAnchor="middle">Votes: 4/5</text>
              </g>

              {/* Node 2: Follower (Right, (144, 70)) */}
              <g transform="translate(144, 70)">
                <circle r="9" fill="#0f172a" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
                <text x="0" y="1.5" fill="#94a3b8" fontSize="5" fontWeight="bold" textAnchor="middle">VOTE</text>
                <text x="14" y="2" fill="#10b981" fontSize="6" fontWeight="black">YES</text>
              </g>

              {/* Node 3: Follower (Bottom Right, (127, 122)) */}
              <g transform="translate(127, 122)">
                <circle r="9" fill="#0f172a" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
                <text x="0" y="1.5" fill="#94a3b8" fontSize="5" fontWeight="bold" textAnchor="middle">VOTE</text>
                <text x="14" y="2" fill="#10b981" fontSize="6" fontWeight="black">YES</text>
              </g>

              {/* Node 4: Offline / Failed (Bottom Left, (73, 122)) */}
              <g transform="translate(73, 122)">
                <circle r="9" fill="#180c0c" stroke="#ef4444" strokeWidth="1.2" opacity="0.4" />
                <text x="0" y="2" fill="#ef4444" fontSize="5" fontWeight="bold" textAnchor="middle" opacity="0.5">DOWN</text>
              </g>

              {/* Node 5: Follower (Left, (56, 70)) */}
              <g transform="translate(56, 70)">
                <circle r="9" fill="#0f172a" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
                <text x="0" y="1.5" fill="#94a3b8" fontSize="5" fontWeight="bold" textAnchor="middle">VOTE</text>
                <text x="-18" y="2" fill="#10b981" fontSize="6" fontWeight="black">YES</text>
              </g>
            </svg>
          </div>
        )
      default:
        return (
          <div className="teaser-box w-full h-full flex items-center justify-center relative">
            <Brain size={48} className="floating-brain text-neon-primary/70 animate-float" />
          </div>
        )
    }
  }

  return (
    <div className="explore-slide h-full w-full flex justify-center items-start pt-3 pb-5 px-5 md:items-center md:pt-5 select-none" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <Card 
        glass
        className="explore-card-container w-full max-w-[420px] max-h-[640px] h-[calc(100%-16px)] md:h-[calc(100%-32px)] rounded-[32px] flex flex-col p-6 border-white/5 bg-slate-950/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(139,92,246,0.03)] animate-slide-up"
      >
        {/* Category Header */}
        <div className="card-header flex justify-between items-center mb-4">
          <span className="category-tag text-xs font-bold text-neon-secondary uppercase tracking-wider flex items-center gap-1.5">
            {lesson.category}
          </span>
          <div className="header-meta">
            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getDifficultyStyles(lesson.difficulty))}>
              {lesson.difficulty}
            </span>
          </div>
        </div>

        {/* Visual Teaser Area */}
        <div className="card-visual-area flex-1 bg-black/30 rounded-2xl border border-white/5 overflow-hidden mb-5 relative flex items-center justify-center min-h-[160px]">
          {renderVisualTeaser()}
        </div>

        {/* Info Area */}
        <div className="card-info-area flex flex-col gap-3">
          <h2 className="lesson-title text-xl md:text-2xl font-extrabold tracking-tight text-foreground leading-none">
            {lesson.title}
          </h2>
          <p className="lesson-description text-sm text-muted-foreground leading-relaxed">
            {lesson.description}
          </p>
          
          <div className="lesson-stats flex gap-4 mt-1 mb-2">
            <div className="stat-item flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Clock size={16} className="text-muted-foreground/80" />
              <span>{lesson.duration}</span>
            </div>
            <div className="stat-item flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Zap size={16} className="text-neon-warning/80" />
              <span>{lesson.xp} XP</span>
            </div>
          </div>

          <Button 
            variant="neon" 
            size="lg"
            className="w-full rounded-2xl text-base py-6 cursor-pointer"
            onClick={() => onStart(lesson.id)}
          >
            <BookOpen size={18} />
            <span>Dive Into Lesson</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
