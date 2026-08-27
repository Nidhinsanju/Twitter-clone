"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signup: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (data: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Check for an existing session once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const signup = useCallback(
    async (data: { name: string; username: string; email: string; password: string }) => {
      const { user } = await api.signup(data);
      setUser(user);
    },
    []
  );

  const login = useCallback(async (data: { identifier: string; password: string }) => {
    const { user } = await api.login(data);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((user: User) => setUser(user), []);

  const value = useMemo(
    () => ({ user, loading, signup, login, logout, refreshUser, updateUser }),
    [user, loading, signup, login, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
