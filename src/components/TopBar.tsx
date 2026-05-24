import React from 'react';
import { Zap, Brain } from 'lucide-react';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  picture: string;
}

interface TopBarProps {
  totalXp: number;
  isLoggedIn: boolean;
  user: UserProfile | null;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ totalXp, isLoggedIn, user, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 md:left-[240px] h-[72px] z-50 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 select-none transition-all duration-300">
      {/* Brand logo shown on mobile, hidden on desktop since sidebar shows it */}
      <div className="flex items-center gap-2.5 md:hidden">
        <Brain size={22} className="text-neon-primary" />
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          bitbrain
        </span>
      </div>
      
      {/* Spacer to push XP to right on desktop */}
      <div className="hidden md:block" />

      {/* Profile/Auth area + XP */}
      <div className="flex items-center gap-4">
        {/* Larger, premium XP container */}
        <div className="bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:border-amber-500/40 hover:bg-amber-500/15 text-sm font-extrabold uppercase tracking-wider px-4.5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-200 cursor-pointer">
          <Zap size={16} className="text-amber-400 fill-amber-400/20 animate-pulse" />
          <span>{totalXp} XP</span>
        </div>

        {!isLoggedIn && (
          <div className="hidden sm:block pl-2">
            <div id="google-signin-button"></div>
          </div>
        )}
      </div>
    </header>
  );
};
