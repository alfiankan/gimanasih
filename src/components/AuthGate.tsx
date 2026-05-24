import React from 'react';
import { Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const AuthGate: React.FC = () => {
  return (
    <Card 
      glass 
      className="p-8 flex flex-col items-center justify-center text-center gap-5 max-w-md mx-auto my-12 animate-slide-up rounded-3xl border-white/5 bg-slate-950/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] select-none"
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/25 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
        <Lock size={28} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-black text-foreground tracking-tight">Interactive Mode Locked</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You must log in with Google to play the games, complete certification quizzes, save points, and earn achievements.
        </p>
      </div>
      <div className="mt-2 flex justify-center w-full min-h-[40px]">
        {/* Google Script renders sign-in button here */}
        <div id="google-signin-button-gate"></div>
      </div>
    </Card>
  );
};
