import React, { useState } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, Play, CheckCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FileItem {
  id: string
  name: string
  type: 'file'
  status: 'Not Started' | 'In Progress' | 'Completed'
  xp: number
}

export interface FolderItem {
  id: string
  name: string
  type: 'folder'
  children: (FolderItem | FileItem)[]
}

interface FolderTreeProps {
  node: FolderItem | FileItem
  onSelectFile: (id: string) => void
  searchQuery: string
}

export const FolderTree: React.FC<FolderTreeProps> = ({ node, onSelectFile, searchQuery }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true)

  const isFolder = node.type === 'folder'

  // If node is a folder, check if any child matches the search query (so we keep the folder open if a child matches)
  const matchesSearch = (item: FolderItem | FileItem): boolean => {
    if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true
    }
    if (item.type === 'folder') {
      return item.children.some(matchesSearch)
    }
    return false
  }

  // Filter children based on search query
  const filteredChildren = isFolder
    ? (node as FolderItem).children.filter(matchesSearch)
    : []

  // If node itself and none of its children match, don't render it
  if (searchQuery && !matchesSearch(node)) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="file-status bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 select-none">
            <CheckCircle size={14} />
            <span>Done</span>
          </span>
        )
      case 'In Progress':
        return (
          <span className="file-status bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 select-none">
            <Clock size={14} />
            <span>Resume</span>
          </span>
        )
      default:
        return (
          <span className="file-status bg-white/5 text-slate-400 border border-border/80 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 select-none">
            <span>Start</span>
          </span>
        )
    }
  }

  if (!isFolder) {
    const file = node as FileItem
    const isUnlocked = file.id === 'bloom-filter'
    
    return (
      <Card
        glass={isUnlocked}
        onClick={() => isUnlocked && onSelectFile(file.id)}
        className={cn(
          "tree-file flex items-center justify-between p-3.5 rounded-xl border border-border/40 transition-all duration-200 select-none",
          isUnlocked 
            ? "cursor-pointer bg-slate-900/40 hover:bg-neon-primary/5 hover:border-neon-primary/35 hover:translate-x-1" 
            : "opacity-45 cursor-not-allowed bg-black/20"
        )}
      >
        <div className="file-info flex items-center gap-3">
          <FileText size={18} className={cn("file-icon text-muted-foreground", isUnlocked && "text-neon-primary")} />
          <div className="file-name-container flex flex-col gap-0.5">
            <span className="file-name text-sm font-semibold text-foreground">{file.name}</span>
            <span className="file-xp text-[10px] text-neon-secondary font-bold">{file.xp} XP</span>
          </div>
        </div>
        <div className="file-actions flex items-center gap-2.5">
          {getStatusBadge(file.status)}
          {isUnlocked ? (
            <Play size={14} className="play-arrow-icon text-neon-primary drop-shadow-[0_0_4px_rgba(139,92,246,0.5)] fill-neon-primary" />
          ) : (
            <span className="locked-tag text-[9px] font-semibold text-muted-foreground bg-black/30 border border-white/2 px-1.5 py-0.5 rounded">
              Locked
            </span>
          )}
        </div>
      </Card>
    )
  }

  const folder = node as FolderItem
  return (
    <div className="tree-folder-wrapper flex flex-col mb-3 animate-slide-up select-none">
      <Card 
        glass
        onClick={() => setIsOpen(!isOpen)}
        className="tree-folder flex items-center justify-between p-4 rounded-xl cursor-pointer border-border/40 bg-slate-900/30 hover:bg-neon-primary/5 hover:border-neon-primary/30 transition-all duration-200"
      >
        <div className="folder-info flex items-center gap-3">
          <ChevronRight 
            size={18} 
            className={cn("chevron-icon text-muted-foreground transition-transform duration-200", isOpen && "rotate-90")} 
          />
          {isOpen ? (
            <FolderOpen size={20} className="folder-icon text-neon-primary" />
          ) : (
            <Folder size={20} className="folder-icon text-neon-secondary" />
          )}
          <span className="folder-name text-sm font-bold text-foreground">{folder.name}</span>
        </div>
        <span className="folder-count text-[10px] font-bold text-muted-foreground bg-white/5 px-2.5 py-1 rounded-lg">
          {folder.children.length} topics
        </span>
      </Card>

      {isOpen && (
        <div className="folder-children pl-5 mt-2 flex flex-col gap-2 border-l border-dashed border-border/60 ml-6">
          {filteredChildren.map((child) => (
            <FolderTree 
              key={child.id} 
              node={child} 
              onSelectFile={onSelectFile}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}
