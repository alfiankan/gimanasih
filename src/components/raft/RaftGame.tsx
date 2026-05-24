import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, AlertCircle, ShieldAlert, Cpu, Network, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameNode {
  id: number;
  state: 'follower' | 'leader' | 'offline';
  votedFor: number | null;
}

interface ClientRequest {
  id: string;
  cmd: string;
  ticksRemaining: number;
}

interface RaftGameProps {
  highScore: number;
  setHighScore: (score: number) => void;
  onComplete: () => void;
  onFinishGame?: (score: number) => void;
}

export const RaftGame: React.FC<RaftGameProps> = ({ highScore, setHighScore, onComplete, onFinishGame }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [gameResultMsg, setGameResultMsg] = useState<string>('');
  
  const [score, setScore] = useState<number>(0);
  const [nodes, setNodes] = useState<GameNode[]>([
    { id: 1, state: 'leader', votedFor: null },
    { id: 2, state: 'follower', votedFor: null },
    { id: 3, state: 'follower', votedFor: null },
    { id: 4, state: 'follower', votedFor: null },
    { id: 5, state: 'follower', votedFor: null },
  ]);
  const [isPartitioned, setIsPartitioned] = useState<boolean>(false); // 1,2 vs 3,4,5
  const [activeRequest, setActiveRequest] = useState<ClientRequest | null>(null);
  const [requestsCommitted, setRequestsCommitted] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(60); // 60s game clock

  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsVictory(false);
    setScore(0);
    setNodes([
      { id: 1, state: 'leader', votedFor: null },
      { id: 2, state: 'follower', votedFor: null },
      { id: 3, state: 'follower', votedFor: null },
      { id: 4, state: 'follower', votedFor: null },
      { id: 5, state: 'follower', votedFor: null },
    ]);
    setIsPartitioned(false);
    setRequestsCommitted(0);
    setTimeRemaining(60);
    setLog(['[Security Log] Game started. Nodes fully healthy.']);
    generateNewRequest();
  };

  const generateNewRequest = () => {
    const commands = [
      'SET key = 10',
      'SET login_session = active',
      'SET auth_token = "93dfa"',
      'SET cache_hit = true',
      'SET items_count = 5',
      'SET status = "ready"',
    ];
    const randomCmd = commands[Math.floor(Math.random() * commands.length)];
    setActiveRequest({
      id: Math.random().toString(36).slice(2, 6),
      cmd: randomCmd,
      ticksRemaining: 12, // 12 seconds to resolve
    });
  };

  const endGame = useCallback((victory: boolean, finalScore: number = score) => {
    setIsPlaying(false);
    setIsGameOver(true);
    setIsVictory(victory);
    
    if (victory) {
      setHighScore(finalScore > highScore ? finalScore : highScore);
      setGameResultMsg(`Victory! You successfully processed client requests and maintained consensus. Final Score: ${finalScore} pts.`);
      if (onFinishGame) onFinishGame(finalScore);
    } else {
      setGameResultMsg(`Defeat! Either the timer ran out or the cluster suffered split-brain failure. Final Score: ${finalScore} pts.`);
    }

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (eventTimerRef.current) clearInterval(eventTimerRef.current);
  }, [score, highScore, setHighScore, onFinishGame]);

  // Node recovery button
  const handleRebootNode = (id: number) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id && n.state === 'offline') {
        addLog(`[System] Rebuilt and booted Node ${id}. Resuming follower state.`);
        return { ...n, state: 'follower' };
      }
      return n;
    }));
  };

  // Heal partition button
  const handleHealPartition = () => {
    setIsPartitioned(false);
    addLog('[Network] Healed partition. Re-unified the nodes.');
  };

  // Process write attempt
  const handleCommitRequest = () => {
    if (!activeRequest) return;

    // Identify leader
    const leader = nodes.find(n => n.state === 'leader');
    if (!leader || leader.state === 'offline') {
      setScore(prev => Math.max(0, prev - 15));
      addLog('[Failure] Write failed! No active Leader is online.');
      return;
    }

    // Nodes candidate Leader can communicate with
    const reachableNodes = [leader.id];
    nodes.forEach(n => {
      if (n.id !== leader.id && n.state !== 'offline') {
        if (isPartitioned) {
          const groupA = [1, 2];
          if (groupA.includes(leader.id) === groupA.includes(n.id)) {
            reachableNodes.push(n.id);
          }
        } else {
          reachableNodes.push(n.id);
        }
      }
    });

    const isMajority = reachableNodes.length >= 3;
    if (isMajority) {
      const newScore = score + 20;
      setScore(newScore);
      setRequestsCommitted(prev => {
        const nextCommitted = prev + 1;
        if (nextCommitted >= 8) {
          endGame(newScore >= 80, newScore);
        }
        return nextCommitted;
      });
      addLog(`[Success] Committed "${activeRequest.cmd}" on nodes ${reachableNodes.join(',')}. +20 pts.`);
      generateNewRequest();
    } else {
      setScore(prev => Math.max(0, prev - 15));
      addLog(`[Failure] Quorum failed! Only ${reachableNodes.length}/5 nodes reached due to partition/crash. -15 pts.`);
    }
  };

  // Ticking Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    gameTimerRef.current = setInterval(() => {
      // 1. Tick time remaining
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endGame(score >= 80, score);
          return 0;
        }
        return prev - 1;
      });

      // 2. Tick active request remaining time
      setActiveRequest(prev => {
        if (!prev) return null;
        if (prev.ticksRemaining <= 1) {
          setScore(s => Math.max(0, s - 10));
          addLog(`[Timeout] Client write expired. -10 pts.`);
          // Auto generate next
          setTimeout(generateNewRequest, 100);
          return null;
        }
        return { ...prev, ticksRemaining: prev.ticksRemaining - 1 };
      });
    }, 1000);

    // Random malicious events ticker
    eventTimerRef.current = setInterval(() => {
      const eventChance = Math.random();
      
      setNodes(prevNodes => {
        const updated = prevNodes.map(n => ({ ...n }));
        
        if (eventChance < 0.4) {
          // Crash a random follower node
          const onlineFollowers = updated.filter(n => n.state === 'follower');
          if (onlineFollowers.length > 0) {
            const pick = onlineFollowers[Math.floor(Math.random() * onlineFollowers.length)];
            pick.state = 'offline';
            addLog(`[Alert] Node ${pick.id} experienced hardware failure and crashed!`);
          }
        } else if (eventChance < 0.7 && !isPartitioned) {
          // Partition alert
          setIsPartitioned(true);
          addLog('[Alert] Lightning strike cut optical lines! Split partition: {1,2} vs {3,4,5}.');
        } else {
          // Leader crashes!
          const currentLeader = updated.find(n => n.state === 'leader');
          if (currentLeader && currentLeader.state !== 'offline') {
            currentLeader.state = 'offline';
            addLog(`[Alert] Node ${currentLeader.id} (Leader) suffered buffer overflow and crashed!`);
            
            // Try to elect a new leader automatically from remaining online nodes
            const online = updated.filter(n => n.state !== 'offline');
            if (online.length >= 3) {
              const newLeader = online[Math.floor(Math.random() * online.length)];
              newLeader.state = 'leader';
              addLog(`[Consensus] Elected Node ${newLeader.id} as Leader.`);
            } else {
              addLog('[Consensus] No leader can be elected! Quorum lost.');
            }
          }
        }
        return updated;
      });
    }, 5500); // Event happens every 5.5s

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
    };
  }, [isPlaying, score, isPartitioned, nodes, endGame]);

  return (
    <Card glass className="game-container p-5 rounded-2xl border-white/5 bg-slate-950/60 select-none w-full">
      {!isPlaying && !isGameOver ? (
        <div className="game-intro flex flex-col items-center text-center gap-4 py-4">
          <ShieldAlert size={48} className="game-intro-icon text-neon-danger drop-shadow-[0_0_10px_rgba(239,68,68,0.35)] animate-pulse" />
          <h3 className="game-intro-title text-lg font-extrabold text-foreground">Consensus Commander</h3>
          <p className="game-intro-text text-sm text-muted-foreground max-w-xs leading-relaxed">
            Protect the 5-node cluster! Malicious events will crash servers and partition networks. Maintain consensus to process incoming logs.
          </p>
          <Card className="rules-card w-full rounded-xl p-4 bg-black/25 border-white/5 text-left flex flex-col gap-2">
            <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block">
              Rules:
            </span>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-muted-foreground leading-relaxed">
              <li><strong>Commit Requests</strong> (+20 pts) by getting majority quorum (3/5 online and reachable nodes).</li>
              <li><strong>Partition Block</strong>: Writes fail if the active leader is in a partition with only 2 nodes (-15 pts).</li>
              <li><strong>Timeout</strong>: Process requests before they expire (-10 pts).</li>
              <li><strong>Controls</strong>: Click offline nodes to reboot them, and click "Heal Partition" to re-unify network.</li>
              <li><strong>Win Condition</strong>: Commit at least <strong>8 requests</strong> with <strong>80+ pts</strong> before 60s runs out.</li>
            </ul>
          </Card>
          
          <Button 
            variant="neon" 
            size="lg"
            className="w-full rounded-2xl h-12 cursor-pointer mt-2" 
            onClick={handleStartGame}
          >
            <Play size={18} />
            <span>Start Game</span>
          </Button>
        </div>
      ) : isGameOver ? (
        <div className="game-over-screen flex flex-col items-center text-center gap-4 py-4 animate-slide-up">
          {isVictory ? (
            <Trophy size={48} className="trophy-icon text-neon-secondary drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce" />
          ) : (
            <AlertCircle size={48} className="alert-icon text-neon-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
          )}
          <h3 className="text-xl font-extrabold text-foreground">
            {isVictory ? 'Victory!' : 'Consensus Lost'}
          </h3>
          <p className="result-msg text-sm text-muted-foreground leading-relaxed max-w-xs">{gameResultMsg}</p>
          <div className="high-score-box bg-white/3 border border-white/5 px-5 py-2.5 rounded-xl text-neon-secondary font-mono font-bold text-sm select-none">
            <span>High Score: {highScore} pts</span>
          </div>
          <div className="game-btn-row flex gap-2.5 w-full mt-2">
            <Button 
              variant="outline" 
              className="flex-1 rounded-2xl h-11 bg-white/3 border-white/5 font-bold text-foreground cursor-pointer"
              onClick={handleStartGame}
            >
              Play Again
            </Button>
            <Button 
              variant="neon" 
              className="flex-1 rounded-2xl h-11 cursor-pointer"
              onClick={onComplete}
            >
              Continue to Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="game-board flex flex-col gap-4">
          {/* Game Stats Row */}
          <div className="game-stats-row grid grid-cols-4 gap-2 bg-black/25 p-3 rounded-xl border border-white/5 items-center select-none text-center">
            <div className="game-stat flex flex-col">
              <span className="stat-label text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Score</span>
              <span className="stat-value text-sm font-extrabold text-foreground font-mono">{score}</span>
            </div>
            <div className="game-stat flex flex-col">
              <span className="stat-label text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Time Left</span>
              <span className="stat-value text-sm font-extrabold text-neon-warning font-mono">{timeRemaining}s</span>
            </div>
            <div className="game-stat flex flex-col">
              <span className="stat-label text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Commits</span>
              <span className="stat-value text-sm font-extrabold text-foreground font-mono">{requestsCommitted} / 8</span>
            </div>
            <div className="game-stat flex flex-col">
              <span className="stat-label text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Network</span>
              <span className={cn(
                "stat-value text-xs font-extrabold font-mono",
                isPartitioned ? "text-red-400" : "text-emerald-400"
              )}>
                {isPartitioned ? 'SPLIT' : 'OK'}
              </span>
            </div>
          </div>

          {/* Active Write Request Card */}
          {activeRequest ? (
            <Card glass className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-2 relative">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground select-none">
                <span>CLIENT WRITE REQUEST</span>
                <span className="text-neon-warning font-bold">Expires: {activeRequest.ticksRemaining}s</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-sm font-bold text-white pl-1">{activeRequest.cmd}</span>
                <Button 
                  variant="neon"
                  size="sm"
                  className="rounded-lg text-xs cursor-pointer px-4.5"
                  onClick={handleCommitRequest}
                >
                  Commit Write
                </Button>
              </div>
            </Card>
          ) : (
            <Card glass className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex justify-center items-center h-16">
              <span className="text-xs text-muted-foreground animate-pulse">[ Waiting for next request ]</span>
            </Card>
          )}

          {/* Nodes Interactive Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-neon-secondary uppercase tracking-widest block mb-0.5">Cluster Operations</span>
            <div className="grid grid-cols-5 gap-2 select-none">
              {nodes.map(node => (
                <button
                  key={node.id}
                  disabled={node.state !== 'offline'}
                  onClick={() => handleRebootNode(node.id)}
                  className={cn(
                    "p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-bold relative",
                    node.state === 'leader' && "border-emerald-500 bg-emerald-500/5 text-emerald-400 cursor-default",
                    node.state === 'follower' && "border-slate-800 bg-slate-950/40 text-slate-300 cursor-default",
                    node.state === 'offline' && "border-red-500 bg-red-500/5 text-red-400 hover:bg-red-500/10 cursor-pointer animate-pulse"
                  )}
                >
                  <Cpu size={16} />
                  <span>Node {node.id}</span>
                  {node.state === 'offline' ? (
                    <span className="text-[7px] bg-red-500/10 px-1 py-0.5 border border-red-500/20 text-red-400 rounded">BOOT</span>
                  ) : (
                    <span className={cn(
                      "text-[7px] px-1 py-0.5 rounded border capitalize",
                      node.state === 'leader' ? "border-emerald-500/20 bg-emerald-500/10" : "border-slate-800"
                    )}>
                      {node.state}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isPartitioned && (
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs font-bold cursor-pointer mt-1"
                onClick={handleHealPartition}
              >
                <Network size={14} />
                <span>Heal Network Partition</span>
              </Button>
            )}
          </div>

          {/* Security Action Logs */}
          <div className="game-logs bg-black/30 border border-white/5 rounded-xl p-3 font-mono text-[9px] h-[100px] flex flex-col gap-1 overflow-hidden">
            <span className="log-label text-neon-primary font-bold border-b border-white/5 pb-1 block select-none mb-1">
              Active Security Log:
            </span>
            <div className="flex flex-col gap-0.5 overflow-y-auto">
              {log.map((item, idx) => (
                <p key={idx} className="log-line text-slate-400 select-none animate-slide-up">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
