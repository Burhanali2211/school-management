"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define UserType for client-side compatibility
type UserType = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

interface User {
  id: string;
  username: string;
  userType: UserType;
  email?: string;
  name: string;
  surname: string;
}

interface Session {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  activeSessions: Session[];
  isLoading: boolean;
  isAuthenticated: boolean;
  mounted: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check authentication status on mount and periodically
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSession(data.currentSession);
        setActiveSessions(data.activeSessions || []);
      } else if (response.status === 401) {
        // Not authenticated
        setUser(null);
        setSession(null);
        setActiveSessions([]);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On network error, don't clear auth state to prevent unexpected logouts
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get session info including active sessions
  const getSessionInfo = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/auth/session-info', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.currentSession);
        setActiveSessions(data.activeSessions || []);
      }
    } catch (error) {
      console.error('Failed to get session info:', error);
    }
  }, [user]);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await getSessionInfo();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getSessionInfo]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setSession(null);
      setActiveSessions([]);
      setIsLoading(false);
      router.push('/sign-in');
    }
  }, [router]);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    await checkAuth();
    await getSessionInfo();
  }, [checkAuth, getSessionInfo]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth on mount
  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [mounted, checkAuth]);

  // Periodically check session validity (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAuth]);

  // Get fresh session info when user changes
  useEffect(() => {
    if (user) {
      getSessionInfo();
    }
  }, [user, getSessionInfo]);

  const value: AuthContextType = {
    user,
    session,
    activeSessions,
    isLoading,
    isAuthenticated,
    mounted,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;