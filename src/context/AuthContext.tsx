'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isRealUser: boolean;
  canSwitchRoles: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (tab?: any) => void;
  closeAuthModal: () => void;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const supabase = createClient();
      
      // 0. Intercept OAuth callback parameters if browser redirected to /?code=... or /#access_token=...
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hash = window.location.hash;

        if (code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.session?.user) {
              window.history.replaceState({}, document.title, window.location.pathname);
              setUser(data.session.user);
              await fetchAndSyncProfile(data.session.user);
              setIsLoading(false);
              if (window.location.pathname === '/auth/login') {
                window.location.href = '/profile';
              }
              return;
            }
          } catch (codeErr) {
            console.warn('Direct client code exchange notice:', codeErr);
          }
        } else if (hash && hash.includes('access_token')) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              window.history.replaceState({}, document.title, window.location.pathname);
              setUser(session.user);
              await fetchAndSyncProfile(session.user);
              setIsLoading(false);
              if (window.location.pathname === '/auth/login') {
                window.location.href = '/profile';
              }
              return;
            }
          } catch (hashErr) {
            console.warn('Direct hash token parse notice:', hashErr);
          }
        }
      }

      // 1. Real Supabase Auth Session from client storage
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchAndSyncProfile(session.user);
        setIsLoading(false);
      } else {
        // Fallback: Verify if Server has active session via HTTP cookies only if sb cookie exists
        const hasAuthCookie = typeof document !== 'undefined' && document.cookie.includes('sb-');
        if (hasAuthCookie) {
          try {
            const res = await fetch('/api/profile');
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.profile) {
                setUser({
                  id: data.profile.id,
                  email: data.profile.email,
                  user_metadata: {
                    full_name: data.profile.fullName,
                    avatar_url: data.profile.avatarUrl,
                  },
                });
                setProfile(data.profile);
              }
            }
          } catch (serverAuthErr) {
            console.warn('Server auth fallback check notice:', serverAuthErr);
          }
        }
        setIsLoading(false);
      }

      // 2. Listen to auth state changes in realtime
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
        if (newSession?.user) {
          setUser(newSession.user);
          await fetchAndSyncProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('Auth initialization warning:', err);
      setIsLoading(false);
    }
  };

  /**
   * Fetch Real Profile from Supabase public.profiles table
   * If profile row does not exist yet, auto-create it with real Google/Auth details
   */
  const fetchAndSyncProfile = async (authUser: any) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!error && data) {
        const userRole = (data.role as 'user' | 'merchant' | 'admin') || 'user';
        setProfile({
          id: data.id,
          email: data.email || authUser.email || '',
          fullName: data.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
          avatarUrl: data.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
          role: userRole,
          merchantStatus: data.merchant_status || 'NONE',
          merchantAppliedAt: data.merchant_applied_at,
          storeName: data.store_name,
          storeDescription: data.store_description,
          promptPayId: data.promptpay_id,
          storeLogoUrl: data.store_logo_url || authUser.user_metadata?.store_logo_url || '',
          createdAt: data.created_at,
        });
      } else {
        // Auto-create / upsert real profile in Supabase table
        const defaultName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        const defaultAvatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '';
        
        try {
          const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: authUser.id,
              email: authUser.email,
              fullName: defaultName,
              avatarUrl: defaultAvatar,
              role: 'user',
            }),
          });
          const resData = await res.json();
          if (resData.success && resData.profile) {
            setProfile(resData.profile);
            return;
          }
        } catch (syncErr) {
          console.warn('Auto profile sync API notice:', syncErr);
        }

        // Fallback local representation while syncing
        setProfile({
          id: authUser.id,
          email: authUser.email || '',
          fullName: defaultName,
          avatarUrl: defaultAvatar,
          role: 'user',
          merchantStatus: 'NONE',
        });
      }
    } catch (e) {
      console.warn('Error fetching real user profile:', e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchAndSyncProfile(user);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      const supabase = createClient();
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const destination = redirectTo || (currentPath === '/' || currentPath === '/auth/login' ? '/profile' : currentPath);
      const redirectUri = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth error:', error.message);
        throw error;
      }
    } catch (error) {
      console.warn('Google sign in warning:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (fullName: string, email: string, password: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        if (data.session) {
          setUser(data.user);
        }

        // Auto-create / sync real profile in Supabase table
        await fetchAndSyncProfile({
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            full_name: fullName,
          },
        });
      }

      return {
        success: true,
        user: data?.user,
        requiresEmailConfirmation: !data?.session,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'การสมัครสมาชิกล้มเหลว' };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        await fetchAndSyncProfile(data.user);
      }

      return { success: true, user: data?.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
        keys.forEach(k => localStorage.removeItem(k));
        document.cookie.split(';').forEach(c => {
          const name = c.split('=')[0].trim();
          if (name.startsWith('sb-')) {
            document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
          }
        });
      } catch {}
    }
    setUser(null);
    setProfile(null);
  };

  /**
   * Update Profile in Supabase
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    // 1. Optimistic UI update
    setProfile((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });

    // 2. Persist to real Supabase database
    if (user?.id) {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email || updates.email,
            fullName: updates.fullName,
            avatarUrl: updates.avatarUrl,
            role: updates.role,
            storeName: updates.storeName,
            storeDescription: updates.storeDescription,
            promptPayId: updates.promptPayId,
            storeLogoUrl: updates.storeLogoUrl,
          }),
        });
        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      } catch (e) {
        console.warn('Real Supabase profile update error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isRealUser: !!user,
        canSwitchRoles: profile?.role === 'admin',
        isAuthModalOpen,
        openAuthModal: (_tab?: 'signin' | 'signup') => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
