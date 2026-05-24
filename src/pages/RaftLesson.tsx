import React, { useState } from 'react'
import { ArrowLeft, BookOpen, Cpu, Gamepad2, Award, Zap } from 'lucide-react'
import { RaftConcept } from '../components/raft/RaftConcept'
import { RaftSimulator } from '../components/raft/RaftSimulator'
import { RaftGame } from '../components/raft/RaftGame'
import { RaftQuiz } from '../components/raft/RaftQuiz'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AuthGate } from '../components/AuthGate'

interface RaftLessonProps {
  onBack: () => void
  onPass?: () => void
  currentXp: number
  onGainXp: (amount: number) => void
  isLoggedIn: boolean
}

type TabType = 'concept' | 'simulator' | 'game' | 'quiz'

export const RaftLesson: React.FC<RaftLessonProps> = ({ onBack, onPass, currentXp, onGainXp, isLoggedIn }) => {
  const [activeTab, setActiveTab] = useState<TabType>('concept')
  const [quizPassed, setQuizPassed] = useState<boolean>(false)
  const [gameHighScore, setGameHighScore] = useState<number>(0)
  
  // Track if they've already received XP from this mount to avoid farming
  const [gameXpGained, setGameXpGained] = useState<boolean>(false)
  const [quizXpGained, setQuizXpGained] = useState<boolean>(false)

  const tabs = [
    { id: 'concept', label: 'Concept', icon: BookOpen },
    { id: 'simulator', label: 'Simulator', icon: Cpu },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'quiz', label: 'Quiz', icon: Award },
  ]

  return (
    <div className="lesson-container p-6 md:pl-[272px] md:pt-8 md:pr-8 max-w-5xl mx-auto w-full mb-24 md:mb-8 flex flex-col gap-5 animate-slide-up select-none">
      {/* Top Header */}
      <Card 
        glass
        className="lesson-header flex items-center justify-between p-4 rounded-2xl border-white/5 bg-slate-950/60"
      >
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="rounded-xl px-3 h-9 bg-white/3 border-white/5 cursor-pointer font-bold flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        
        <div className="lesson-header-title text-center hidden sm:block">
          <span className="lesson-category text-[9px] font-extrabold text-neon-secondary uppercase tracking-widest block mb-0.5">
            Distributed Systems
          </span>
          <h1 className="lesson-name text-base md:text-lg font-extrabold text-foreground tracking-tight leading-none">
            Raft Consensus
          </h1>
        </div>

        <div className="lesson-badge-status flex items-center gap-2">
          {/* XP Pill */}
          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.15)] select-none">
            <Zap size={12} className="text-amber-400 fill-amber-400/20" />
            <span>{currentXp} XP</span>
          </div>

          {quizPassed ? (
            <span className="status-badge-passed bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg">
              Passed
            </span>
          ) : (
            <span className="status-badge-ongoing bg-violet-500/10 text-violet-400 border border-violet-500/25 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg">
              Learning
            </span>
          )}
        </div>
      </Card>

      {/* Tab Navigation & Content via Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full flex flex-col gap-4">
        <TabsList className="grid grid-cols-4 p-1 bg-slate-900/50 rounded-2xl border border-white/5 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="py-2.5 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold rounded-xl cursor-pointer"
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <main className="lesson-content-area min-h-[380px] w-full flex flex-col">
          <TabsContent value="concept" className="mt-0">
            <RaftConcept onComplete={() => setActiveTab('simulator')} />
          </TabsContent>
          
          <TabsContent value="simulator" className="mt-0">
            <RaftSimulator onComplete={() => setActiveTab('game')} />
          </TabsContent>
          
          <TabsContent value="game" className="mt-0">
            {isLoggedIn ? (
              <RaftGame 
                highScore={gameHighScore} 
                setHighScore={setGameHighScore} 
                onComplete={() => setActiveTab('quiz')} 
                onFinishGame={() => {
                  if (!gameXpGained) {
                    setGameXpGained(true)
                    onGainXp(100) // 100 XP for completing the game!
                  }
                }}
              />
            ) : (
              <AuthGate />
            )}
          </TabsContent>
          
          <TabsContent value="quiz" className="mt-0">
            {isLoggedIn ? (
              <RaftQuiz 
                quizPassed={quizPassed} 
                setQuizPassed={(passed: boolean) => {
                  setQuizPassed(passed)
                  if (passed && onPass) onPass()
                  if (passed && !quizXpGained) {
                    setQuizXpGained(true)
                    onGainXp(150) // 150 XP for passing the quiz!
                  }
                }}
                onBack={onBack} 
              />
            ) : (
              <AuthGate />
            )}
          </TabsContent>
        </main>
      </Tabs>
    </div>
  )
}
