import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import supabase from '../lib/supabaseClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      // 1. Try to restore an existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        if (!cancelled) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsLoading(false);
        }
        return;
      }

      // 2. No session — silently sign in anonymously so every guest
      //    gets a valid user ID and JWT immediately.
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!cancelled) {
          if (error) {
            console.warn('Anonymous sign-in failed:', error.message);
          }
          // onAuthStateChange will fire and update state —
          // but set what we have now so the loading spinner resolves.
          setSession(data.session);
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Anonymous sign-in error:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth state changes (covers sign-in, sign-out, updateUser, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAnonymous = user?.is_anonymous ?? false;

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAnonymous,
      signOut,
    }),
    [user, session, isLoading, isAnonymous],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
