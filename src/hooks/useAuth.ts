import { useState, useCallback } from 'react';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  picture: string;
}

export interface ProgressData {
  xp: number;
  unlockedBadges: string[];
  completedLessons: string[];
}

const API_URL = 'http://localhost:8787'; // Default wrangler local dev port

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('bitbrain_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bitbrain_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sign out helper
  const logout = useCallback(() => {
    localStorage.removeItem('bitbrain_token');
    localStorage.removeItem('bitbrain_user');
    setToken(null);
    setUser(null);
  }, []);

  // Exchange Google credential token for our API Session token
  const loginWithGoogle = useCallback(async (googleCredential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: googleCredential })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to authenticate with backend');
      }

      const data = await response.json();
      localStorage.setItem('bitbrain_token', data.token);
      localStorage.setItem('bitbrain_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error during authentication';
      setError(errorMessage);
      logout();
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Fetch progress from cloud
  const fetchCloudProgress = useCallback(async (): Promise<ProgressData | null> => {
    if (!token) return null;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        logout(); // Token expired or invalid
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  // Save progress to cloud
  const syncCloudProgress = useCallback(async (xpValue: number, badgesList: string[], lessonsList: string[]): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_URL}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          xp: xpValue,
          unlockedBadges: badgesList,
          completedLessons: lessonsList
        })
      });
      if (response.status === 401) {
        logout();
        return false;
      }
      return response.ok;
    } catch (e) {
      console.error('Failed to sync progress to cloud:', e);
      return false;
    }
  }, [token, logout]);

  return {
    user,
    token,
    isLoggedIn: !!token && !!user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    fetchCloudProgress,
    syncCloudProgress
  };
};
