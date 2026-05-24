import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Power, Network, Send, Skull, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RaftNode {
  id: number;
  state: 'follower' | 'candidate' | 'leader' | 'offline';
  term: number;
  votedFor: number | null;
  votesReceived: number;
  timeout: number;
  maxTimeout: number;
  logs: string[];
}

interface VoteArrow {
  fromId: number;
  toId: number;
  id: string;
}

interface RaftSimulatorProps {
  onComplete: () => void;
}

const randomTimeout = () => Math.floor(Math.random() * 11) + 12;

const INITIAL_NODES: RaftNode[] = [
  { id: 1, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 15, maxTimeout: 15, logs: [] },
  { id: 2, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 20, maxTimeout: 20, logs: [] },
  { id: 3, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 24, maxTimeout: 24, logs: [] },
  { id: 4, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 18, maxTimeout: 18, logs: [] },
  { id: 5, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 22, maxTimeout: 22, logs: [] },
];

export const RaftSimulator: React.FC<RaftSimulatorProps> = ({ onComplete }) => {
  const [nodes, setNodes] = useState<RaftNode[]>(INITIAL_NODES.map(n => ({ ...n })));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPartitioned, setIsPartitioned] = useState<boolean>(false);
  const [activeLeaderId, setActiveLeaderId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>(['[System] Cluster initialized. All nodes in Follower state. Term 1.']);
  const [clientValue, setClientValue] = useState<string>('');
  const [clusterLogs, setClusterLogs] = useState<{ term: number; val: string; committed: boolean }[]>([]);
  const [voteArrows, setVoteArrows] = useState<VoteArrow[]>([]);
  const [isElectionRunning, setIsElectionRunning] = useState<boolean>(false);
  const [killingLeader, setKillingLeader] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Node positions — pentagon layout in a 320x300 canvas
  const nodePositions = [
    { x: 160, y: 40 },   // Node 1 (Top)
    { x: 270, y: 120 },  // Node 2 (Right)
    { x: 225, y: 250 },  // Node 3 (Bottom Right)
    { x: 95, y: 250 },   // Node 4 (Bottom Left)
    { x: 50, y: 120 },   // Node 5 (Left)
  ];

  const logMsg = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${msg}`, ...prev].slice(0, 12));
  }, []);

  const handleReset = () => {
    setNodes(INITIAL_NODES.map(n => ({ ...n })));
    setActiveLeaderId(null);
    setIsPartitioned(false);
    setClusterLogs([]);
    setVoteArrows([]);
    setIsElectionRunning(false);
    setKillingLeader(false);
    setLogs(['[System] Cluster reset. All nodes in Follower state. Term 1.']);
  };

  const handleTogglePartition = () => {
    setIsPartitioned(prev => {
      const next = !prev;
      logMsg(next
        ? '[Network] ⚡ PARTITION! {Node 1, 2} isolated from {Node 3, 4, 5}'
        : '[Network] ✅ Network healed. Nodes re-joining cluster.'
      );
      return next;
    });
  };

  const handleToggleNodePower = (id: number) => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === id) {
        const goingOffline = node.state !== 'offline';
        logMsg(goingOffline
          ? `[Node ${id}] 💀 CRASHED — Node is now offline.`
          : `[Node ${id}] 🔄 Node back ONLINE as Follower.`
        );
        return {
          ...node,
          state: goingOffline ? 'offline' : 'follower',
          votedFor: null,
          votesReceived: 0,
          timeout: randomTimeout(),
        };
      }
      return node;
    }));
  };

  // Kill the current leader — triggers a visible re-election
  const handleKillLeader = () => {
    if (activeLeaderId === null || killingLeader) return;
    const leaderId = activeLeaderId;
    setKillingLeader(true);

    logMsg(`[Chaos] 💀 KILLING Leader (Node ${leaderId})! Heartbeats will stop...`);

    // Kill leader immediately
    setNodes(prevNodes => prevNodes.map(node =>
      node.id === leaderId ? { ...node, state: 'offline', votedFor: null, votesReceived: 0 } : node
    ));
    setActiveLeaderId(null);

    // After short delay, log that followers notice
    setTimeout(() => {
      logMsg(`[Followers] ⏱️ No heartbeat from Node ${leaderId}. Election timeouts ticking...`);
    }, 900);

    setTimeout(() => {
      logMsg(`[Election] 🗳️ Timeout expired! Surviving nodes starting leader election...`);
      setKillingLeader(false);
    }, 1800);
  };

  const canCommunicate = useCallback((fromId: number, toId: number, currentNodes: RaftNode[]) => {
    const fromNode = currentNodes.find(n => n.id === fromId);
    const toNode = currentNodes.find(n => n.id === toId);
    if (!fromNode || !toNode || fromNode.state === 'offline' || toNode.state === 'offline') return false;
    if (isPartitioned) {
      const groupA = [1, 2];
      return groupA.includes(fromId) === groupA.includes(toId);
    }
    return true;
  }, [isPartitioned]);

  const handleClientWrite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientValue.trim()) return;
    if (activeLeaderId === null) {
      logMsg('[Client] ❌ Write failed: No active leader!');
      return;
    }
    const leaderNode = nodes.find(n => n.id === activeLeaderId);
    if (!leaderNode || leaderNode.state === 'offline') {
      logMsg('[Client] ❌ Write failed: Leader is offline.');
      return;
    }

    logMsg(`[Client] 📝 Write: "${clientValue}" → Leader (Node ${activeLeaderId})`);

    const replicatedNodes = [activeLeaderId];
    nodes.forEach(n => {
      if (n.id !== activeLeaderId && canCommunicate(activeLeaderId, n.id, nodes)) {
        replicatedNodes.push(n.id);
      }
    });

    const term = leaderNode.term;
    const isMajority = replicatedNodes.length >= 3;

    if (isMajority) {
      setClusterLogs(prev => [...prev, { term, val: clientValue, committed: true }]);
      logMsg(`[Leader ${activeLeaderId}] ✅ Replicated to ${replicatedNodes.join(', ')}. Quorum ✓ (${replicatedNodes.length}/5). COMMITTED!`);
    } else {
      setClusterLogs(prev => [...prev, { term, val: clientValue, committed: false }]);
      logMsg(`[Leader ${activeLeaderId}] ⚠️ Only reached ${replicatedNodes.join(', ')}. No quorum (${replicatedNodes.length}/5). UNCOMMITTED.`);
    }
    setClientValue('');
  };

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setNodes(prevNodes => {
        const updated = prevNodes.map(n => ({ ...n }));

        const leader = updated.find(n => n.state === 'leader');

        // 1. Leader sends heartbeats
        if (leader) {
          updated.forEach(n => {
            if (n.id !== leader.id && canCommunicate(leader.id, n.id, updated)) {
              if (leader.term >= n.term) {
                n.term = leader.term;
                n.timeout = n.maxTimeout;
                n.votedFor = null;
              }
            }
          });
        }

        // 2. Tick election timeouts
        updated.forEach(n => {
          if (n.state === 'offline' || n.state === 'leader') return;
          if (n.state === 'candidate') {
            n.timeout = Math.max(0, n.timeout - 1);
            return;
          }
          n.timeout = Math.max(0, n.timeout - 1);
        });

        // 3. Trigger Election if timeout hits 0
        const timedOutNode = updated.find(n =>
          n.state !== 'offline' && n.state !== 'leader' && n.timeout <= 0
        );

        if (timedOutNode) {
          const candidateId = timedOutNode.id;
          const nextTerm = timedOutNode.term + 1;
          setIsElectionRunning(true);

          logMsg(`[Node ${candidateId}] ⏰ Timeout! Starting election for Term ${nextTerm}.`);

          // Reset any existing candidates/leaders of lower terms
          updated.forEach(n => {
            if ((n.state === 'candidate' || n.state === 'leader') && n.term < nextTerm) {
              n.state = 'follower';
              n.timeout = randomTimeout();
            }
          });

          const candidate = updated.find(n => n.id === candidateId)!;
          candidate.state = 'candidate';
          candidate.term = nextTerm;
          candidate.votedFor = candidateId;
          candidate.votesReceived = 1;

          // Collect vote arrows for animation
          const arrows: VoteArrow[] = [];

          updated.forEach(n => {
            if (n.id !== candidateId && canCommunicate(candidateId, n.id, updated)) {
              if (n.term < nextTerm) {
                n.term = nextTerm;
                n.votedFor = candidateId;
                n.timeout = n.maxTimeout;
                candidate.votesReceived += 1;
                arrows.push({ fromId: n.id, toId: candidateId, id: `${n.id}-${candidateId}-${Date.now()}` });
              }
            }
          });

          // Show vote arrows briefly
          if (arrows.length > 0) {
            setVoteArrows(arrows);
            setTimeout(() => setVoteArrows([]), 1200);
          }

          if (candidate.votesReceived >= 3) {
            candidate.state = 'leader';
            candidate.votedFor = null;
            setActiveLeaderId(candidateId);
            setIsElectionRunning(false);
            logMsg(`[Node ${candidateId}] 👑 WON election (Term ${nextTerm}) with ${candidate.votesReceived}/5 votes! New Leader!`);
          } else {
            logMsg(`[Node ${candidateId}] ❌ Election failed — only ${candidate.votesReceived} votes. Split vote.`);
            candidate.state = 'follower';
            candidate.votedFor = null;
            candidate.timeout = randomTimeout();
            setIsElectionRunning(false);
          }
        }

        const currentLeader = updated.find(n => n.state === 'leader');
        if (!currentLeader) {
          setActiveLeaderId(null);
        } else {
          setActiveLeaderId(currentLeader.id);
        }

        return updated;
      });
    }, 800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isPartitioned, canCommunicate, logMsg]);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs]);

  const onlineCount = nodes.filter(n => n.state !== 'offline').length;

  return (
    <div className="flex flex-col gap-5 animate-slide-up w-full">
      {/* Top Status Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/60 select-none">
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="text-muted-foreground">Cluster Status:</span>
          <span className={cn(
            "flex items-center gap-1.5",
            activeLeaderId ? "text-emerald-400" : isElectionRunning ? "text-amber-400" : "text-red-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full inline-block",
              activeLeaderId ? "bg-emerald-400 animate-pulse" : isElectionRunning ? "bg-amber-400 animate-pulse" : "bg-red-500"
            )} />
            {activeLeaderId ? `Leader: Node ${activeLeaderId}` : isElectionRunning ? 'Election Running...' : 'No Leader (Electing)'}
          </span>
          <span className="text-muted-foreground">Online: <span className="text-white">{onlineCount}/5</span></span>
          {isPartitioned && <span className="text-red-400 animate-pulse">⚡ PARTITION ACTIVE</span>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-lg text-[10px] border-white/5 cursor-pointer bg-white/3 font-bold"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play size={10} className={cn(isPlaying && "fill-white")} />
            {isPlaying ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-lg text-[10px] border-white/5 cursor-pointer bg-white/3 font-bold"
            onClick={handleReset}
          >
            <RotateCcw size={10} />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual Network Map */}
        <Card glass className="lg:col-span-2 p-5 bg-slate-950/60 border-white/5 relative min-h-[400px] flex flex-col overflow-hidden">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 select-none">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Live Network</span>
            <div className="flex gap-3 ml-auto">
              {[
                { color: 'bg-emerald-500', label: 'Leader' },
                { color: 'bg-slate-500', label: 'Follower' },
                { color: 'bg-amber-500', label: 'Candidate' },
                { color: 'bg-red-500', label: 'Offline' },
              ].map(l => (
                <span key={l.label} className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${l.color} block`} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Election banner */}
          {isElectionRunning && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold px-4 py-1.5 rounded-full animate-pulse backdrop-blur-sm select-none">
              🗳️ ELECTION IN PROGRESS — Votes being cast...
            </div>
          )}

          {/* Node Map */}
          <div className="relative flex-1 flex items-center justify-center">
            <div className="relative w-[340px] h-[320px]">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Partition line */}
                {isPartitioned && (
                  <line
                    x1="170" y1="0" x2="170" y2="320"
                    stroke="rgba(239,68,68,0.45)"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />
                )}

                {/* Heartbeat lines from leader */}
                {activeLeaderId !== null && isPlaying && nodes.map(n => {
                  if (n.id === activeLeaderId || !canCommunicate(activeLeaderId, n.id, nodes)) return null;
                  const from = nodePositions[activeLeaderId - 1];
                  const to = nodePositions[n.id - 1];
                  return (
                    <g key={`hb-${n.id}`}>
                      <line
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke="rgba(16,185,129,0.12)"
                        strokeWidth="1.5"
                      />
                      <circle r="3.5" fill="rgba(16,185,129,0.85)">
                        <animateMotion
                          path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Vote arrows during election */}
                {voteArrows.map(arrow => {
                  const from = nodePositions[arrow.fromId - 1];
                  const to = nodePositions[arrow.toId - 1];
                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const nx = dx / len;
                  const ny = dy / len;
                  const x2 = to.x - nx * 36;
                  const y2 = to.y - ny * 36;
                  return (
                    <g key={arrow.id}>
                      <line
                        x1={from.x} y1={from.y}
                        x2={x2} y2={y2}
                        stroke="rgba(245,158,11,0.7)"
                        strokeWidth="2"
                        strokeDasharray="4,3"
                      />
                      <polygon
                        points={`${x2},${y2} ${x2 - ny * 5 - nx * 8},${y2 + nx * 5 - ny * 8} ${x2 + ny * 5 - nx * 8},${y2 - nx * 5 - ny * 8}`}
                        fill="rgba(245,158,11,0.8)"
                      />
                      <text
                        x={(from.x + x2) / 2}
                        y={(from.y + y2) / 2 - 6}
                        fill="rgba(245,158,11,0.9)"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                      >VOTE ✓</text>
                    </g>
                  );
                })}
              </svg>

              {/* Node circles */}
              {nodes.map(node => {
                const pos = nodePositions[node.id - 1];
                const isLeader = node.state === 'leader';
                const isCandidate = node.state === 'candidate';
                const isOffline = node.state === 'offline';
                const progressPct = node.state !== 'offline' && node.state !== 'leader'
                  ? ((node.maxTimeout - node.timeout) / node.maxTimeout) * 100
                  : 0;

                return (
                  <div
                    key={node.id}
                    className="absolute cursor-pointer flex flex-col items-center group select-none"
                    style={{ left: `${pos.x - 38}px`, top: `${pos.y - 38}px` }}
                    onClick={() => handleToggleNodePower(node.id)}
                    title={isOffline ? `Click to bring Node ${node.id} back online` : `Click to crash Node ${node.id}`}
                  >
                    {/* Crown for leader */}
                    {isLeader && (
                      <span className="absolute -top-4 text-base animate-bounce select-none">👑</span>
                    )}

                    {/* Node body */}
                    <div className={cn(
                      "w-[76px] h-[76px] rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 relative bg-slate-950/90 shadow-xl",
                      isLeader && "border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-110",
                      node.state === 'follower' && "border-slate-600 text-slate-300 hover:border-slate-400",
                      isCandidate && "border-amber-500 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.25)] animate-pulse",
                      isOffline && "border-red-500/40 text-red-500/70 bg-red-950/20 opacity-60 scale-95",
                    )}>
                      {/* Timeout progress ring overlay */}
                      {node.state === 'follower' && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 76 76">
                          <circle
                            cx="38" cy="38" r="35"
                            fill="none"
                            stroke="rgba(245,158,11,0.15)"
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - progressPct / 100)}`}
                            className="transition-all duration-700"
                          />
                        </svg>
                      )}

                      <span className="text-[11px] font-black tracking-tight leading-none">Node {node.id}</span>
                      <span className={cn(
                        "text-[8px] uppercase font-extrabold tracking-wider leading-none mt-0.5",
                        isLeader && "text-emerald-400",
                        isCandidate && "text-amber-400",
                        isOffline && "text-red-400",
                        node.state === 'follower' && "text-slate-400",
                      )}>
                        {isOffline ? '💀 dead' : node.state}
                      </span>
                      <span className="text-[8px] font-mono leading-none mt-1 opacity-70">T:{node.term}</span>

                      {/* Timeout countdown badge */}
                      {node.state === 'follower' && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-[7px] font-bold font-mono text-amber-400/80">
                          {node.timeout}t
                        </div>
                      )}

                      {/* Power icon on hover */}
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded-full border border-white/10">
                        <Power size={7} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[9px] text-center text-muted-foreground select-none mt-2">
            Click any node to crash/revive it • 🟡 ring = election timeout ticking • 💀 = offline
          </p>
        </Card>

        {/* Controls & Logs Panel */}
        <div className="flex flex-col gap-4">
          {/* Actions */}
          <Card glass className="p-4 flex flex-col gap-3 bg-slate-950/60 border-white/5 select-none">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Chaos Controls</span>

            {/* Kill Leader */}
            <div className="flex flex-col gap-1.5">
              <Button
                variant="outline"
                className={cn(
                  "w-full rounded-xl h-10 border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300 text-xs font-bold justify-start gap-2.5 cursor-pointer transition-all",
                  (!activeLeaderId || killingLeader) && "opacity-40 cursor-not-allowed"
                )}
                onClick={handleKillLeader}
                disabled={!activeLeaderId || killingLeader}
              >
                <Skull size={14} />
                <span>{killingLeader ? 'Killing leader...' : `Kill Leader (Node ${activeLeaderId ?? '–'})`}</span>
              </Button>
              <p className="text-[9px] text-muted-foreground pl-1 leading-relaxed">
                Crashes the current leader. Followers will detect the missing heartbeat and trigger a re-election.
              </p>
            </div>

            {/* Network Partition */}
            <div className="flex flex-col gap-1.5">
              <Button
                variant="outline"
                className={cn(
                  "w-full rounded-xl h-10 border-white/5 text-xs font-bold justify-start gap-2.5 cursor-pointer",
                  isPartitioned && "border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                )}
                onClick={handleTogglePartition}
              >
                <Network size={14} />
                <span>{isPartitioned ? '✅ Heal Network' : '⚡ Split Network (1,2 | 3,4,5)'}</span>
              </Button>
              <p className="text-[9px] text-muted-foreground pl-1 leading-relaxed">
                Creates two isolated groups. The minority side can't commit any writes.
              </p>
            </div>

            {/* Client Write */}
            <div className="flex flex-col gap-1.5 mt-1 border-t border-white/5 pt-3">
              <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Send Write</span>
              <form onSubmit={handleClientWrite} className="flex gap-2">
                <input
                  type="text"
                  placeholder="SET x = 5"
                  value={clientValue}
                  onChange={(e) => setClientValue(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-950 border border-white/5 text-xs px-3 py-2 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-primary"
                />
                <Button
                  type="submit"
                  variant="neon"
                  className="h-9 px-3 rounded-xl cursor-pointer"
                  disabled={activeLeaderId === null}
                >
                  <Send size={12} />
                </Button>
              </form>
              {activeLeaderId === null && (
                <p className="text-[9px] text-amber-400/80 pl-1">⚠️ No leader — wait for election to finish</p>
              )}
            </div>
          </Card>

          {/* Replicated Log */}
          <Card glass className="p-4 flex flex-col gap-2.5 bg-slate-950/60 border-white/5 flex-grow min-h-[130px]">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Replicated Log</span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[130px] font-mono text-[9px]">
              {clusterLogs.length === 0 ? (
                <span className="text-muted-foreground italic pl-1">[ No entries yet — send a write! ]</span>
              ) : (
                [...clusterLogs].reverse().map((logItem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-slate-300">T{logItem.term} → "{logItem.val}"</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-extrabold",
                      logItem.committed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                    )}>
                      {logItem.committed ? '✓ COMMITTED' : '⏳ PENDING'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Live Consensus Log */}
      <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-2 select-none">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Live Consensus Log</span>
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-full border",
            isElectionRunning
              ? "text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse"
              : activeLeaderId
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
              : "text-slate-400 border-white/10 bg-white/5"
          )}>
            {isElectionRunning ? '🗳️ Electing...' : activeLeaderId ? `👑 Leader: N${activeLeaderId}` : 'No Leader'}
          </span>
        </div>
        <div ref={logRef} className="flex flex-col gap-1 h-[110px] overflow-y-auto font-mono text-[10px] text-slate-400 mt-1">
          {logs.map((logText, i) => (
            <p key={i} className="log-line pl-1 border-l border-white/5 animate-slide-up leading-relaxed">
              {logText}
            </p>
          ))}
        </div>
      </Card>

      <div className="flex justify-end mt-1">
        <Button variant="neon" className="rounded-xl h-11 px-6 cursor-pointer" onClick={onComplete}>
          <Zap size={16} />
          <span>Continue to Quiz</span>
        </Button>
      </div>
    </div>
  );
};
