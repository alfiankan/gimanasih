import React from 'react'
import { Compass, FolderOpen, Award, Sparkles } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'materials', label: 'Materials', icon: FolderOpen },
    { id: 'achievements', label: 'Badges', icon: Award },
  ]

  return (
    <>
      {/* Bottom Nav for Mobile */}
      <nav className="mobile-nav glass">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id || (item.id === 'materials' && activeTab.startsWith('lesson'))
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="icon-wrapper">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Desktop Sidebar Nav */}
      <aside className="desktop-sidebar glass">
        <div className="sidebar-logo">
          <Sparkles size={24} className="logo-icon" />
          <span className="logo-text">Gimanasih</span>
        </div>
        <div className="sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id || (item.id === 'materials' && activeTab.startsWith('lesson'))
            return (
              <button
                key={item.id}
                className={`sidebar-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className="sidebar-footer">
          <span className="version-tag">v1.0.0 • Mobile-first PWA</span>
        </div>
      </aside>

      <style>{`
        /* Navigation Component CSS Styles */
        .mobile-nav {
          position: fixed;
          bottom: 12px;
          left: 12px;
          right: 12px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 1000;
          box-shadow: var(--shadow-premium), 0 0 1px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 10px;
        }

        .nav-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex: 1;
          height: 100%;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .icon-wrapper {
          padding: 4px 16px;
          border-radius: 16px;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .nav-btn.active {
          color: var(--neon-primary);
        }

        .nav-btn.active .icon-wrapper {
          background: rgba(139, 92, 246, 0.12);
          color: var(--neon-primary);
          transform: translateY(-2px);
          filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4));
        }

        .nav-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Desktop Sidebar Navigation Styles */
        .desktop-sidebar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 240px;
          flex-direction: column;
          padding: 24px;
          z-index: 1000;
          border-right: 1px solid var(--border-dim);
          border-top: none;
          border-bottom: none;
          border-left: none;
          background: rgba(9, 13, 22, 0.85);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding-left: 8px;
        }

        .logo-icon {
          color: var(--neon-primary);
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 30%, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .sidebar-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .sidebar-btn.active {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.25);
          color: var(--neon-primary);
          box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.05);
        }

        .sidebar-footer {
          padding-top: 16px;
          border-top: 1px solid var(--border-dim);
        }

        .version-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (min-width: 769px) {
          .mobile-nav {
            display: none;
          }
          .desktop-sidebar {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}
