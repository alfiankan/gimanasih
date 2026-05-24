import React, { useState, useEffect, useCallback } from 'react'
import { Mail, Zap, Database, Check, X, ShieldAlert, Trophy, Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BloomFilterGameProps {
  highScore: number
  setHighScore: (score: number) => void
  onComplete: () => void
  onFinishGame?: (score: number) => void
}

interface EmailItem {
  sender: string
  isSpam: boolean
  bloomResult: 'YES' | 'NO'
  reason: string
}

export const BloomFilterGame: React.FC<BloomFilterGameProps> = ({ highScore, setHighScore, onComplete, onFinishGame }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentEmailIdx, setCurrentEmailIdx] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [serverPower, setServerPower] = useState<number>(100)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [isVictory, setIsVictory] = useState<boolean>(false)
  const [gameResultMsg, setGameResultMsg] = useState<string>('')
  
  // Action status states
  const [queryPerformed, setQueryPerformed] = useState<'none' | 'bloom' | 'db'>('none')
  const [bloomOutcome, setBloomOutcome] = useState<'YES' | 'NO' | null>(null)
  const [dbOutcome, setDbOutcome] = useState<boolean | null>(null) // true = spam, false = clean
  const [log, setLog] = useState<string[]>([])

  // The email stream for the game
  const emailQueue: EmailItem[] = [
    { sender: 'mom_love@family.com', isSpam: false, bloomResult: 'NO', reason: 'Legitimate sender. Checked bits: some are 0.' },
    { sender: 'crypto_pump@hype.co', isSpam: true, bloomResult: 'YES', reason: 'Real Spam! Senders list match. Checked bits: 1.' },
    { sender: 'hacker_pro@scam.com', isSpam: true, bloomResult: 'YES', reason: 'Real Spam! Senders list match. Checked bits: 1.' },
    { sender: 'boss_work@company.com', isSpam: false, bloomResult: 'NO', reason: 'Legitimate sender. Checked bits: some are 0.' },
    // Collides with existing spam bits to trigger a false positive!
    { sender: 'friend_party@gmail.com', isSpam: false, bloomResult: 'YES', reason: 'False Positive! This clean email happens to hash to the same bits as blacklist spammers!' },
    { sender: 'newsletter@hacker-news.com', isSpam: false, bloomResult: 'NO', reason: 'Legitimate sender. Checked bits: some are 0.' },
    { sender: 'win_lottery@free.org', isSpam: true, bloomResult: 'YES', reason: 'Real Spam! Senders list match. Checked bits: 1.' },
    { sender: 'support@github.com', isSpam: false, bloomResult: 'NO', reason: 'Legitimate sender. Checked bits: some are 0.' },
    // Another false positive!
    { sender: 'verification@bank.com', isSpam: false, bloomResult: 'YES', reason: 'False Positive! Hashes collide with active spam bit patterns.' },
    { sender: 'rich_uncle@cash.net', isSpam: true, bloomResult: 'YES', reason: 'Real Spam! Senders list match. Checked bits: 1.' }
  ]

  const activeEmail = emailQueue[currentEmailIdx]

  const handleStartGame = () => {
    setIsPlaying(true)
    setCurrentEmailIdx(0)
    setScore(0)
    setServerPower(100)
    setIsGameOver(false)
    setLog([])
    resetTurn()
  }

  const resetTurn = () => {
    setQueryPerformed('none')
    setBloomOutcome(null)
    setDbOutcome(null)
  }

  const runBloomFilter = () => {
    if (queryPerformed !== 'none') return
    setQueryPerformed('bloom')
    
    // Simulate Bloom Filter lookup
    setBloomOutcome(activeEmail.bloomResult)
    addLog(`[Bloom Filter] Queried "${activeEmail.sender}". Result: ${activeEmail.bloomResult}`)
  }

  const runDbScan = () => {
    if (serverPower < 20) {
      addLog(`[Error] Not enough Server Power for DB Scan!`)
      return
    }
    
    setQueryPerformed('db')
    setServerPower(prev => Math.max(0, prev - 20))
    setDbOutcome(activeEmail.isSpam)
    addLog(`[Database] Scanned "${activeEmail.sender}". (Slow/Consumed 20% Power). Result: ${activeEmail.isSpam ? 'SPAM' : 'CLEAN'}`)
  }

  const handleBlock = () => {
    const isSpam = activeEmail.isSpam
    const newScore = isSpam ? score + 20 : Math.max(0, score - 30)
    setScore(newScore)
    if (isSpam) {
      addLog(`[Success] Blocked Spam! +20 pts.`)
    } else {
      addLog(`[Failure] Blocked a clean email! -30 pts. (False Positive Trap!)`)
    }
    nextEmail(newScore)
  }

  const handleDeliver = () => {
    const isSpam = activeEmail.isSpam
    const newScore = !isSpam ? score + 10 : Math.max(0, score - 40)
    setScore(newScore)
    if (!isSpam) {
      addLog(`[Success] Delivered clean mail to Inbox! +10 pts.`)
    } else {
      addLog(`[Failure] Let Spam slip into Inbox! -40 pts.`)
    }
    nextEmail(newScore)
  }

  const nextEmail = (currentScore: number) => {
    if (currentEmailIdx === emailQueue.length - 1) {
      endGame(true, currentScore)
    } else {
      setCurrentEmailIdx(prev => prev + 1)
      resetTurn()
    }
  }

  const endGame = useCallback((completed: boolean, finalScore: number = score) => {
    setIsGameOver(true)
    setIsPlaying(false)
    const isPass = completed && finalScore >= 50
    setIsVictory(isPass)
    if (isPass) {
      setHighScore(finalScore > highScore ? finalScore : highScore)
      setGameResultMsg(`Victory! You successfully processed the email queue with a final score of ${finalScore} pts.`)
      if (onFinishGame) onFinishGame(finalScore)
    } else if (completed) {
      setGameResultMsg(`Defeat! You processed all emails, but your score of ${finalScore} pts is below the passing threshold of 50 pts. Try again!`)
    } else {
      setGameResultMsg(`Server Crash! You ran out of CPU power because of too many heavy DB Scans. Final score: ${finalScore} pts.`)
    }
  }, [score, highScore, setHighScore, onFinishGame])

  // Monitor server power
  useEffect(() => {
    if (serverPower <= 0 && isPlaying) {
      endGame(false)
    }
  }, [serverPower, isPlaying, endGame])

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5))
  }

  return (
    <Card 
      glass
      className="game-container p-5 rounded-2xl border-white/5 bg-slate-950/60 select-none w-full"
    >
      {!isPlaying && !isGameOver ? (
        <div className="game-intro flex flex-col items-center text-center gap-4 py-4">
          <ShieldAlert size={48} className="game-intro-icon text-neon-warning drop-shadow-[0_0_10px_rgba(245,158,11,0.35)] animate-pulse" />
          <h3 className="game-intro-title text-lg font-extrabold text-foreground">Spam Defender</h3>
          <p className="game-intro-text text-sm text-muted-foreground max-w-xs leading-relaxed">
            Blacklist spammers have invaded the mail server. You must protect the inbox!
          </p>
          <Card className="rules-card w-full rounded-xl p-4 bg-black/25 border-white/5 text-left flex flex-col gap-2">
            <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block">
              Rules:
            </span>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-xs text-muted-foreground leading-relaxed">
              <li><strong>Deliver clean mail</strong> (+10 pts) | <strong>Block spam</strong> (+20 pts).</li>
              <li><strong>Deliver spam</strong> (-40 pts) | <strong>Block clean mail</strong> (-30 pts).</li>
              <li><strong>Bloom Filter</strong> is instant and consumes <strong>0% Power</strong>, but it can trigger <strong>False Positives (Maybe YES)</strong>.</li>
              <li><strong>Database Lookup</strong> is 100% accurate, but consumes <strong>20% CPU Power</strong>.</li>
              <li><strong>Win Condition</strong>: Reach at least <strong>50 pts</strong> and keep CPU power above <strong>0%</strong>.</li>
            </ul>
          </Card>
          
          <Button 
            variant="neon" 
            size="lg"
            className="w-full rounded-2xl h-12 cursor-pointer mt-2" 
            onClick={handleStartGame}
          >
            <Play size={18} />
            <span>Launch Game</span>
          </Button>
        </div>
      ) : isGameOver ? (
        <div className="game-over-screen flex flex-col items-center text-center gap-4 py-4 animate-slide-up">
          {isVictory ? (
            <Trophy size={48} className="trophy-icon text-neon-secondary drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce" />
          ) : (
            <ShieldAlert size={48} className="alert-icon text-neon-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
          )}
          <h3 className="text-xl font-extrabold text-foreground">
            {isVictory ? 'Victory!' : 'Server Crash'}
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
          {/* Game Stats */}
          <div className="game-stats-row grid grid-cols-[1fr_1fr_1.5fr] gap-2.5 bg-black/25 p-3 rounded-xl border border-white/5 items-center">
            <div className="game-stat flex flex-col">
              <span className="stat-label text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Score</span>
              <span className="stat-value text-base font-extrabold text-foreground font-mono">{score}</span>
            </div>
            <div className="game-stat flex flex-col">
              <span className="stat-label text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
              <span className="stat-value text-base font-extrabold text-foreground font-mono">{currentEmailIdx + 1}/10</span>
            </div>
            <div className="game-stat flex flex-col gap-1">
              <span className="stat-label text-[9px] font-bold text-muted-foreground uppercase tracking-wider">CPU Power</span>
              <div className="power-bar-wrapper relative h-5 bg-white/5 border border-white/5 rounded-md overflow-hidden flex items-center">
                <div 
                  className={cn(
                    "power-bar h-full bg-gradient-to-r from-neon-secondary to-neon-success transition-all duration-300",
                    serverPower < 40 && "from-neon-danger to-red-500"
                  )}
                  style={{ width: `${serverPower}%` }}
                />
                <span className="power-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-extrabold text-white font-mono leading-none">
                  {serverPower}%
                </span>
              </div>
            </div>
          </div>

          {/* Active Email Card */}
          <Card 
            glass
            className="email-envelope-card p-5 rounded-2xl border-white/5 bg-gradient-to-br from-card to-background flex flex-col gap-3.5 animate-float"
          >
            <div className="envelope-header flex items-center gap-2">
              <Mail className="mail-icon text-neon-primary" size={24} />
              <span className="envelope-tag text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                Incoming Message
              </span>
            </div>
            
            <div className="envelope-body flex flex-col">
              <span className="email-label text-[10px] text-muted-foreground mb-0.5">From:</span>
              <span className="email-sender text-sm font-bold text-foreground font-mono break-all">{activeEmail.sender}</span>
            </div>

            {/* Results of query checks */}
            <div className="checks-results-area border-t border-white/5 pt-3.5 min-h-[40px] flex items-center">
              {queryPerformed === 'none' && (
                <p className="check-instruction text-[11px] text-muted-foreground italic">
                  Choose an inspection method below to scan the sender.
                </p>
              )}
              
              {queryPerformed === 'bloom' && bloomOutcome && (
                <div 
                  className={cn(
                    "scan-result-badge w-full p-2.5 rounded-lg text-xs font-bold text-center border",
                    bloomOutcome === 'YES' 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/25" 
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  )}
                >
                  <span>Bloom Filter check: <strong>{bloomOutcome === 'YES' ? 'MAYBE SPAM (YES)' : 'DEFINITELY CLEAN (NO)'}</strong></span>
                </div>
              )}

              {queryPerformed === 'db' && dbOutcome !== null && (
                <div 
                  className={cn(
                    "scan-result-badge w-full p-2.5 rounded-lg text-xs font-bold text-center border",
                    dbOutcome 
                      ? "bg-red-500/10 text-red-400 border-red-500/25" 
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  )}
                >
                  <span>Database Scan: <strong>{dbOutcome ? 'SPAM CONFIRMED' : 'CLEAN CONFIRMED'}</strong></span>
                </div>
              )}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="game-controls-section flex flex-col gap-2.5">
            <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block mb-0.5">
              Inspection Methods
            </span>
            <div className="game-btn-row flex gap-2">
              <Button 
                variant="outline"
                className="control-action-btn flex-1 p-3 text-[11px] rounded-xl bg-white/3 border-white/5 cursor-pointer font-bold"
                onClick={runBloomFilter}
                disabled={queryPerformed !== 'none'}
              >
                <Zap size={14} className="text-neon-secondary fill-neon-secondary/20" />
                <span>Bloom Check (0% CPU)</span>
              </Button>
              <Button 
                variant="outline"
                className="control-action-btn flex-1 p-3 text-[11px] rounded-xl bg-white/3 border-white/5 cursor-pointer font-bold"
                onClick={runDbScan}
                disabled={queryPerformed === 'db' || serverPower < 20}
              >
                <Database size={14} className="text-neon-primary fill-neon-primary/20" />
                <span>DB Scan (20% CPU)</span>
              </Button>
            </div>

            <span className="section-label text-[10px] font-extrabold text-neon-secondary uppercase tracking-wider block mt-1 mb-0.5">
              Verdict Decision
            </span>
            <div className="game-btn-row flex gap-2">
              <Button 
                variant="outline"
                className="action-btn-block flex-1 rounded-xl h-11 border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 font-bold text-xs cursor-pointer transition-all duration-200"
                onClick={handleBlock}
              >
                <X size={16} className="text-neon-danger" />
                <span>Block Sender</span>
              </Button>
              <Button 
                variant="neon"
                className="action-btn-deliver flex-1 rounded-xl h-11 bg-gradient-to-r from-neon-success to-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] font-bold text-xs cursor-pointer transition-all duration-200"
                onClick={handleDeliver}
              >
                <Check size={16} />
                <span>Deliver to Inbox</span>
              </Button>
            </div>
          </div>

          {/* Live Action Logs */}
          <div className="game-logs bg-black/30 border border-white/5 rounded-xl p-3 font-mono text-[10px] h-[120px] flex flex-col gap-1 overflow-hidden">
            <span className="log-label text-neon-primary font-bold border-b border-white/5 pb-1 block mb-1 select-none">
              Security Logs:
            </span>
            <div className="flex flex-col gap-0.5 overflow-y-auto">
              {log.length === 0 ? (
                <p className="empty-log text-muted-foreground select-none">[ System Idle ]</p>
              ) : (
                log.map((item, idx) => (
                  <p key={idx} className="log-line text-slate-400 select-none animate-slide-up">
                    {item}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
