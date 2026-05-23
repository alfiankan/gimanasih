import React, { useState, useEffect } from 'react'
import { Mail, Zap, Database, Check, X, ShieldAlert, Trophy, Play } from 'lucide-react'

interface BloomFilterGameProps {
  highScore: number
  setHighScore: (score: number) => void
  onComplete: () => void
}

interface EmailItem {
  sender: string
  isSpam: boolean
  bloomResult: 'YES' | 'NO'
  reason: string
}

export const BloomFilterGame: React.FC<BloomFilterGameProps> = ({ highScore, setHighScore, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentEmailIdx, setCurrentEmailIdx] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [serverPower, setServerPower] = useState<number>(100)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
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
    
    if (isSpam) {
      setScore(prev => prev + 20)
      addLog(`[Success] Blocked Spam! +20 pts.`)
    } else {
      setScore(prev => Math.max(0, prev - 30))
      addLog(`[Failure] Blocked a clean email! -30 pts. (False Positive Trap!)`)
    }
    nextEmail()
  }

  const handleDeliver = () => {
    const isSpam = activeEmail.isSpam
    
    if (!isSpam) {
      setScore(prev => prev + 10)
      addLog(`[Success] Delivered clean mail to Inbox! +10 pts.`)
    } else {
      setScore(prev => Math.max(0, prev - 40))
      addLog(`[Failure] Let Spam slip into Inbox! -40 pts.`)
    }
    nextEmail()
  }

  const nextEmail = () => {
    if (currentEmailIdx === emailQueue.length - 1) {
      endGame(true)
    } else {
      setCurrentEmailIdx(prev => prev + 1)
      resetTurn()
    }
  }

  const endGame = (completed: boolean) => {
    setIsGameOver(true)
    setIsPlaying(false)
    if (completed) {
      setHighScore(score > highScore ? score : highScore)
      setGameResultMsg(`Victory! You successfully processed the email queue with a final score of ${score} pts.`)
    } else {
      setGameResultMsg(`Server Crash! You ran out of CPU power because of too many heavy DB Scans. Final score: ${score} pts.`)
    }
  }

  // Monitor server power
  useEffect(() => {
    if (serverPower <= 0 && isPlaying) {
      endGame(false)
    }
  }, [serverPower])

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5))
  }

  return (
    <div className="game-container glass">
      {!isPlaying && !isGameOver ? (
        <div className="game-intro">
          <ShieldAlert size={48} className="game-intro-icon" />
          <h3 className="game-intro-title">Spam Defender</h3>
          <p className="game-intro-text">
            Blacklist spammers have invaded the mail server. You must protect the inbox!
          </p>
          <div className="rules-card glass">
            <span className="section-label">Rules:</span>
            <ul>
              <li><strong>Deliver clean mail</strong> (+10 pts) | <strong>Block spam</strong> (+20 pts).</li>
              <li><strong>Deliver spam</strong> (-40 pts) | <strong>Block clean mail</strong> (-30 pts).</li>
              <li><strong>Bloom Filter</strong> is instant and consumes <strong>0% Power</strong>, but it can trigger <strong>False Positives (Maybe YES)</strong>.</li>
              <li><strong>Database Lookup</strong> is 100% accurate, but consumes <strong>20% CPU Power</strong>.</li>
            </ul>
          </div>
          <button className="btn btn-primary start-btn" onClick={handleStartGame}>
            <Play size={18} />
            <span>Launch Game</span>
          </button>
        </div>
      ) : isGameOver ? (
        <div className="game-over-screen">
          <Trophy size={48} className="trophy-icon" />
          <h3>Game Over</h3>
          <p className="result-msg">{gameResultMsg}</p>
          <div className="high-score-box font-mono">
            <span>High Score: {highScore} pts</span>
          </div>
          <div className="game-btn-row">
            <button className="btn btn-secondary" onClick={handleStartGame}>
              Play Again
            </button>
            <button className="btn btn-primary" onClick={onComplete}>
              Continue to Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="game-board">
          {/* Game Stats */}
          <div className="game-stats-row">
            <div className="game-stat">
              <span className="stat-label">Score</span>
              <span className="stat-value font-mono">{score}</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">Progress</span>
              <span className="stat-value font-mono">{currentEmailIdx + 1}/10</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">CPU Power</span>
              <div className="power-bar-wrapper">
                <div 
                  className={`power-bar ${serverPower < 40 ? 'danger' : ''}`}
                  style={{ width: `${serverPower}%` }}
                />
                <span className="power-text font-mono">{serverPower}%</span>
              </div>
            </div>
          </div>

          {/* Active Email Card */}
          <div className="email-envelope-card glass animate-float">
            <div className="envelope-header">
              <Mail className="mail-icon" size={24} />
              <span className="envelope-tag">Incoming Message</span>
            </div>
            <div className="envelope-body">
              <span className="email-label">From:</span>
              <span className="email-sender font-mono">{activeEmail.sender}</span>
            </div>

            {/* Results of query checks */}
            <div className="checks-results-area">
              {queryPerformed === 'none' && (
                <p className="check-instruction">Choose a checking method below to inspect the sender.</p>
              )}
              
              {queryPerformed === 'bloom' && bloomOutcome && (
                <div className={`scan-result-badge ${bloomOutcome === 'YES' ? 'maybe-spam' : 'safe'}`}>
                  <span>Bloom Filter says: <strong>{bloomOutcome === 'YES' ? 'MAYBE SPAM (YES)' : 'DEFINITELY CLEAN (NO)'}</strong></span>
                </div>
              )}

              {queryPerformed === 'db' && dbOutcome !== null && (
                <div className={`scan-result-badge ${dbOutcome ? 'spam' : 'safe'}`}>
                  <span>Database Scan says: <strong>{dbOutcome ? 'SPAM CONFIRMED' : 'CLEAN CONFIRMED'}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="game-controls-section">
            <span className="section-label">Inspection Methods</span>
            <div className="game-btn-row">
              <button 
                className="btn btn-secondary control-action-btn"
                onClick={runBloomFilter}
                disabled={queryPerformed !== 'none'}
              >
                <Zap size={16} className="cyan" />
                <span>Bloom Check (0% CPU)</span>
              </button>
              <button 
                className="btn btn-secondary control-action-btn"
                onClick={runDbScan}
                disabled={queryPerformed === 'db' || serverPower < 20}
              >
                <Database size={16} className="violet" />
                <span>DB Scan (20% CPU)</span>
              </button>
            </div>

            <span className="section-label">Verdict Decision</span>
            <div className="game-btn-row">
              <button className="btn btn-secondary action-btn-block" onClick={handleBlock}>
                <X size={16} className="red" />
                <span>Block Sender</span>
              </button>
              <button className="btn btn-primary action-btn-deliver" onClick={handleDeliver}>
                <Check size={16} className="green" />
                <span>Deliver to Inbox</span>
              </button>
            </div>
          </div>

          {/* Live Action Logs */}
          <div className="game-logs font-mono">
            <span className="log-label">Security Logs:</span>
            {log.length === 0 ? (
              <p className="empty-log">[ System Idle ]</p>
            ) : (
              log.map((item, idx) => (
                <p key={idx} className="log-line">{item}</p>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .game-container {
          padding: 20px;
          border-radius: 24px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.45);
        }

        .game-intro, .game-over-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          padding: 20px 10px;
        }

        .game-intro-icon {
          color: var(--neon-warning);
          filter: drop-shadow(0 0 10px rgba(245,158,11,0.4));
        }

        .game-intro-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .game-intro-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 320px;
          line-height: 1.5;
        }

        .rules-card {
          width: 100%;
          border-radius: 16px;
          padding: 16px;
          background: rgba(0,0,0,0.15);
          text-align: left;
          border: 1px solid var(--border-dim);
        }

        .rules-card ul {
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .start-btn {
          width: 100%;
          border-radius: 16px;
        }

        /* Game Over Screen */
        .trophy-icon {
          color: var(--neon-warning);
          filter: drop-shadow(0 0 15px rgba(245,158,11,0.5));
          animation: float 3s infinite ease-in-out;
        }

        .result-msg {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 360px;
        }

        .high-score-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-dim);
          padding: 10px 20px;
          border-radius: 10px;
          color: var(--neon-secondary);
          font-weight: 700;
        }

        /* Board layout */
        .game-board {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .game-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr;
          gap: 10px;
          background: rgba(0,0,0,0.2);
          padding: 12px;
          border-radius: 14px;
          border: 1px solid var(--border-dim);
        }

        .game-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .game-stat .stat-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .game-stat .stat-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .power-bar-wrapper {
          position: relative;
          height: 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--border-dim);
        }

        .power-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--neon-secondary), var(--neon-success));
          width: 100%;
          transition: width 0.3s ease;
        }

        .power-bar.danger {
          background: linear-gradient(90deg, var(--neon-danger), #f43f5e);
        }

        .power-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
        }

        /* Envelope */
        .email-envelope-card {
          padding: 20px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(135deg, rgba(20, 27, 45, 0.7) 0%, rgba(13, 20, 35, 0.9) 100%);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .envelope-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mail-icon {
          color: var(--neon-primary);
        }

        .envelope-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .envelope-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .email-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .email-sender {
          font-size: 1rem;
          color: #ffffff;
          font-weight: 600;
          word-break: break-all;
        }

        .checks-results-area {
          border-top: 1px solid var(--border-dim);
          padding-top: 12px;
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .check-instruction {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .scan-result-badge {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          text-align: center;
        }

        .scan-result-badge.safe {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .scan-result-badge.maybe-spam {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .scan-result-badge.spam {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* Controls Section */
        .game-controls-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .game-btn-row {
          display: flex;
          gap: 10px;
        }

        .control-action-btn {
          flex: 1;
          padding: 10px;
          font-size: 0.8rem;
          border-radius: 10px;
        }

        .control-action-btn .cyan { color: var(--neon-secondary); }
        .control-action-btn .violet { color: var(--neon-primary); }

        .action-btn-block {
          flex: 1;
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .action-btn-block:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .action-btn-deliver {
          flex: 1;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--neon-success), #047857);
          box-shadow: var(--glow-success);
        }
        .action-btn-deliver:hover {
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);
          transform: translateY(-1px);
        }

        .action-btn-deliver:active {
          transform: translateY(0);
        }

        .action-btn-block .red { color: var(--neon-danger); }
        .action-btn-deliver .green { color: #ffffff; }

        /* Game security logs */
        .game-logs {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-dim);
          border-radius: 12px;
          padding: 12px;
          font-size: 0.7rem;
          height: 120px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: hidden;
        }

        .log-label {
          color: var(--neon-primary);
          font-weight: 700;
          border-bottom: 1px solid var(--border-dim);
          padding-bottom: 4px;
          margin-bottom: 4px;
          display: block;
        }

        .empty-log {
          color: var(--text-muted);
        }

        .log-line {
          color: var(--text-secondary);
          animation: slide-up 0.2s ease;
        }
      `}</style>
    </div>
  )
}
