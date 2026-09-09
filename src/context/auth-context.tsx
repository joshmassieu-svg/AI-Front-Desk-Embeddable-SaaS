'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  UserCredential,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>;
  signup: (email: string, pass: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Re-POST the current ID token to /api/auth/session to refresh cookies. */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * POST the user's current ID token to /api/auth/session.
 * The server verifies it and (re)sets __session + __onboarded cookies.
 * Fire-and-forget safe — errors are logged but never surface to the UI.
 */
async function syncSessionCookie(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch (err) {
    console.error('[auth] Failed to sync session cookie:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // onIdTokenChanged fires on login, logout, AND every time Firebase
    // silently refreshes the ID token (~every 1 hour). This keeps the
    // __session cookie alive as long as the user stays logged in.
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync cookie whenever the token is issued or refreshed.
        await syncSessionCookie(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    // Establish the __session/__onboarded cookies BEFORE returning control
    // to the caller. Callers (login/signup pages) navigate to /dashboard
    // right after this resolves, and the middleware there checks those
    // cookies synchronously — if we relied solely on the onIdTokenChanged
    // listener to set them, there'd be a race where the redirect happens
    // before the cookie POST lands, bouncing the user back to /login.
    await syncSessionCookie(cred.user);
    return cred;
  };

  const signup = async (email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await syncSessionCookie(cred.user);
    return cred;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await syncSessionCookie(cred.user);
    return cred;
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    // Clear the middleware cookies so the next /dashboard request is
    // immediately redirected to /login without a stale __session cookie.
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (err) {
      console.error('[auth] Failed to clear session cookie on logout:', err);
    }
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const refreshSession = async () => {
    if (user) await syncSessionCookie(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshSession,
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

