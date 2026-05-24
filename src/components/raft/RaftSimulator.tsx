import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Power, Network, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RaftNode {
  id: number;
  state: 'follower' | 'candidate' | 'leader' | 'offline';
  term: number;
  votedFor: number | null;
  votesReceived: number;
  timeout: number; // Ticks remaining until election starts (randomized)
  maxTimeout: number; // Initial randomized timeout duration
  logs: string[];
}

interface RaftSimulatorProps {
  onComplete: () => void;
}

// Helper to generate a random timeout (between 12 and 22 ticks)
const randomTimeout = () => Math.floor(Math.random() * 11) + 12;

export const RaftSimulator: React.FC<RaftSimulatorProps> = ({ onComplete }) => {
  const [nodes, setNodes] = useState<RaftNode[]>([
    { id: 1, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 15, maxTimeout: 15, logs: [] },
    { id: 2, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 20, maxTimeout: 20, logs: [] },
    { id: 3, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 24, maxTimeout: 24, logs: [] },
    { id: 4, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 18, maxTimeout: 18, logs: [] },
    { id: 5, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 22, maxTimeout: 22, logs: [] },
  ]);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPartitioned, setIsPartitioned] = useState<boolean>(false); // Group A: 1,2 | Group B: 3,4,5
  const [activeLeaderId, setActiveLeaderId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>(['[System] Cluster initialized. Nodes in Follower state. Term 1.']);
  const [clientValue, setClientValue] = useState<string>('');
  const [clusterLogs, setClusterLogs] = useState<{ term: number; val: string; committed: boolean }[]>([]);

  // Ticking interval reference
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Position coordinates for rendering 5 nodes in a circle (300x300 canvas size)
  const nodePositions = [
    { x: 150, y: 40 },   // Node 1 (Top)
    { x: 250, y: 110 },  // Node 2 (Right)
    { x: 210, y: 230 },  // Node 3 (Bottom Right)
    { x: 90, y: 230 },   // Node 4 (Bottom Left)
    { x: 50, y: 110 },   // Node 5 (Left)
  ];

  const logMsg = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  // Reset simulator
  const handleReset = () => {
    setNodes([
      { id: 1, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 15, maxTimeout: 15, logs: [] },
      { id: 2, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 20, maxTimeout: 20, logs: [] },
      { id: 3, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 24, maxTimeout: 24, logs: [] },
      { id: 4, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 18, maxTimeout: 18, logs: [] },
      { id: 5, state: 'follower', term: 1, votedFor: null, votesReceived: 0, timeout: 22, maxTimeout: 22, logs: [] },
    ]);
    setActiveLeaderId(null);
    setIsPartitioned(false);
    setClusterLogs([]);
    setLogs(['[System] Cluster reset. Term 1.']);
  };

  // Toggle partition
  const handleTogglePartition = () => {
    setIsPartitioned(prev => {
      const newVal = !prev;
      logMsg(newVal 
        ? '[Network] Partition active: {Node 1, Node 2} vs {Node 3, Node 4, Node 5}' 
        : '[Network] Partition healed. Network unified.'
      );
      return newVal;
    });
  };

  // Toggle node power state
  const handleToggleNodePower = (id: number) => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === id) {
        const isTurningOffline = node.state !== 'offline';
        const updatedState = isTurningOffline ? 'offline' : 'follower';
        logMsg(isTurningOffline 
          ? `[Node ${id}] Crashed / Offline.` 
          : `[Node ${id}] Back online as Follower.`
        );
        return {
          ...node,
          state: updatedState,
          votedFor: null,
          votesReceived: 0,
          timeout: randomTimeout(),
        };
      }
      return node;
    }));
  };

  // Can nodes communicate? (Checks partitions & offline states)
  const canCommunicate = useCallback((fromId: number, toId: number, currentNodes: RaftNode[]) => {
    const fromNode = currentNodes.find(n => n.id === fromId);
    const toNode = currentNodes.find(n => n.id === toId);
    if (!fromNode || !toNode || fromNode.state === 'offline' || toNode.state === 'offline') {
      return false;
    }
    if (isPartitioned) {
      const groupA = [1, 2];
      const fromInA = groupA.includes(fromId);
      const toInA = groupA.includes(toId);
      return fromInA === toInA; // Both must be in same partition group
    }
    return true;
  }, [isPartitioned]);

  // Send client write request to leader
  const handleClientWrite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientValue.trim()) return;

    if (activeLeaderId === null) {
      logMsg('[Client] Write failed: No active Leader in cluster.');
      return;
    }

    const leaderNode = nodes.find(n => n.id === activeLeaderId);
    if (!leaderNode || leaderNode.state === 'offline') {
      logMsg('[Client] Write failed: Leader is offline.');
      return;
    }

    logMsg(`[Client] Write request: SET val = "${clientValue}" sent to Leader (Node ${activeLeaderId})`);

    // Calculate how many nodes the leader can replicate to (including itself)
    const replicatedNodes = [activeLeaderId];
    nodes.forEach(n => {
      if (n.id !== activeLeaderId && canCommunicate(activeLeaderId, n.id, nodes)) {
        replicatedNodes.push(n.id);
      }
    });

    const term = leaderNode.term;
    const isMajority = replicatedNodes.length >= 3; // Majority of 5 is 3

    if (isMajority) {
      setClusterLogs(prev => [...prev, { term, val: clientValue, committed: true }]);
      logMsg(`[Leader ${activeLeaderId}] Replicated to ${replicatedNodes.join(', ')}. Quorum reached (3/5). Write Committed!`);
    } else {
      setClusterLogs(prev => [...prev, { term, val: clientValue, committed: false }]);
      logMsg(`[Leader ${activeLeaderId}] Replicated to ${replicatedNodes.join(', ')}. Quorum failed (${replicatedNodes.length}/5). Write Pending/Uncommitted.`);
    }

    setClientValue('');
  };

  // State Machine tick logic (runs every interval tick)
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setNodes(prevNodes => {
        const updated = prevNodes.map(n => ({ ...n }));
        
        // Find existing leader
        const leader = updated.find(n => n.state === 'leader');
        
        // 1. Leader Heartbeat distribution
        if (leader) {
          updated.forEach(n => {
            if (n.id !== leader.id && canCommunicate(leader.id, n.id, updated)) {
              if (leader.term >= n.term) {
                n.term = leader.term;
                n.timeout = n.maxTimeout; // Reset election timeout since we heard from leader
                n.votedFor = null;
              }
            }
          });
        }

        // 2. Tick election timeouts
        updated.forEach(n => {
          if (n.state === 'offline') return;
          if (n.state === 'leader') {
            n.timeout = n.maxTimeout; // Leaders don't timeout
            return;
          }
          n.timeout = Math.max(0, n.timeout - 1);
        });

        // 3. Trigger Election if timeout reached
        const timedOutNode = updated.find(n => n.state !== 'offline' && n.state !== 'leader' && n.timeout <= 0);
        
        if (timedOutNode) {
          const candidateId = timedOutNode.id;
          const nextTerm = timedOutNode.term + 1;
          
          logMsg(`[Node ${candidateId}] Timeout! Incrementing term to ${nextTerm} & starting Election.`);
          
          // Reset other candidates/leaders of lower term to follower
          updated.forEach(n => {
            if (n.state === 'candidate' || n.state === 'leader') {
              n.state = 'follower';
              n.timeout = randomTimeout();
            }
          });

          // Set candidate stats
          const candidate = updated.find(n => n.id === candidateId)!;
          candidate.state = 'candidate';
          candidate.term = nextTerm;
          candidate.votedFor = candidateId;
          candidate.votesReceived = 1; // Votes for self

          // Request votes from other nodes
          updated.forEach(n => {
            if (n.id !== candidateId && canCommunicate(candidateId, n.id, updated)) {
              // Vote granting logic: Node will vote if it hasn't voted in this term & term is >= current term
              if (n.term < nextTerm) {
                n.term = nextTerm;
                n.votedFor = candidateId;
                n.timeout = n.maxTimeout; // Reset timeout because we voted
                candidate.votesReceived += 1;
              }
            }
          });

          // Check for majority quorum (>= 3 nodes)
          if (candidate.votesReceived >= 3) {
            candidate.state = 'leader';
            candidate.votedFor = null;
            setActiveLeaderId(candidateId);
            logMsg(`[Node ${candidateId}] Won election in Term ${nextTerm} with ${candidate.votesReceived} votes! Now Leader.`);
          } else {
            logMsg(`[Node ${candidateId}] Election failed in Term ${nextTerm}. Only got ${candidate.votesReceived} votes. Split vote likely.`);
            candidate.state = 'follower';
            candidate.votedFor = null;
            candidate.timeout = randomTimeout();
          }
        }

        // Maintain leader status ref
        const currentLeader = updated.find(n => n.state === 'leader');
        if (!currentLeader) {
          setActiveLeaderId(null);
        } else {
          setActiveLeaderId(currentLeader.id);
        }

        return updated;
      });
    }, 800); // 800ms per simulator tick

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isPartitioned, canCommunicate]);

  return (
    <div className="flex flex-col gap-5 animate-slide-up w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual Map Area */}
        <Card glass className="lg:col-span-2 p-5 bg-slate-950/60 border-white/5 relative min-h-[380px] flex items-center justify-center overflow-hidden">
          {/* Overlay Status info */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 select-none">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Interactive Network Map</span>
            <div className="flex gap-2.5 mt-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span> Leader</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 block"></span> Follower</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span> Candidate</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span> Offline</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-10 select-none">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg text-[10px] border-white/5 cursor-pointer bg-white/3 font-bold"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play size={12} className={cn(isPlaying && "fill-white")} />
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg text-[10px] border-white/5 cursor-pointer bg-white/3 font-bold"
              onClick={handleReset}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          </div>

          {/* Nodes Circles Container */}
          <div className="relative w-[320px] h-[300px] mt-10">
            {/* Network SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Draw network partition boundary if active */}
              {isPartitioned && (
                <line 
                  x1="150" y1="0" x2="150" y2="300" 
                  stroke="rgba(239, 68, 68, 0.4)" 
                  strokeWidth="2" 
                  strokeDasharray="6,4"
                />
              )}
              
              {/* Render heartbeat flow pulses from Leader to Followers */}
              {activeLeaderId !== null && isPlaying && (
                nodes.map(n => {
                  if (n.id === activeLeaderId || !canCommunicate(activeLeaderId, n.id, nodes)) return null;
                  const from = nodePositions[activeLeaderId - 1];
                  const to = nodePositions[n.id - 1];
                  return (
                    <g key={`heartbeat-${n.id}`}>
                      <line 
                        x1={from.x} y1={from.y} 
                        x2={to.x} y2={to.y} 
                        stroke="rgba(16, 185, 129, 0.15)" 
                        strokeWidth="1.5" 
                      />
                      <circle r="3" fill="var(--neon-success)">
                        <animateMotion 
                          path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} 
                          dur="1.2s" 
                          repeatCount="indefinite" 
                        />
                      </circle>
                    </g>
                  );
                })
              )}
            </svg>
            {nodes.map((node) => {
              const pos = nodePositions[node.id - 1];
              return (
                <div 
                  key={node.id}
                  className="absolute cursor-pointer flex flex-col items-center group"
                  style={{ left: `${pos.x - 36}px`, top: `${pos.y - 36}px` }}
                >
                  {/* Node Body */}
                  <div 
                    onClick={() => handleToggleNodePower(node.id)}
                    className={cn(
                      "w-[72px] h-[72px] rounded-full border flex flex-col items-center justify-center transition-all duration-300 relative select-none bg-slate-950/90 shadow-xl",
                      node.state === 'leader' && "border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105",
                      node.state === 'follower' && "border-slate-700 text-slate-300 hover:border-slate-500",
                      node.state === 'candidate' && "border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                      node.state === 'offline' && "border-red-500/30 text-red-500 bg-red-950/10 hover:border-red-500/50"
                    )}
                  >
                    <span className="text-[10px] font-black tracking-tight leading-none mb-0.5">Node {node.id}</span>
                    <span className="text-[8px] uppercase font-bold tracking-wider leading-none opacity-85">
                      {node.state}
                    </span>
                    <span className="text-[8px] font-mono leading-none mt-1 font-bold opacity-75">
                      T: {node.term}
                    </span>

                    {/* Timeout Progress Ring */}
                    {node.state !== 'offline' && node.state !== 'leader' && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-950 border border-white/5 rounded px-1.5 py-0.5 text-[7px] font-bold font-mono">
                        {node.timeout}s
                      </div>
                    )}

                    {/* Quick Control toggle icon */}
                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 rounded-full border border-white/5">
                      <Power size={8} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Configuration / Stats Panels */}
        <div className="flex flex-col gap-4">
          {/* Controls Panel */}
          <Card glass className="p-4 flex flex-col gap-3 bg-slate-950/60 border-white/5 select-none">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Node Operations</span>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className={cn(
                  "w-full rounded-xl h-10 border-white/5 text-xs font-bold justify-start gap-2.5 cursor-pointer",
                  isPartitioned && "border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                )}
                onClick={handleTogglePartition}
              >
                <Network size={14} />
                <span>{isPartitioned ? 'Heal Network Partition' : 'Trigger Partition (1,2 | 3,4,5)'}</span>
              </Button>
              <p className="text-[9px] text-muted-foreground leading-relaxed pl-1">
                A partition creates two isolated networks. A leader needs a quorum (3/5) to commit log entries.
              </p>
            </div>

            {/* Simulated Write Command Box */}
            <form onSubmit={handleClientWrite} className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Send Client Write</span>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="SET x = 5"
                  value={clientValue}
                  onChange={(e) => setClientValue(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-950 border border-white/5 text-xs px-3.5 py-2 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-primary"
                />
                <Button 
                  type="submit" 
                  variant="neon" 
                  className="h-9 px-3 rounded-xl cursor-pointer"
                  disabled={activeLeaderId === null}
                >
                  <Send size={12} />
                </Button>
              </div>
            </form>
          </Card>

          {/* Committed Cluster Log Entries */}
          <Card glass className="p-4 flex flex-col gap-2.5 bg-slate-950/60 border-white/5 flex-grow min-h-[150px]">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest">Replicated Logs</span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[140px] font-mono text-[9px]">
              {clusterLogs.length === 0 ? (
                <span className="text-muted-foreground italic pl-1">[ No log entries committed ]</span>
              ) : (
                clusterLogs.map((logItem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-slate-300">Term {logItem.term} ➔ "{logItem.val}"</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-extrabold",
                      logItem.committed 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                    )}>
                      {logItem.committed ? 'COMMITTED' : 'UNCOMMITTED'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Simulator Logs Box */}
      <Card glass className="p-4 bg-slate-950/60 border-white/5 flex flex-col gap-2 select-none">
        <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest border-b border-white/5 pb-1 block">Live Cluster Consensus Logs</span>
        <div className="flex flex-col gap-1 h-[120px] overflow-y-auto font-mono text-[10px] text-slate-400 mt-1">
          {logs.map((logText, i) => (
            <p key={i} className="log-line pl-1 border-l border-white/5 animate-slide-up">
              {logText}
            </p>
          ))}
        </div>
      </Card>

      <div className="flex justify-end mt-1">
        <Button variant="neon" className="rounded-xl h-11 px-6 cursor-pointer" onClick={onComplete}>
          <span>Continue to Game</span>
        </Button>
      </div>
    </div>
  );
};
