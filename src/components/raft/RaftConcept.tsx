import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Lightbulb, ShieldAlert, Cpu, Layers, Plus, Database, Zap } from 'lucide-react';
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
      title: '1. Why Do We Need Multiple Servers?',
      icon: Cpu,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Imagine your app runs on just <strong className="text-white">one server</strong>. What happens when it crashes at 3 AM? 💀 Everything goes down. That's why we spread our app across <strong className="text-white">multiple servers</strong> (called <em>nodes</em>) so if one dies, the others keep running.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 select-none">
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold">Server A</div>
                <span className="text-[9px] text-emerald-400 font-bold">✓ OK</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold">Server B</div>
                <span className="text-[9px] text-emerald-400 font-bold">✓ OK</span>
              </div>
              <div className="flex flex-col items-center gap-1 relative">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center font-mono text-[10px] font-bold opacity-60">Server C</div>
                <span className="text-[9px] text-red-400 font-bold">✗ Crashed</span>
                <span className="absolute -top-1 -right-1 text-[7px] bg-red-500 text-white px-1 rounded font-sans">DOWN</span>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">Servers A & B can still serve users even when C crashes.</p>
          </div>
          <div className="p-3 rounded-xl border border-neon-primary/20 bg-neon-primary/5 text-xs leading-relaxed text-foreground">
            <strong>But here's the problem 🤔</strong> — if all 3 servers accept writes independently, they'll have <em>different data</em>. Which one is correct? This is the <strong>distributed consensus problem</strong>.
          </div>
        </div>
      )
    },
    {
      title: '2. The "One Boss" Solution — Raft',
      icon: Layers,
      iconColor: 'text-neon-secondary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Raft solves this with a simple rule: <strong className="text-white">only ONE server is in charge at a time</strong> — called the <strong className="text-emerald-400">Leader</strong>. All writes go through the leader, who then tells the others. Think of it like a team with one project manager.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1 select-none">
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-center flex flex-col gap-1.5">
              <span className="text-lg">😴</span>
              <span className="text-xs font-black text-slate-300">Follower</span>
              <span className="text-[9px] text-muted-foreground leading-snug">Listens to the leader and copies everything it does.</span>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center flex flex-col gap-1.5">
              <span className="text-lg">🙋</span>
              <span className="text-xs font-black text-amber-400">Candidate</span>
              <span className="text-[9px] text-muted-foreground leading-snug">Raises its hand and says "I want to be leader! Vote for me!"</span>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center flex flex-col gap-1.5">
              <span className="text-lg">👑</span>
              <span className="text-xs font-black text-emerald-400">Leader</span>
              <span className="text-[9px] text-muted-foreground leading-snug">The boss. Handles all writes & sends a heartbeat to prove it's alive.</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-neon-secondary/20 bg-neon-secondary/5 text-xs leading-relaxed text-muted-foreground">
            💡 <strong className="text-white">Heartbeat</strong> = a tiny "I'm still alive!" message the leader sends every few milliseconds to all followers. If followers stop hearing it, they know the leader is dead and start an election.
          </div>
        </div>
      )
    },
    {
      title: '3. What Happens When the Leader Dies?',
      icon: Lightbulb,
      iconColor: 'text-neon-warning',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Every follower has an internal countdown timer (called the <strong className="text-white">election timeout</strong>). If the timer hits zero without hearing from the leader — it assumes the leader is gone and starts an election.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 select-none text-xs">
            {[
              { step: '1', color: 'border-red-500/30 bg-red-500/5', emoji: '💀', label: 'Leader crashes — heartbeats stop.' },
              { step: '2', color: 'border-amber-500/30 bg-amber-500/5', emoji: '⏱️', label: 'Node B\'s timeout expires first. It becomes a Candidate.' },
              { step: '3', color: 'border-blue-500/30 bg-blue-500/5', emoji: '🗳️', label: 'Node B votes for itself and asks all others: "Vote for me!"' },
              { step: '4', color: 'border-emerald-500/30 bg-emerald-500/5', emoji: '✅', label: 'Majority votes yes → Node B becomes the new Leader!' },
            ].map(s => (
              <div key={s.step} className={`flex items-center gap-3 p-2.5 rounded-xl border ${s.color}`}>
                <span className="text-base">{s.emoji}</span>
                <span className="text-muted-foreground leading-snug">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/5 text-xs leading-relaxed text-foreground">
            <strong>What is a "Term"?</strong> — Think of it like a political term. Term 1 = first leader's reign. Term 2 = next election cycle. The term number always increases and helps nodes detect stale info from the past.
          </div>
        </div>
      )
    },
    {
      title: '4. Majority Voting — Why 3 out of 5?',
      icon: Plus,
      iconColor: 'text-neon-success',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            To become leader, a candidate needs <strong className="text-white">more than half the votes</strong>. This is called a <strong className="text-emerald-400">quorum</strong>. In a 5-node cluster, quorum = 3 votes.
          </p>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-3 select-none">
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-black",
                  i <= 3 ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-slate-700 bg-slate-900/50 text-slate-500"
                )}>
                  N{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground">Nodes 1, 2, 3 vote YES → <span className="text-emerald-400 font-bold">3/5 = majority ✓</span></p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-emerald-400 font-black block mb-1">✅ Why quorum works</span>
              <span className="text-muted-foreground leading-snug">Even if 2 nodes crash in a 5-node cluster, the remaining 3 can still make decisions.</span>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <span className="text-blue-400 font-black block mb-1">📝 Safety rule</span>
              <span className="text-muted-foreground leading-snug">A node only votes for a candidate whose log is as up-to-date as its own — no outdated leaders!</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '5. Writing Data — How Replication Works',
      icon: Plus,
      iconColor: 'text-neon-success',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            When your app writes data (e.g. <code className="bg-white/10 px-1 rounded text-[11px]">SET x = 5</code>), here's what Raft does step-by-step:
          </p>
          <div className="flex flex-col gap-2 text-xs select-none">
            {[
              { n: '1', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5', t: 'Client → Leader', d: 'Your app sends the write to the leader. Only the leader accepts writes.' },
              { n: '2', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5', t: 'Leader appends to its log', d: 'The entry is marked "pending" (uncommitted) in the leader\'s log.' },
              { n: '3', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5', t: 'Leader → Followers (AppendEntries)', d: 'The leader tells all followers: "Hey, add this entry to your log too."' },
              { n: '4', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5', t: 'Quorum replied → COMMITTED ✓', d: 'Once 3+ nodes confirm, the entry is COMMITTED and the leader replies success to your app.' },
            ].map(s => (
              <div key={s.n} className={`flex gap-3 items-start p-2.5 rounded-xl border ${s.color.split(' ').slice(1).join(' ')}`}>
                <span className={`text-sm font-black ${s.color.split(' ')[0]} shrink-0 w-4`}>{s.n}</span>
                <div>
                  <span className={`font-bold block ${s.color.split(' ')[0]}`}>{s.t}</span>
                  <span className="text-muted-foreground leading-snug">{s.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '6. Network Split — What Happens?',
      icon: ShieldAlert,
      iconColor: 'text-neon-danger',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Imagine the network cable between your servers gets cut. Now Node 1 & 2 can't talk to Nodes 3, 4 & 5. This is called a <strong className="text-white">network partition</strong>.
          </p>
          <div className="grid grid-cols-2 gap-3 select-none text-xs">
            <div className="p-3 rounded-xl border border-red-500/25 bg-red-500/5 flex flex-col gap-1.5">
              <span className="font-black text-red-400">⚠️ Minority Side (1, 2)</span>
              <p className="text-muted-foreground leading-snug">
                Node 1 was the old leader but now it can only reach 2/5 nodes — no quorum. Every write gets <span className="text-red-400 font-bold">STUCK</span> waiting forever. Nothing is committed.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex flex-col gap-1.5">
              <span className="font-black text-emerald-400">✅ Majority Side (3, 4, 5)</span>
              <p className="text-muted-foreground leading-snug">
                Node 3 detects no heartbeat → starts election → wins with 3 votes → becomes new leader. <span className="text-emerald-400 font-bold">Writes continue</span> normally.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-white">When the network heals:</strong> Node 1 sees a higher term (Term 2) from Node 3 and immediately steps down. It deletes its uncommitted writes and syncs with the new leader. No data corruption! 🎉
          </div>
        </div>
      )
    },
    {
      title: '7. Where is Raft Used in the Real World?',
      icon: Database,
      iconColor: 'text-neon-primary',
      content: (
        <div className="concept-slide-content flex flex-col gap-3.5 animate-slide-up">
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Raft isn't just a textbook algorithm — it's running in production systems that power millions of apps right now:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { name: 'Kubernetes (etcd)', emoji: '☸️', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400', desc: 'etcd is the "brain" of Kubernetes. It uses Raft to store all your pod configs, secrets, and states. If etcd goes down, your whole cluster is dead.' },
              { name: 'Apache Kafka (KRaft)', emoji: '📨', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400', desc: 'Kafka replaced ZooKeeper with its own Raft implementation to manage topic metadata and broker elections.' },
              { name: 'CockroachDB / TiDB', emoji: '🪳', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400', desc: 'Distributed SQL databases that use Raft per-shard to replicate writes across regions with zero data loss.' },
              { name: 'HashiCorp Consul', emoji: '🌍', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400', desc: 'Service discovery & config management tool that uses Raft to agree on which services are healthy across datacenters.' },
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
  ];

  const ActiveIcon = slides[currentSlide].icon;

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
  );
};
