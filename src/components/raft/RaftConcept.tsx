import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Lightbulb, ShieldAlert, Cpu, Layers, Plus, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RaftConceptProps {
  onComplete: () => void;
}

export const RaftConcept: React.FC<RaftConceptProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      title: '1. Distributed Consensus & Split-Brain Threat',
      icon: Cpu,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            In modern cloud environments, services run across multiple servers (nodes) to survive hardware failures. But if a network partition cuts the cluster in half, how do we prevent different groups from updating data independently?
          </p>
          <div className="highlight-box p-3.5 rounded-xl border border-neon-primary/20 bg-neon-primary/5 text-xs md:text-sm leading-relaxed text-foreground">
            <strong>Consensus</strong> is the process of getting multiple independent machines to agree on a single state machine. Without consensus, we get a **split-brain** bug where two partitions accept opposing client writes, corrupting the database.
          </div>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 mt-1 select-none">
            <div className="flex gap-4">
              <div className="w-16 h-12 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                Node A
              </div>
              <div className="w-16 h-12 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                Node B
              </div>
              <div className="w-16 h-12 rounded-xl bg-slate-900 border border-red-500/30 text-red-500 flex items-center justify-center font-mono text-[10px] font-bold opacity-50 relative">
                <span className="absolute -top-1 -right-1 text-[7px] bg-red-500 text-white px-1 rounded font-sans">CRASHED</span>
                Node C
              </div>
            </div>
            <span className="visual-caption text-[10px] text-muted-foreground">Nodes A & B must safely agree to make progress even if C goes down.</span>
          </div>
        </div>
      )
    },
    {
      title: '2. The Raft Strategy: Strong Leader',
      icon: Layers,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Raft simplifies consensus by routing all commands through a **Strong Leader**. Nodes exist in one of three states:
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1 select-none">
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 text-center flex flex-col gap-1">
              <span className="text-xs font-black text-slate-300">Follower</span>
              <span className="text-[9px] text-muted-foreground leading-snug">Passive. Simply replicates the leader's logs.</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 text-center flex flex-col gap-1">
              <span className="text-xs font-black text-amber-400">Candidate</span>
              <span className="text-[9px] text-muted-foreground leading-snug">Active. Triggers election to solicit votes.</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 text-center flex flex-col gap-1">
              <span className="text-xs font-black text-emerald-400">Leader</span>
              <span className="text-[9px] text-muted-foreground leading-snug">Active. Decides log order & sends heartbeats.</span>
            </div>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground mt-1">
            If the Leader crashes or fails to send heartbeats, a Follower automatically steps up to candidate state to elect a replacement.
          </p>
        </div>
      )
    },
    {
      title: '3. Leader Election, Terms & Safety Rules',
      icon: Lightbulb,
      iconColor: 'text-neon-warning',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Time is divided into numbered **Terms** (logical clocks). If a Follower stopped hearing heartbeats and its election timeout expires:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs md:text-sm text-muted-foreground">
            <li>It increments its Term and becomes a <strong>Candidate</strong>.</li>
            <li>It votes for itself and requests votes from all other nodes.</li>
            <li>To become leader, it must win a **majority quorum** (e.g., at least 3 votes in a 5-node cluster).</li>
          </ul>
          <div className="highlight-box p-3 rounded-xl border border-amber-500/25 bg-amber-500/5 text-xs leading-relaxed text-foreground">
            <strong>Leader Completeness safety rule:</strong> A node will only vote for a candidate if the candidate's log is **at least as up-to-date** as its own. This guarantees that a newly elected leader contains all committed entries from prior terms.
          </div>
        </div>
      )
    },
    {
      title: '4. Log Replication & Quorum Commitment',
      icon: Plus,
      iconColor: 'text-neon-success',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Once a Leader is active, it handles client reads/writes. The replication process follows a strict transaction cycle:
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-1 text-xs md:text-sm text-muted-foreground">
            <li>Leader appends the command to its log as <strong>Uncommitted</strong>.</li>
            <li>Leader broadcasts the log entry via <code>AppendEntries</code> RPCs.</li>
            <li>Followers append the entry and reply.</li>
            <li>Once the Leader hears back from a **majority (quorum)**, it marks the entry as <strong>Committed</strong>, applies it to its local State Machine, and replies success to the client.</li>
          </ol>
          <div className="concept-visual bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-2 select-none">
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-white/5 text-[10px]">
              <span className="font-bold text-emerald-400">Leader (Node 1) Log:</span>
              <span className="font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[8px]">COMMITTED</span>
            </div>
            <div className="flex gap-2 justify-center text-[9px] font-mono">
              <span className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">SET x = 5</span>
              <span className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">SET y = 10</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '5. Surviving Network Partitions (Split-Brain)',
      icon: ShieldAlert,
      iconColor: 'text-neon-danger',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            If a network split separates Nodes 1 & 2 from Nodes 3, 4, & 5, how does the cluster handle writes?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40">
              <span className="text-xs font-bold text-red-400 block mb-1">Minority Partition (1, 2)</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Node 1 accepts writes but can never replicate to a majority (only 2/5 reached). Writes remain uncommitted and are never completed.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40">
              <span className="text-xs font-bold text-emerald-400 block mb-1">Majority Partition (3, 4, 5)</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Detects leader timeout, elects a new leader (Node 3, Term 2), and commits client writes normally (3/5 reached).
              </p>
            </div>
          </div>
          <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
            When healed, Nodes 1 & 2 step down to Followers upon discovering Term 2. They overwrite their uncommitted, stale entries to sync with the majority.
          </p>
        </div>
      )
    },
    {
      title: '6. Real-World Applications & Use Cases',
      icon: Database,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Consensus is the core foundation of modern cloud-native architectures. Raft is widely used in critical services:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-secondary"></span>
                <span className="text-xs font-extrabold text-white">Kubernetes & etcd</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong>etcd</strong> is a Raft-replicated key-value store that serves as the single source of truth for Kubernetes, storing all container configs, states, and secrets.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-secondary"></span>
                <span className="text-xs font-extrabold text-white">Consul & Config Registries</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                HashiCorp <strong>Consul</strong> replicates service registries and configuration flags across distributed nodes using Raft to prevent service mesh blackouts.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-secondary"></span>
                <span className="text-xs font-extrabold text-white">Distributed Databases</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Modern databases like <strong>CockroachDB</strong>, <strong>YugabyteDB</strong>, and <strong>TiDB</strong> use Raft internally to replicate write-ahead logs across regions.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-secondary"></span>
                <span className="text-xs font-extrabold text-white">Apache Kafka (KRaft)</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Kafka's metadata mode (KRaft) replicates topic metadata, partitions, and controller elections across brokers in milliseconds, replacing ZooKeeper.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const ActiveIcon = slides[currentSlide].icon;

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
            <span>Simulator</span>
            <ArrowRight size={18} />
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
  );
};
