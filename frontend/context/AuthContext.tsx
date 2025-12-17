"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUser, loginUser, logoutUser, refreshUserToken } from "@/lib/api/users";
import { LoginBody } from "@/lib/api/types/user";

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  level?: number;
  universityId?: string;
};

interface AuthContextType {
  user: User | null; // You can type it properly with User interface
  loading: boolean;
  login: (body: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const userData = await getUser();
      setUser(userData);
      setLoading(false);
    }
    loadUser();
  }, []);

  // Login
  const login = async (body: LoginBody) => {
    const res = await loginUser(body);
    if (res.success) {
      const userData = await getUser();
      setUser(userData);
    }
  };

  // Logout
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Refresh token
  const refresh = async () => {
    await refreshUserToken();
    const userData = await getUser();
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};