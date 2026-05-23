import React, { useState } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, Play, CheckCircle, Clock } from 'lucide-react'

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
          <span className="file-status completed">
            <CheckCircle size={14} />
            <span>Done</span>
          </span>
        )
      case 'In Progress':
        return (
          <span className="file-status in-progress">
            <Clock size={14} />
            <span>Resume</span>
          </span>
        )
      default:
        return (
          <span className="file-status not-started">
            <span>Start</span>
          </span>
        )
    }
  }

  if (!isFolder) {
    const file = node as FileItem
    return (
      <div 
        className={`tree-file glass ${file.id === 'bloom-filter' ? 'clickable' : 'locked'}`}
        onClick={() => file.id === 'bloom-filter' && onSelectFile(file.id)}
      >
        <div className="file-info">
          <FileText size={18} className="file-icon" />
          <div className="file-name-container">
            <span className="file-name">{file.name}</span>
            <span className="file-xp">{file.xp} XP</span>
          </div>
        </div>
        <div className="file-actions">
          {getStatusBadge(file.status)}
          {file.id === 'bloom-filter' ? (
            <Play size={14} className="play-arrow-icon" />
          ) : (
            <span className="locked-tag">Locked</span>
          )}
        </div>
      </div>
    )
  }

  const folder = node as FolderItem
  return (
    <div className="tree-folder-wrapper">
      <div 
        className="tree-folder glass"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="folder-info">
          <ChevronRight 
            size={18} 
            className={`chevron-icon ${isOpen ? 'open' : ''}`} 
          />
          {isOpen ? (
            <FolderOpen size={20} className="folder-icon open" />
          ) : (
            <Folder size={20} className="folder-icon" />
          )}
          <span className="folder-name">{folder.name}</span>
        </div>
        <span className="folder-count">{folder.children.length} topics</span>
      </div>

      {isOpen && (
        <div className="folder-children">
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

      <style>{`
        .tree-folder-wrapper {
          margin-bottom: 12px;
          animation: slide-up 0.3s ease;
        }

        .tree-folder {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-radius: 16px;
          cursor: pointer;
          border: 1px solid var(--border-dim);
          background: rgba(20, 27, 45, 0.4);
          transition: all 0.2s ease;
        }

        .tree-folder:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .folder-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chevron-icon {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .chevron-icon.open {
          transform: rotate(90deg);
        }

        .folder-icon {
          color: var(--neon-secondary);
        }

        .folder-icon.open {
          color: var(--neon-primary);
        }

        .folder-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .folder-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 8px;
        }

        .folder-children {
          padding-left: 20px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-left: 1px dashed var(--border-dim);
          margin-left: 25px;
        }

        /* File node styling */
        .tree-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid var(--border-dim);
          background: rgba(13, 20, 35, 0.3);
          transition: all 0.2s ease;
        }

        .tree-file.clickable {
          cursor: pointer;
        }

        .tree-file.clickable:hover {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.35);
          transform: translateX(4px);
        }

        .tree-file.locked {
          opacity: 0.55;
          cursor: not-allowed;
          background: rgba(0, 0, 0, 0.2);
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-icon {
          color: var(--text-muted);
        }

        .tree-file.clickable .file-icon {
          color: var(--neon-primary);
        }

        .file-name-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .file-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .file-xp {
          font-size: 0.7rem;
          color: var(--neon-secondary);
          font-weight: 700;
        }

        .file-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .file-status {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .file-status.completed {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .file-status.in-progress {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .file-status.not-started {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-dim);
        }

        .play-arrow-icon {
          color: var(--neon-primary);
          filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.5));
        }

        .locked-tag {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.15);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  )
}
