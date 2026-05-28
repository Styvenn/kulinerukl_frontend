'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'guest' | 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  bookmarks: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  toggleBookmark: (restaurantId: string) => boolean;
  isBookmarked: (restaurantId: string) => boolean;
  updateProfile: (name: string, email: string) => void;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────
const MOCK_USERS: Record<string, UserProfile & { password: string }> = {
  'user@mail.com': {
    id: 'u1',
    name: 'Budi Santoso',
    email: 'user@mail.com',
    password: 'user123',
    avatar: '',
    role: 'user',
  },
  'admin@mail.com': {
    id: 'a1',
    name: 'Admin Platform',
    email: 'admin@mail.com',
    password: 'admin123',
    avatar: '',
    role: 'admin',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('lth_user');
      const storedBookmarks = localStorage.getItem('lth_bookmarks');
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
    } catch {
      // ignore parse errors
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((res) => setTimeout(res, 900)); // simulate network latency

    const found = MOCK_USERS[email.toLowerCase()];
    if (!found || found.password !== password) {
      throw new Error('Email atau password salah. Coba lagi.');
    }

    const { password: _pw, ...profile } = found;
    setUser(profile);

    // Persist session
    localStorage.setItem('lth_user', JSON.stringify(profile));
    localStorage.setItem('lth_token', `fake-jwt-${profile.id}-${Date.now()}`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setBookmarks([]);
    localStorage.removeItem('lth_user');
    localStorage.removeItem('lth_token');
    localStorage.removeItem('lth_bookmarks');
  }, []);

  const toggleBookmark = useCallback(
    (restaurantId: string): boolean => {
      let added = false;
      setBookmarks((prev) => {
        const exists = prev.includes(restaurantId);
        const next = exists
          ? prev.filter((id) => id !== restaurantId)
          : [...prev, restaurantId];
        localStorage.setItem('lth_bookmarks', JSON.stringify(next));
        added = !exists;
        return next;
      });
      return added;
    },
    []
  );

  const isBookmarked = useCallback(
    (restaurantId: string) => bookmarks.includes(restaurantId),
    [bookmarks]
  );

  const updateProfile = useCallback((name: string, email: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, name, email };
      localStorage.setItem('lth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const role: UserRole = user?.role ?? 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        bookmarks,
        login,
        logout,
        toggleBookmark,
        isBookmarked,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
