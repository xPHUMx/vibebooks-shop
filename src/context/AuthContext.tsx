'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileSyncing: boolean;
  isRealUser: boolean;
  canSwitchRoles: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: any) => void;
  closeAuthModal: () => void;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string, fullName?: string, purpose?: 'signin' | 'signup', consentInfo?: { agreedTerms?: boolean; agreedPrivacy?: boolean }) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otpCode: string, fullName?: string, purpose?: 'signin' | 'signup', consentInfo?: { agreedTerms?: boolean; agreedPrivacy?: boolean }) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileSyncing, setIsProfileSyncing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  const syncPromiseRef = useRef<{ id: string; promise: Promise<void> } | null>(null);
  const termsAcceptedRef = useRef<boolean>(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const supabase = createClient();
      setIsLoading(true);

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
              await fetchAndSyncProfile(data.session.user, true);
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
              await fetchAndSyncProfile(session.user, true);
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
      }
      setIsLoading(false);

      // 2. Listen to auth state changes in realtime
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
        if (newSession?.user) {
          setUser(newSession.user);
          setIsAuthModalOpen(false);
          await fetchAndSyncProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          termsAcceptedRef.current = false;
          syncPromiseRef.current = null;
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('Auth initialization warning:', err);
      setIsLoading(false);
      setIsProfileSyncing(false);
    }
  };

  /**
   * Fetch Real Profile from Supabase public.profiles table
   * Single-flight deduplicated to avoid parallel race condition clobbering
   */
  const fetchAndSyncProfile = async (authUser: any, force = false) => {
    if (!authUser?.id) return;

    // Single-flight deduplication: reuse active promise for same user
    const activeSync = syncPromiseRef.current;
    if (!force && activeSync && activeSync.id === authUser.id) {
      await activeSync.promise;
      return;
    }

    setIsProfileSyncing(true);

    const task = (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!error && data) {
          const userRole = (data.role as 'user' | 'merchant' | 'admin') || 'user';
          const hasTerms = Boolean(data.terms_accepted_at || termsAcceptedRef.current);
          if (hasTerms) termsAcceptedRef.current = true;

          setProfile((prev) => ({
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
            termsAcceptedAt: hasTerms ? (data.terms_accepted_at || prev?.termsAcceptedAt || new Date().toISOString()) : null,
            privacyAcceptedAt: hasTerms ? (data.privacy_accepted_at || prev?.privacyAcceptedAt || new Date().toISOString()) : null,
            createdAt: data.created_at,
          }));
        } else {
          // Auto-create / upsert real profile in Supabase table via server API
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
              const hasTerms = Boolean(resData.profile.termsAcceptedAt || termsAcceptedRef.current);
              if (hasTerms) termsAcceptedRef.current = true;
              setProfile((prev) => ({
                ...resData.profile,
                termsAcceptedAt: hasTerms ? (resData.profile.termsAcceptedAt || prev?.termsAcceptedAt) : null,
                privacyAcceptedAt: hasTerms ? (resData.profile.privacyAcceptedAt || prev?.privacyAcceptedAt) : null,
              }));
              return;
            }
          } catch (syncErr) {
            console.warn('Auto profile sync API notice:', syncErr);
          }

          // Fallback if network or server unavailable
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
      } finally {
        setIsProfileSyncing(false);
      }
    })();

    syncPromiseRef.current = { id: authUser.id, promise: task };
    await task;
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

  const sendOtp = async (
    email: string,
    fullName?: string,
    purpose: 'signin' | 'signup' = 'signin',
    consentInfo?: { agreedTerms?: boolean; agreedPrivacy?: boolean }
  ) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, purpose, ...consentInfo }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'ไม่สามารถส่ง OTP ได้' };
    }
  };

  const verifyOtp = async (
    email: string,
    otpCode: string,
    fullName?: string,
    purpose: 'signin' | 'signup' = 'signin',
    consentInfo?: { agreedTerms?: boolean; agreedPrivacy?: boolean }
  ) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode, fullName, purpose, ...consentInfo }),
      });
      const data = await res.json();
      if (!data.success) return data;

      // Use the magic link token to establish a real Supabase session client-side
      const supabase = createClient();
      if (data.token) {
        try {
          const { data: sessionData, error } = await supabase.auth.verifyOtp({
            type: 'magiclink',
            token_hash: data.tokenHash,
          });
          if (!error && sessionData?.session?.user) {
            setUser(sessionData.session.user);
            await fetchAndSyncProfile(sessionData.session.user);
            return { success: true, isNewUser: data.isNewUser };
          }
        } catch {}
      }

      // Fallback: use email OTP method directly via Supabase
      // (works if the action_link contains a valid token)
      if (data.actionLink) {
        try {
          const linkUrl = new URL(data.actionLink);
          const emailToken = linkUrl.searchParams.get('token');
          if (emailToken) {
            const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
              email,
              token: emailToken,
              type: 'magiclink',
            });
            if (!verifyErr && verifyData?.session?.user) {
              setUser(verifyData.session.user);
              await fetchAndSyncProfile(verifyData.session.user);
              return { success: true, isNewUser: data.isNewUser };
            }
          }
        } catch {}
      }

      // Last resort: manually set user state from returned data (profile-only mode)
      if (data.userId) {
        const fakeUser = {
          id: data.userId,
          email: data.email,
          user_metadata: {
            full_name: data.fullName,
            avatar_url: data.avatarUrl,
          },
        };
        setUser(fakeUser);
        await fetchAndSyncProfile(fakeUser);
        return { success: true, isNewUser: data.isNewUser };
      }

      return { success: false, error: 'ไม่สามารถสร้าง session ได้ กรุณาลองใหม่' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'การยืนยัน OTP ล้มเหลว' };
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
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.startsWith('booksangdai_consent_'));
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
    if (updates.termsAcceptedAt) {
      termsAcceptedRef.current = true;
    }
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
            termsAcceptedAt: updates.termsAcceptedAt,
            privacyAcceptedAt: updates.privacyAcceptedAt,
          }),
        });
        const data = await res.json();
        if (data.success && data.profile) {
          const hasTerms = Boolean(data.profile.termsAcceptedAt || updates.termsAcceptedAt || termsAcceptedRef.current);
          setProfile((prev) => ({
            ...data.profile,
            termsAcceptedAt: hasTerms ? (data.profile.termsAcceptedAt || updates.termsAcceptedAt || prev?.termsAcceptedAt) : null,
            privacyAcceptedAt: hasTerms ? (data.profile.privacyAcceptedAt || updates.privacyAcceptedAt || prev?.privacyAcceptedAt) : null,
          }));
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
        isProfileSyncing,
        isRealUser: !!user,
        canSwitchRoles: profile?.role === 'admin',
        isAuthModalOpen,
        authModalTab,
        openAuthModal: (tab?: any) => {
          if (tab === 'signin' || tab === 'signup') {
            setAuthModalTab(tab);
          }
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => setIsAuthModalOpen(false),
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        sendOtp,
        verifyOtp,
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
