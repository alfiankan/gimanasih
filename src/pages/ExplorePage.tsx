import React from 'react'
import { ExploreCard, type LessonData } from '../components/ExploreCard'

interface ExplorePageProps {
  onStartLesson: (lessonId: string) => void
}

const LESSONS: LessonData[] = [
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    category: 'Probabilistic Structures',
    difficulty: 'Intermediate',
    duration: '12 mins',
    xp: 250,
    description: 'Learn how to test set membership in constant time and zero memory using multiple hash functions. Explore why false positives happen!',
    visualType: 'bloom'
  },
  {
    id: 'raft-consensus',
    title: 'Raft Consensus',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    duration: '25 mins',
    xp: 500,
    description: 'Unpack how machines agree in a distributed cluster. Dive into leader elections, log replication, and split-brain resolution.',
    visualType: 'raft'
  }
]

export const ExplorePage: React.FC<ExplorePageProps> = ({ onStartLesson }) => {
  return (
    <div className="explore-container w-full h-screen h-svh relative bg-background pt-[72px] pb-[76px] md:pb-0 box-border">
      {/* Feed Container */}
      <div className="explore-feed h-full md:pl-[240px] overflow-y-auto">
        {LESSONS.map((lesson, idx) => (
          <ExploreCard 
            key={`${lesson.id}-${idx}`} 
            lesson={lesson} 
            onStart={onStartLesson} 
          />
        ))}
      </div>
    </div>
  )
}
