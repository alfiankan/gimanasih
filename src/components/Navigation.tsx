import React from 'react'
import { Compass, FolderOpen, User, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'materials', label: 'Materials', icon: FolderOpen },
    { id: 'account', label: 'Account', icon: User },
  ]

  return (
    <>
      {/* Bottom Nav for Mobile */}
      <nav className="mobile-nav fixed bottom-3 left-3 right-3 h-16 rounded-[20px] flex justify-around items-center z-50 glass shadow-2xl px-2.5 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id || (item.id === 'materials' && activeTab.startsWith('lesson'))
          return (
            <button
              key={item.id}
              className={cn(
                "bg-none border-none text-muted-foreground flex flex-col items-center justify-center gap-1 flex-1 h-full cursor-pointer transition-all duration-200 relative",
                isActive && "text-neon-primary"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <div
                className={cn(
                  "px-4 py-1 rounded-2xl transition-all duration-200 ease-out",
                  isActive && "bg-neon-primary/10 text-neon-primary -translate-y-0.5 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Desktop Sidebar Nav */}
      <aside className="desktop-sidebar hidden md:flex fixed top-0 left-0 bottom-0 w-[240px] flex-col p-6 z-50 border-r border-border/80 bg-background/95 backdrop-blur-xl">
        <div className="sidebar-logo flex items-center gap-3 mb-10 pl-2 select-none">
          <Brain size={24} className="logo-icon text-neon-primary" />
          <span className="logo-text text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            bitbrain
          </span>
        </div>
        
        <div className="sidebar-menu flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id || (item.id === 'materials' && activeTab.startsWith('lesson'))
            return (
              <button
                key={item.id}
                className={cn(
                  "bg-transparent text-slate-400 flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold w-full cursor-pointer transition-all duration-200 border border-transparent hover:bg-white/5 hover:text-white hover:translate-x-1",
                  isActive && "bg-neon-primary/10 border-neon-primary/20 text-neon-primary hover:text-neon-primary hover:bg-neon-primary/10 hover:translate-x-0 shadow-[inset_0_0_12px_rgba(139,92,246,0.05)]"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="sidebar-footer pt-4 border-t border-border/40">
          <span className="version-tag text-xs text-muted-foreground select-none">
            v1.0.0 • Mobile-first PWA
          </span>
        </div>
      </aside>
    </>
  )
}
