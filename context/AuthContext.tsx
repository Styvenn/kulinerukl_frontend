'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiPost, apiGet, apiDelete } from '@/lib/api';

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
  toggleBookmark: (restaurantId: string) => Promise<boolean>;
  isBookmarked: (restaurantId: string) => boolean;
  updateProfile: (name: string, email: string) => void;
}

// ─── API Response Types ───────────────────────────────────────────────────────
interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

interface BookmarkItem {
  culinaryPlaceId: string;
  [key: string]: unknown;
}

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
      if (storedUser) {
        const parsedUser: UserProfile = JSON.parse(storedUser);
        setUser(parsedUser);
        // Load bookmarks from API after rehydrating user
        loadBookmarks();
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load Bookmarks ──────────────────────────────────────────────────────────
  const loadBookmarks = useCallback(async () => {
    try {
      const res: any = await apiGet('/bookmarks');
      const data = Array.isArray(res) ? res : (res?.data || []);
      const ids = data.map((b: any) => b.culinaryPlaceId);
      setBookmarks(ids);
    } catch {
      // Non-critical: silently fail (guest or token expired)
      setBookmarks([]);
    }
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<any>('/auth/login', { email, password });
    const responseData = res.data || res;

    const { access_token, user: userProfile } = responseData;

    // Persist session
    localStorage.setItem('lth_token', access_token);
    localStorage.setItem('lth_user', JSON.stringify(userProfile));

    setUser(userProfile);

    // Fetch bookmarks after successful login
    await loadBookmarks();
  }, [loadBookmarks]);

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setBookmarks([]);
    localStorage.removeItem('lth_user');
    localStorage.removeItem('lth_token');
    localStorage.removeItem('lth_bookmarks');
  }, []);

  // ─── Toggle Bookmark ─────────────────────────────────────────────────────────
  const toggleBookmark = useCallback(
    async (restaurantId: string): Promise<boolean> => {
      const alreadyBookmarked = bookmarks.includes(restaurantId);

      try {
        if (alreadyBookmarked) {
          await apiDelete(`/bookmarks/${restaurantId}`);
          setBookmarks((prev) => prev.filter((id) => id !== restaurantId));
          return false;
        } else {
          await apiPost('/bookmarks', { culinaryPlaceId: restaurantId });
          setBookmarks((prev) => [...prev, restaurantId]);
          return true;
        }
      } catch (err) {
        // Re-throw so the caller can show an error toast
        throw err;
      }
    },
    [bookmarks]
  );

  // ─── Is Bookmarked ───────────────────────────────────────────────────────────
  const isBookmarked = useCallback(
    (restaurantId: string) => bookmarks.includes(restaurantId),
    [bookmarks]
  );

  // ─── Update Profile (local only — PATCH /users/me endpoint not yet available) ─
  const updateProfile = useCallback((name: string, email: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, name, email };
      localStorage.setItem('lth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const role: UserRole = (user?.role?.toLowerCase() as UserRole) ?? 'guest';

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
