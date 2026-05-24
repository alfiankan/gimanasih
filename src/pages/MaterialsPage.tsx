import React, { useState } from 'react'
import { FolderTree, type FolderItem } from '../components/FolderTree'
import { Search, Trophy, BookOpen, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'


interface MaterialsPageProps {
  onStartLesson: (lessonId: string) => void
  totalXp: number
}

const COURSES_DATA: FolderItem[] = [
  {
    id: 'probabilistic',
    name: 'Probabilistic Data Structures',
    type: 'folder',
    children: [
      {
        id: 'bloom-filter',
        name: 'Bloom Filter',
        type: 'file',
        status: 'In Progress',
        xp: 250
      }
    ]
  },
  {
    id: 'distributed',
    name: 'Distributed Systems',
    type: 'folder',
    children: [
      {
        id: 'raft-consensus',
        name: 'Raft Consensus',
        type: 'file',
        status: 'Not Started',
        xp: 500
      }
    ]
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    type: 'folder',
    children: [
      {
        id: 'binary-search',
        name: 'Binary Search',
        type: 'file',
        status: 'Not Started',
        xp: 250
      },
      {
        id: 'dot-product',
        name: 'Dot Product',
        type: 'file',
        status: 'Not Started',
        xp: 300
      }
    ]
  }
]

export const MaterialsPage: React.FC<MaterialsPageProps> = ({ onStartLesson, totalXp }) => {
  const [searchQuery, setSearchQuery] = useState<string>('')

  return (
    <div className="materials-container px-6 pb-6 pt-[96px] md:pl-[272px] md:pt-[104px] md:pr-8 max-w-5xl mx-auto w-full mb-24 md:mb-8 flex flex-col gap-6 animate-slide-up">
      {/* Page Header */}
      <div className="materials-header-top flex items-center justify-between w-full select-none">
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">Syllabus</h1>
      </div>

      {/* Top Banner Dashboard */}
      <Card 
        glass
        className="materials-hero p-5 rounded-2xl bg-gradient-to-br from-card to-background border-white/5"
      >
        <div className="hero-stats grid grid-cols-3 gap-3">
          <div className="hero-stat-box flex flex-col items-center text-center gap-2 py-2">
            <Trophy className="stat-icon text-neon-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]" size={24} />
            <div className="stat-text flex flex-col gap-0.5">
              <span className="stat-value text-base font-extrabold text-foreground">{totalXp} XP</span>
              <span className="stat-label text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Earned</span>
            </div>
          </div>
          
          <div className="hero-stat-box flex flex-col items-center text-center gap-2 py-2">
            <BookOpen className="stat-icon text-neon-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]" size={24} />
            <div className="stat-text flex flex-col gap-0.5">
              <span className="stat-value text-base font-extrabold text-foreground">1 / 6</span>
              <span className="stat-label text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Lessons Active</span>
            </div>
          </div>
          
          <div className="hero-stat-box flex flex-col items-center text-center gap-2 py-2">
            <Layers className="stat-icon text-neon-secondary drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]" size={24} />
            <div className="stat-text flex flex-col gap-0.5">
              <span className="stat-value text-base font-extrabold text-foreground">16%</span>
              <span className="stat-label text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Search Input Bar */}
      <div className="search-bar-wrapper relative flex items-center w-full">
        <Search size={18} className="search-icon absolute left-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search lessons, structures, or concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input pl-11 pr-16 h-12 bg-slate-950/40 border-white/5 text-sm rounded-2xl"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="clear-search-btn absolute right-3 px-2 py-1 rounded bg-white/5 text-xs text-slate-400 hover:text-white cursor-pointer transition-all border border-white/5 active:scale-95"
          >
            Clear
          </button>
        )}
      </div>

      {/* Course list */}
      <div className="flex flex-col gap-4">
        <h2 className="materials-title text-base font-extrabold border-l-4 border-neon-primary pl-3 text-foreground tracking-tight select-none">
          Lessons
        </h2>
        <div className="folder-tree-container flex flex-col gap-2">
          {COURSES_DATA.map((course) => (
            <FolderTree
              key={course.id}
              node={course}
              onSelectFile={onStartLesson}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
