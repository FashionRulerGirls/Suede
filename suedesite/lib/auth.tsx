'use client';
/* Suede auth — wraps the Supabase browser client and exposes the session,
   the signed-in user's profile, and the auth actions the screens call.
   Falls back cleanly when Supabase isn't configured (null client). */
import React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
} | null;

type AuthValue = {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile;
  recovery: boolean;
  clearRecovery: () => void;
  reloadProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    meta?: { display_name?: string },
  ) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile>(null);
  const [ready, setReady] = React.useState(false);
  const [recovery, setRecovery] = React.useState(false);

  React.useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setReady(true); }
    });
    // The browser client processes the URL after email/OAuth redirects
    // (detectSessionInUrl) and emits the event that signs the user in.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [supabase]);

  const loadProfile = React.useCallback(async () => {
    if (!supabase || !session?.user) { setProfile(null); return; }
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .eq('id', session.user.id)
      .single();
    setProfile((data as any) ?? null);
  }, [supabase, session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => { loadProfile(); }, [loadProfile]);

  const value: AuthValue = {
    configured: !!supabase,
    ready,
    session,
    user: session?.user ?? null,
    profile,
    recovery,
    clearRecovery: () => setRecovery(false),
    reloadProfile: loadProfile,
    async signIn(email, password) {
      if (!supabase) return { error: 'Sign-in is not available yet.' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    async signUp(email, password, meta) {
      if (!supabase) return { error: 'Sign-up is not available yet.', needsConfirm: false };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta,
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) return { error: error.message, needsConfirm: false };
      // If email confirmation is on, there's no session yet.
      return { error: null, needsConfirm: !data.session };
    },
    async signInWithOAuth(provider) {
      if (!supabase) return { error: 'Sign-in is not available yet.' };
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined },
      });
      return { error: error?.message ?? null };
    },
    async resetPassword(email) {
      if (!supabase) return { error: 'Not available yet.' };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      });
      return { error: error?.message ?? null };
    },
    async updatePassword(password) {
      if (!supabase) return { error: 'Not available yet.' };
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut();
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
