import React, { useState } from 'react'
import { ArrowLeft, BookOpen, Cpu, Gamepad2, Award, Zap } from 'lucide-react'
import { BinarySearchConcept } from '../components/binary-search/BinarySearchConcept'
import { BinarySearchSimulator } from '../components/binary-search/BinarySearchSimulator'
import { BinarySearchGame } from '../components/binary-search/BinarySearchGame'
import { BinarySearchQuiz } from '../components/binary-search/BinarySearchQuiz'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AuthGate } from '../components/AuthGate'

interface BinarySearchLessonProps {
  onBack: () => void
  onPass?: () => void
  currentXp: number
  onGainXp: (amount: number) => void
  isLoggedIn: boolean
}

type TabType = 'concept' | 'simulator' | 'game' | 'quiz'

export const BinarySearchLesson: React.FC<BinarySearchLessonProps> = ({ onBack, onPass, currentXp, onGainXp, isLoggedIn }) => {
  const [activeTab, setActiveTab] = useState<TabType>('concept')
  const [quizPassed, setQuizPassed] = useState(false)
  const [gameHighScore, setGameHighScore] = useState(0)
  const [gameXpGained, setGameXpGained] = useState(false)
  const [quizXpGained, setQuizXpGained] = useState(false)

  const tabs = [
    { id: 'concept', label: 'Concept', icon: BookOpen },
    { id: 'simulator', label: 'Simulator', icon: Cpu },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'quiz', label: 'Quiz', icon: Award },
  ]

  return (
    <div className="lesson-container p-6 md:pl-[272px] md:pt-8 md:pr-8 max-w-5xl mx-auto w-full mb-24 md:mb-8 flex flex-col gap-5 animate-slide-up select-none">
      <Card glass className="lesson-header flex items-center justify-between p-4 rounded-2xl border-white/5 bg-slate-950/60">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="rounded-xl px-3 h-9 bg-white/3 border-white/5 cursor-pointer font-bold flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /><span>Back</span>
        </Button>

        <div className="lesson-header-title text-center hidden sm:block">
          <span className="text-[9px] font-extrabold text-neon-secondary uppercase tracking-widest block mb-0.5">
            Algorithms
          </span>
          <h1 className="text-base md:text-lg font-extrabold text-foreground tracking-tight leading-none">
            Binary Search
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Zap size={12} className="fill-amber-400/20" />
            <span>{currentXp} XP</span>
          </div>
          {quizPassed ? (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg">Passed</span>
          ) : (
            <span className="bg-violet-500/10 text-violet-400 border border-violet-500/25 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg">Learning</span>
          )}
        </div>
      </Card>

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
                <Icon size={16} /><span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <main className="lesson-content-area min-h-[380px] w-full flex flex-col">
          <TabsContent value="concept" className="mt-0">
            <BinarySearchConcept onComplete={() => setActiveTab('simulator')} />
          </TabsContent>

          <TabsContent value="simulator" className="mt-0">
            <BinarySearchSimulator onComplete={() => setActiveTab('game')} />
          </TabsContent>

          <TabsContent value="game" className="mt-0">
            {isLoggedIn ? (
              <BinarySearchGame
                highScore={gameHighScore}
                setHighScore={setGameHighScore}
                onComplete={() => setActiveTab('quiz')}
                onFinishGame={() => {
                  if (!gameXpGained) {
                    setGameXpGained(true)
                    onGainXp(100)
                  }
                }}
              />
            ) : (
              <AuthGate />
            )}
          </TabsContent>

          <TabsContent value="quiz" className="mt-0">
            {isLoggedIn ? (
              <BinarySearchQuiz
                quizPassed={quizPassed}
                setQuizPassed={(passed: boolean) => {
                  setQuizPassed(passed)
                  if (passed && onPass) onPass()
                  if (passed && !quizXpGained) {
                    setQuizXpGained(true)
                    onGainXp(150)
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
