import { useState, useEffect } from 'react'
import { Navigation } from './components/Navigation'
import { ExplorePage } from './pages/ExplorePage'
import { MaterialsPage } from './pages/MaterialsPage'
import { BloomFilterLesson } from './pages/BloomFilterLesson'
import { RaftLesson } from './pages/RaftLesson'
import { BinarySearchLesson } from './pages/BinarySearchLesson'
import { DotProductLesson } from './pages/DotProductLesson'
import { Award, Lock, Zap, BookOpen, Brain } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TopBar } from './components/TopBar';
import { useAuth } from './hooks/useAuth';

interface GoogleGsiAccountsId {
  initialize(config: { client_id: string; callback: (response: { credential: string }) => Promise<void> | void }): void;
  renderButton(element: HTMLElement, options: { theme?: string; size?: string; shape?: string }): void;
}

interface GoogleGsi {
  accounts: {
    id: GoogleGsiAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleGsi;
  }
}

const getInitialTabFromUrl = (): string => {
  const pathname = window.location.pathname
  const basePrefix = '/'
  let relativePath = pathname
  
  if (pathname.startsWith(basePrefix)) {
    relativePath = pathname.slice(basePrefix.length)
  }
  
  if (relativePath.endsWith('/')) {
    relativePath = relativePath.slice(0, -1)
  }

  if (relativePath === 'materials') return 'materials'
  if (relativePath === 'badges' || relativePath === 'achievements' || relativePath === 'account') return 'account'
  if (relativePath.startsWith('lesson/')) {
    const lessonId = relativePath.slice('lesson/'.length)
    return `lesson-${lessonId}`
  }
  return 'explore'
}

function App() {
  const { user, isLoggedIn, loginWithGoogle, logout, fetchCloudProgress, syncCloudProgress } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(getInitialTabFromUrl())
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [xp, setXp] = useState<number>(0)

  // Load/initialize Google sign-in buttons dynamically based on tab/login status
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && !isLoggedIn) {
        window.google.accounts.id.initialize({
          client_id: "799127351812-cvbnk9o5vvk4jaf76ssrn5so548vseig.apps.googleusercontent.com",
          callback: async (response: { credential: string }) => {
            try {
              await loginWithGoogle(response.credential);
            } catch (err) {
              console.error("Login failed:", err);
            }
          }
        });
        
        const renderIfPresent = (id: string) => {
          const el = document.getElementById(id);
          if (el) {
            window.google?.accounts.id.renderButton(el, { 
              theme: "filled_blue", 
              size: "large", 
              shape: "rectangular" 
            });
          }
        };

        renderIfPresent("google-signin-button");
        renderIfPresent("google-signin-button-account");
        renderIfPresent("google-signin-button-gate");
      }
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle, isLoggedIn, activeTab]);

  // Sync cloud progress when logging in or logging out
  useEffect(() => {
    if (isLoggedIn) {
      fetchCloudProgress().then(progress => {
        if (progress) {
          setXp(progress.xp);
          setUnlockedBadges(progress.unlockedBadges);
        }
      });
    } else {
      Promise.resolve().then(() => {
        setXp(0);
        setUnlockedBadges([]);
      });
    }
  }, [isLoggedIn, fetchCloudProgress]);

  // Auto-sync progress modifications to D1 Database
  useEffect(() => {
    if (isLoggedIn) {
      syncCloudProgress(xp, unlockedBadges, []);
    }
  }, [xp, unlockedBadges, isLoggedIn, syncCloudProgress]);

  useEffect(() => {
    const basePrefix = '/'
    let targetPath = ''
    if (activeTab === 'materials') {
      targetPath = 'materials'
    } else if (activeTab === 'account') {
      targetPath = 'account'
    } else if (activeTab.startsWith('lesson-')) {
      const lessonId = activeTab.replace('lesson-', '')
      targetPath = `lesson/${lessonId}`
    }
    
    const targetFullPagePath = `${basePrefix}${targetPath}`
    if (window.location.pathname !== targetFullPagePath) {
      window.history.pushState(null, '', targetFullPagePath)
    }
  }, [activeTab])

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl())
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const handleStartLesson = (lessonId: string) => {
    setActiveTab(`lesson-${lessonId}`)
  }

  const markBadgeAsUnlocked = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev
      return [...prev, badgeId]
    })
  }

  const renderActivePage = () => {
    if (activeTab === 'explore') {
      return <ExplorePage onStartLesson={handleStartLesson} />
    }
    if (activeTab === 'materials') {
      return <MaterialsPage onStartLesson={handleStartLesson} totalXp={xp} />
    }
    if (activeTab === 'lesson-bloom-filter') {
      return (
        <BloomFilterLesson 
          onBack={() => {
            setActiveTab('materials')
          }}
          onPass={() => markBadgeAsUnlocked('bloom-filter')}
          currentXp={xp}
          onGainXp={(amount) => setXp(prev => prev + amount)}
          isLoggedIn={isLoggedIn}
        />
      )
    }
    if (activeTab === 'lesson-raft-consensus') {
      return (
        <RaftLesson 
          onBack={() => {
            setActiveTab('materials')
          }}
          onPass={() => markBadgeAsUnlocked('raft-consensus')}
          currentXp={xp}
          onGainXp={(amount) => setXp(prev => prev + amount)}
          isLoggedIn={isLoggedIn}
        />
      )
    }
    if (activeTab === 'lesson-binary-search') {
      return (
        <BinarySearchLesson
          onBack={() => setActiveTab('materials')}
          onPass={() => markBadgeAsUnlocked('binary-search')}
          currentXp={xp}
          onGainXp={(amount) => setXp(prev => prev + amount)}
          isLoggedIn={isLoggedIn}
        />
      )
    }
    if (activeTab === 'lesson-dot-product') {
      return (
        <DotProductLesson
          onBack={() => setActiveTab('materials')}
          onPass={() => markBadgeAsUnlocked('dot-product')}
          currentXp={xp}
          onGainXp={(amount) => setXp(prev => prev + amount)}
          isLoggedIn={isLoggedIn}
        />
      )
    }
    if (activeTab === 'account') {
      if (!isLoggedIn || !user) {
        return (
          <div className="account-page px-6 pb-6 pt-[96px] md:pl-[272px] md:pt-[104px] md:pr-8 max-w-5xl mx-auto w-full mb-24 md:mb-8 flex flex-col items-center justify-center min-h-[50vh] gap-6 animate-slide-up select-none">
            <Card glass className="p-8 flex flex-col items-center justify-center text-center gap-5 max-w-md w-full rounded-3xl border-white/5 bg-slate-950/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]">
              <div className="w-16 h-16 rounded-full bg-neon-primary/10 flex items-center justify-center border border-neon-primary/25 text-neon-primary shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                <Brain size={28} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-black text-foreground tracking-tight">Sync Your Progress</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Log in with Google to play coding simulator games, take certification quizzes, sync achievements across devices, and accumulate XP points.
                </p>
              </div>
              <div className="mt-2 flex justify-center w-full min-h-[40px]">
                <div id="google-signin-button-account"></div>
              </div>
            </Card>
          </div>
        )
      }

      const level = Math.floor(xp / 100) + 1
      const currentLevelProgress = xp % 100
      return (
        <div className="account-page px-6 pb-6 pt-[96px] md:pl-[272px] md:pt-[104px] md:pr-8 max-w-5xl mx-auto w-full mb-24 md:mb-8 flex flex-col gap-6 animate-slide-up">
          <header className="account-header flex flex-col gap-1.5 mb-2 select-none">
            <h2 className="section-title text-xl font-extrabold border-l-4 border-neon-primary pl-3 text-foreground tracking-tight">
              My Profile
            </h2>
            <p className="section-desc text-sm text-muted-foreground pl-3">
              Manage your progress, stats, and achievements.
            </p>
          </header>

          {/* Profile Progress Card */}
          <Card glass className="p-6 flex flex-col gap-6 bg-gradient-to-br from-card to-background border-white/5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-16 h-16 rounded-2xl border border-neon-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0 select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-extrabold text-white">{user.name}</h3>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Premium Account Member</p>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-1 select-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Rank</span>
                <span className="text-xl font-black text-neon-secondary drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Level {level}</span>
              </div>
            </div>

            {/* Progress to next level */}
            <div className="flex flex-col gap-2 select-none">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Level {level} Progress</span>
                <span className="text-neon-primary font-bold">{currentLevelProgress}% ({xp % 100} / 100 XP)</span>
              </div>
              <div className="w-full bg-slate-950/60 rounded-full h-3 border border-white/5 overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-neon-primary to-neon-secondary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  style={{ width: `${currentLevelProgress}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 select-none">
            <Card glass className="p-4 flex flex-col items-center justify-center text-center gap-1 border-white/5 hover:border-amber-500/20 transition-all duration-300">
              <Zap size={22} className="text-amber-500 fill-amber-500/10 mb-1" />
              <span className="text-lg font-black text-foreground">{xp}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total XP</span>
            </Card>
            
            <Card glass className="p-4 flex flex-col items-center justify-center text-center gap-1 border-white/5 hover:border-amber-500/20 transition-all duration-300">
              <Award size={22} className="text-amber-500 mb-1" />
              <span className="text-lg font-black text-foreground">{unlockedBadges.length} / 4</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Badges</span>
            </Card>
            
            <Card glass className="p-4 flex flex-col items-center justify-center text-center gap-1 border-white/5 hover:border-neon-primary/20 transition-all duration-300">
              <BookOpen size={22} className="text-neon-primary mb-1" />
              <span className="stat-value text-base font-extrabold text-foreground">4 / 4</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Active</span>
            </Card>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-sm font-extrabold border-l-4 border-neon-warning pl-3 text-foreground tracking-tight select-none">
              Unlocked Certificates
            </h3>
            
            <div className="badges-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Bloom Filter Badge */}
              {(() => {
                const isUnlocked = unlockedBadges.includes('bloom-filter')
                return (
                  <Card 
                    glass={isUnlocked}
                    className={cn(
                      "badge-card p-5 flex flex-col items-center text-center gap-4 transition-all duration-300 relative overflow-hidden",
                      isUnlocked 
                        ? "border-amber-500/30 bg-gradient-to-br from-card to-amber-500/5 hover:-translate-y-1 hover:shadow-amber-500/10 hover:border-amber-500/50" 
                        : "opacity-40 bg-muted/20 border-border/40 hover:opacity-50"
                    )}
                  >
                    <div 
                      className={cn(
                        "badge-card-icon-wrapper w-16 h-16 rounded-full flex items-center justify-center border border-border/80 transition-all duration-300",
                        isUnlocked 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                          : "bg-white/2 text-muted-foreground"
                      )}
                    >
                      {isUnlocked ? <Award size={32} className="animate-pulse" /> : <Lock size={26} />}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <h3 className="badge-name text-sm font-bold text-foreground">{isUnlocked ? "Bloom Filter Master" : "Bloom Filter Master"}</h3>
                      <p className="badge-description text-xs text-muted-foreground leading-relaxed">
                        Understand bit arrays, false positive margins, and spam filters.
                      </p>
                    </div>

                    <div className="mt-auto pt-2">
                      {isUnlocked ? (
                        <span className="badge-status-tag bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                          Earned
                        </span>
                      ) : (
                        <span className="badge-status-tag bg-white/5 text-muted-foreground border border-border/50 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </span>
                      )}
                    </div>
                  </Card>
                )
              })()}

              {/* Raft Consensus Badge */}
              {(() => {
                const isUnlocked = unlockedBadges.includes('raft-consensus')
                return (
                  <Card 
                    glass={isUnlocked}
                    className={cn(
                      "badge-card p-5 flex flex-col items-center text-center gap-4 transition-all duration-300 relative overflow-hidden",
                      isUnlocked 
                        ? "border-amber-500/30 bg-gradient-to-br from-card to-amber-500/5 hover:-translate-y-1 hover:shadow-amber-500/10 hover:border-amber-500/50" 
                        : "opacity-40 bg-muted/20 border-border/40 hover:opacity-50"
                    )}
                  >
                    <div 
                      className={cn(
                        "badge-card-icon-wrapper w-16 h-16 rounded-full flex items-center justify-center border border-border/80 transition-all duration-300",
                        isUnlocked 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                          : "bg-white/2 text-muted-foreground"
                      )}
                    >
                      {isUnlocked ? <Award size={32} className="animate-pulse" /> : <Lock size={26} />}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <h3 className="badge-name text-sm font-bold text-foreground">{isUnlocked ? "Raft Master" : "Raft Master"}</h3>
                      <p className="badge-description text-xs text-muted-foreground leading-relaxed">
                        Understand leader elections, heartbeats, split-brain, and replicated logs.
                      </p>
                    </div>

                    <div className="mt-auto pt-2">
                      {isUnlocked ? (
                        <span className="badge-status-tag bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                          Earned
                        </span>
                      ) : (
                        <span className="badge-status-tag bg-white/5 text-muted-foreground border border-border/50 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </span>
                      )}
                    </div>
                  </Card>
                )
              })()}
            </div>

              {/* Binary Search Badge */}
              {(() => {
                const isUnlocked = unlockedBadges.includes('binary-search')
                return (
                  <Card
                    glass={isUnlocked}
                    className={cn(
                      "badge-card p-5 flex flex-col items-center text-center gap-4 transition-all duration-300 relative overflow-hidden",
                      isUnlocked
                        ? "border-amber-500/30 bg-gradient-to-br from-card to-amber-500/5 hover:-translate-y-1 hover:border-amber-500/50"
                        : "opacity-40 bg-muted/20 border-border/40 hover:opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300",
                      isUnlocked ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/2 text-muted-foreground border-border/80"
                    )}>
                      {isUnlocked ? <Award size={32} className="animate-pulse" /> : <Lock size={26} />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-foreground">Binary Search Pro</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Master O(log n) search, mid calculation, and pointer mechanics.</p>
                    </div>
                    <div className="mt-auto pt-2">
                      {isUnlocked ? (
                        <span className="bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase">Earned</span>
                      ) : (
                        <span className="bg-white/5 text-muted-foreground border border-border/50 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1"><Lock size={10} /> Locked</span>
                      )}
                    </div>
                  </Card>
                )
              })()}

              {/* Dot Product Badge */}
              {(() => {
                const isUnlocked = unlockedBadges.includes('dot-product')
                return (
                  <Card
                    glass={isUnlocked}
                    className={cn(
                      "badge-card p-5 flex flex-col items-center text-center gap-4 transition-all duration-300 relative overflow-hidden",
                      isUnlocked
                        ? "border-amber-500/30 bg-gradient-to-br from-card to-amber-500/5 hover:-translate-y-1 hover:border-amber-500/50"
                        : "opacity-40 bg-muted/20 border-border/40 hover:opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300",
                      isUnlocked ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/2 text-muted-foreground border-border/80"
                    )}>
                      {isUnlocked ? <Award size={32} className="animate-pulse" /> : <Lock size={26} />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-foreground">Dot Product Master</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Master FOV cones, angle detection, and vector math used in games and ML.</p>
                    </div>
                    <div className="mt-auto pt-2">
                      {isUnlocked ? (
                        <span className="bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase">Earned</span>
                      ) : (
                        <span className="bg-white/5 text-muted-foreground border border-border/50 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1"><Lock size={10} /> Locked</span>
                      )}
                    </div>
                  </Card>
                )
              })()}
          </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
      {!activeTab.startsWith('lesson-') && (
        <TopBar 
          totalXp={xp} 
          isLoggedIn={isLoggedIn} 
          user={user} 
          onLogout={logout} 
        />
      )}
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300">
        {renderActivePage()}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  )
}

export default App
